import { PrismaClient } from '@prisma/client';
import { Paystack } from 'paystack-sdk';
import { Request, Response } from 'express';
import { KJUR } from 'jsrsasign'; 
import prisma from '../config/prisma.config';
import axios from "axios";
import orderService from '../services/order.service';
import paystackService from '../services/paystack.service';
import notificationService from '../services/notification.service';
import config from '../config/env.config';
import smsService from '../services/sms.service';
import mobilePushService from '../services/mobilePush.service';
import walletService from '../services/wallet.service';
import {Currency,walletType} from '@prisma/client';
import { subMinutes } from 'date-fns';
import * as crypto from 'crypto';
import { generateRefCode } from '../utils';

class WalletController {
  paystack: Paystack;

  constructor() {
    this.paystack = new Paystack(
      'sk_test_3425cf96b06b8ce98715964ed1255707871fc486',
    );
  }

  async verifyWebHook(req: Request, res: Response) {

    try {
      const { body } = req;

      console.log('body',body)

      const signatureHeader = req.headers['x-signature'] as string; 
  
      if (!body || !signatureHeader) {
        return res.status(400).json({ error: 'Missing payload or signature header' });
      }
  
      const signature = Buffer.from(signatureHeader, 'base64'); 
  
      // Stringify the body before hashing
      const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest(); 
  
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(hash);
      const isVerified = verifier.verify({ key: config.QOREPAY_PUBLIC_KEY as string, padding: crypto.constants.RSA_PKCS1_PADDING }, signature);
  
      if (!isVerified) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const transaction = await prisma.transaction.findFirst({
        where:{reference: body.id}
      })

      console.log('transaction here', transaction)
  
      // ... (your webhook processing logic here) ...
  
      return res.status(200).json({
        msg: 'Event verified',
        success: true,
      });
  
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: (error as Error).message 
      });
    }
  }


  async getRate(req: Request, res: Response) {
    const { currency, basePair, amount } = req.query;

    try {
      console.log('query',req.query)

      if (!currency || !basePair) {
        return res.status(400).json({ 
          success: false, 
          msg: "Currency and basePair are required query parameters." 
        });
      }
  

      const response = await walletService.getRate(currency as string, basePair as string)

      let convertedAmount: any | undefined;

      if (amount && !isNaN(Number(amount))) {
        convertedAmount = (Number(amount) * response.value).toFixed(2); 
      }

      

      return res
        .status(200)
        .json({
          msg:`rate fetched successfully`,
          success: true,
          rate:response,
          value: convertedAmount
        });


    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }


  async createWallet(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const currency = req.params.currency

    try {

      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      })
  
      const walletExists = await prisma.wallet.findFirst({
        where: { 
          userId: user.id,
          currency: currency as Currency
        }
      })
  
      if(walletExists){
        return res.status(400)
          .json({
            msg: `${currency} wallet already exists`,
            success: false,
          });
      }

      const result = await walletService.createWallet(user.id,currency as Currency)

      return res
        .status(200)
        .json({
          msg: 'Wallet created Successfully',
          success: true,
          wallet:result
        });

    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }

  async init_BankDeposit(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {currency,amount} = req.body

    if(!currency || !amount){
      return res.status(400)
        .json({
          msg: 'required details missing',
          success: false,
        });
    }

    try {

      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      })

      const wallet = await prisma.wallet.findFirst({
        where:{
          userId:userData?.id,
          currency
        }
      })
  
      const payment = await walletService.depositFiat
      (
        currency,
        amount,
        userData?.email!,
        userData?.id!, 
        wallet?.id!
      )
  
      return res
        .status(200)
        .json({
          msg: 'Deposit initiated Successfully',
          success: true,
          payment
        });

    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }

  async get_availableBanks(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {currency, amount} = req.body

    console.log(req.body)

    if(!currency || !amount){
      return res.status(400)
        .json({
          msg: 'required details missing',
          success: false,
        });
    }

    try {

      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      })

      const walletExists = await prisma.wallet.findFirst({
        where: { 
          userId: user.id,
          currency
        }
      })
  
      if(!walletExists){
        return res.status(400)
          .json({
            msg: 'User wallet does not exist',
            success: false,
          });
      }

      // if(amount > walletExists.availableBalance){
      //   return res.status(400)
      //     .json({
      //       msg: 'Available balance not sufficient',
      //       success: false,
      //     });
      // }
  
      const payment = await walletService.getBankList(currency, amount, userData?.email!, userData?.phoneNumber!)
  
      return res
        .status(200)
        .json({
          msg: 'Banks fetched Successfully',
          success: true,
          banks: payment.banks,
          url: payment.url
        });

    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }

  async init_VyreTransfer(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {
      amount,
      currency,
      receipient_id
    } = req.body;

    try {

      const walletExists = await prisma.wallet.findFirst({
        where: { 
          userId: user.id,
          currency
        }
      })
  
      if(!walletExists){
        return res.status(400)
          .json({
            msg: 'User wallet does not exist',
            success: false,
          });
      }

      if(amount > walletExists.availableBalance){
        return res.status(400)
          .json({
            msg: 'Available balance not sufficient',
            success: false,
          });
      }

      const result = await walletService.offchain_Transfer
        (
          user.id,
          receipient_id,
          currency,
          amount,
          walletExists.id,
        )

        return res
        .status(200)
        .json({
          msg: 'Transfer Successful',
          success: true,
          wallet:result
        });

    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }

  async init_BlockchainTransfer(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {
      amount,
      currency,
      address, 
      destinationTag
    } = req.body;

    try {

      const walletExists = await prisma.wallet.findFirst({
        where: { 
          userId: user.id,
          currency
        }
      })
  
      if(!walletExists){
        return res.status(400)
          .json({
            msg: 'User wallet does not exist',
            success: false,
          });
      }

      if(amount > walletExists.availableBalance){
        return res.status(400)
          .json({
            msg: 'Available balance not sufficient',
            success: false,
          });
      }

        if(currency === 'XRP' && !destinationTag){
          return res.status(400)
          .json({
            msg: 'destination_Tag required for ripple widthdrawal',
            success: false,
          });
        }

        // Handle crypto withdrawal logic here
        const result = await walletService.blockchain_Transfer
        (
          user.id,
          currency,
          amount,
          address,
          destinationTag
        )

        return res
        .status(200)
        .json({
          msg: 'Transfer Initiated',
          success: true,
          wallet:result
        });


    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }

  async init_BankTransfer(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {
      account_number,
      bank_code,
      recipient_name, 
      endpoint_url
    } = req.body;

    try {

        const result = await walletService.bank_Transfer
        (
          account_number,
          bank_code,
          recipient_name,
          endpoint_url
        )

        return res
        .status(200)
        .json({
          msg: 'Transfer Initiated',
          success: true,
          result
        });


    } catch (error) {
      console.log(error)
      res.status(500)
        .json({
          msg: 'Internal Server Error',
          success: false,
        });
    }
  }



  // async withdrawal(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const {
  //     TRANSFER_TYPE,
  //     AMOUNT,
  //     CURRENCY,
  //     RECEIPIENT_ID,
  //     BLOCKCHAIN,
  //     BANK,
  //     bank_Account_Number, 
  //     bank
  //   } = req.body;

  //   try {

  //     const walletExists = await prisma.wallet.findFirst({
  //       where: { 
  //         userId: user.id,
  //         currency: CURRENCY
  //       }
  //     })
  
  //     if(!walletExists){
  //       return res.status(400)
  //         .json({
  //           msg: 'User wallet does not exist',
  //           success: false,
  //         });
  //     }

  //     if(AMOUNT > walletExists.availableBalance){
  //       return res.status(400)
  //         .json({
  //           msg: 'Available balance not sufficient',
  //           success: false,
  //         });
  //     }

  //     if ( TRANSFER_TYPE == 'VYRE') {
  //       // offchain transfer
  //       if (!blockchain_Address) {
  //         return res.status(400)
  //         .json({
  //           msg: 'Blockchain address is required for crypto withdrawals',
  //           success: false,
  //         });
  //       }

  //       if(CURRENCY === 'XRP' && !destination_Tag){
  //         return res.status(400)
  //         .json({
  //           msg: 'destination_Tag required for ripple widthdrawal',
  //           success: false,
  //         });
  //       }

  //       // Handle crypto withdrawal logic here
  //       const result = await walletService.blockchain_Transfer
  //       (
  //         user.id,
  //         CURRENCY,
  //         AMOUNT,
  //         blockchain_Address,
  //         destination_Tag
  //       )

  //       return res
  //       .status(200)
  //       .json({
  //         msg: 'Withdrawal Initiated',
  //         success: true,
  //         wallet:result
  //       });



  //     }

  //     if (walletExists.type === 'CRYPTO' && TRANSFER_TYPE == 'BLOCKCHAIN') {
  //       // Crypto withdrawal
  //       if (!BLOCKCHAIN.address) {
  //         return res.status(400)
  //         .json({
  //           msg: 'Blockchain address is required for crypto withdrawals',
  //           success: false,
  //         });
  //       }

  //       if(CURRENCY === 'XRP' && !BLOCKCHAIN.destinationTag){
  //         return res.status(400)
  //         .json({
  //           msg: 'destination_Tag required for ripple widthdrawal',
  //           success: false,
  //         });
  //       }

  //       // Handle crypto withdrawal logic here
  //       const result = await walletService.blockchain_Transfer
  //       (
  //         user.id,
  //         CURRENCY,
  //         AMOUNT,
  //         BLOCKCHAIN.address,
  //         BLOCKCHAIN.destinationTag
  //       )

  //       return res
  //       .status(200)
  //       .json({
  //         msg: 'Withdrawal Initiated',
  //         success: true,
  //         wallet:result
  //       });



  //     }

  //     if (walletExists.type === 'FIAT' && TRANSFER_TYPE == 'BANK') {
  //       // Fiat withdrawal
  //       if (!bank_Account_Number || !bank) {
  //         return res.status(400)
  //         .json({
  //           msg: 'Bank account number and bank name are required for fiat withdrawals',
  //           success: false,
  //         });
  //       }
  //     }


  //       // Handle fiat withdrawal logic here
  //     // } else {
  //     //   return res.status(400).json({ error: 'Invalid withdrawal type' });
  //     // }



  
      
  //     // return res
  //     //   .status(200)
  //     //   .json({
  //     //     msg: 'Wallet created Successfully',
  //     //     success: true,
  //     //     wallet:result
  //     //   });

  //   } catch (error) {
  //     console.log(error)
  //     res.status(500)
  //       .json({
  //         msg: 'Internal Server Error',
  //         success: false,
  //       });
  //   }
  // }


  async fetchWallets(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const { type } = req.query;

    let wallets;

    try {

      if(type){
        wallets = await prisma.wallet.findMany({
          where: {
            userId: user.id,
            type: type as walletType
          }
        });
      }else{

        wallets = await prisma.wallet.findMany({
          where: {
            userId: user.id
          }
        });
      }
      

      console.log('Fetched wallets: ', wallets);

      return res
        .status(200)
        .json({
          msg: 'wallets fetched Successfully',
          success: true,
          wallets
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

  async fetchWallet(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const walletId = req.params.id;

    try {

      const result = await walletService.getAccount(walletId)
      console.log('main wallet data', result)
      //  const wallet = await prisma.wallet.findUnique({
      //     where: {
      //       id: walletId
      //     }
      //   });

      const wallet = await prisma.wallet.update({
        where: {
          id: walletId
        },
        data:{
          frozen: result.frozen,
          accountBalance:result.balance.accountBalance,
          availableBalance:result.balance.availableBalance
        }
      });
      

      console.log('Fetched wallets: ', wallet);

      let Balance_rate: any | undefined;
      let Available_Balance_rate: any | undefined;

      if(wallet?.type === 'CRYPTO' ){
        const response = await walletService.getRate(wallet?.currency, 'NGN')
      
        Balance_rate = `${wallet.accountingCurrency} ${(Number(wallet?.accountBalance) * response.value).toFixed(2)}`;
        Available_Balance_rate = `${wallet.accountingCurrency} ${(Number(wallet?.availableBalance) * response.value).toFixed(2)}`;
      }

      


      return res
        .status(200)
        .json({
          msg: 'wallet fetched Successfully',
          success: true,
          wallet,
          rate:{
            balance: Balance_rate,
            available: Available_Balance_rate
          }
          
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

 
}

export default new WalletController();


