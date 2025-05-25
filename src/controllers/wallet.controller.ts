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
import {createHmac} from 'node:crypto';
import { generateRefCode, generateSignature, isValidSignature } from '../utils';
import transactionService from '../services/transaction.service';
import fernService from '../services/fern.service';

class WalletController {


  async fern_WebHook(req: Request | any, res: Response) {

    const signature = req.header("x-api-signature");
    const timestamp = req.header("x-api-timestamp");
    const rawBody = req.body.toString(); //

    console.log('webhook body',req.body)

    // if (!signature || !timestamp || !isValidSignature(rawBody, timestamp, signature, config.fern.Secret)) {
    //   console.error("Invalid webhook signature – request possibly forged!");
    //   return res.sendStatus(400); // reject if signature doesn't match
    // }


    try {
      const { body } = req;
      

      // Customer Events

      if(body.type === 'customer.created'){
        const customer = body.resource

        const updated = fernService.customer_Created(
          customer.customerId,
          customer.customerStatus,
          customer.kycLink,
          customer.email
        )

        return res.status(200).json({
          msg: 'Event Successful',
          success: true,
        });

      }

      if(body.type === 'customer.updated'){
        const customer = body.resource

        const updated = fernService.customer_updated(
          customer.customerStatus,
          customer.email
        )

        return res.status(200).json({
          msg: 'Event Successful',
          success: true,
        });
      }


      if(body.type === 'payment_account.created'){

      }

      if(body.type === 'payment_account.deleted'){

      }

      if(body.type === 'transaction.created'){

      }

      if(body.type === 'transaction.updated'){

      }

      if(body.type === 'transaction.updated'){

      }


      // FOR FIAT WITHDRAWAL 

      // if(body.type === 'payout'){

      //   if(body.event_type === 'payout.created'){

      //     const user = await prisma.user.findFirst({
      //       where:{email:body.client.email}
      //     })
  
      //     const wallet = await prisma.wallet.findFirst({
      //       where:{
      //         currency: body.payment.currency,
      //         userId: user?.id
      //       }
      //     })
      //     // record transaction
      //     const transaction = await prisma.transaction.create({
      //       data:{
      //         userId: user?.id,
      //         currency: wallet?.currency!,
      //         amount: body?.payment.amount/100,
      //         reference: body.id,
      //         status: 'PENDING',
      //         walletId: wallet?.id,
      //         type:'FIAT_WITHDRAWAL',
      //         description:`${wallet?.currency} withdrawal transfer`
      //       }
      //     })


      //   }else if(body.event_type === 'payout.success'){

      //     const transaction = await prisma.transaction.findFirst({
      //       where:{reference: body.id}
      //     })
      //     // debit user wallet
      //     await walletService.debit_Wallet(transaction?.amount as any, transaction?.walletId!)

      //     await prisma.transaction.update({
      //       where:{id:transaction?.id},
      //       data:{status: 'SUCCESSFUL',}
      //     })

      //   }else{

      //     const transaction = await prisma.transaction.findFirst({
      //       where:{reference: body.id}
      //     })
          
      //     await prisma.transaction.update({
      //       where:{id:transaction?.id},
      //       data:{status: 'FAILED',}
      //     })

      //   }

      // }
      
  
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

  async qorepay_WebHook(req: Request | any, res: Response) {

    async function verifySignature(content: any, signature: string) {
      try {
        // Step 1: Get the public key from the provided URL
        const publicKey = config.QOREPAY_PUBLIC_KEY as string;
        // Step 2: Decode the Base64-encoded signature
        const decodedSignature = Buffer.from(signature, "base64");
    
        // Step 3: Create a verifier object with RSA + SHA256
        const verifier = crypto.createVerify("RSA-SHA256");
    
        // Step 4: Update the verifier with the raw request body (exact form received)
        verifier.update(content);
    
        // Step 5: Verify the signature using the public key
        const isVerified = verifier.verify(publicKey, decodedSignature);
    
        return isVerified;
      } catch (error) {
        console.log("Error verifying signature:", error);
        return false;
      }
    }

    try {
      const { body } = req;

      console.log('body',body)

      const signatureHeader = req.headers["x-signature"] as string;

      const rawBody = JSON.stringify(req.body)
      // const rawBody = await req.json();

      const isValid = await verifySignature(rawBody, signatureHeader);

      console.log(isValid)

      // if (!isValid) {
      //   return res.status(401).json({ error: 'Invalid signature' });
      // }
      

      // FOR FIAT DEPOSITS 

      if(body.type === 'purchase'){

         if(body.event_type === 'purchase.paid'){

          const transaction = await prisma.transaction.findFirst({
            where:{reference: body.id}
          })
    
          console.log('transaction here', transaction)

          await walletService.credit_Wallet(transaction?.amount as any, transaction?.walletId!)

          const updatedTransaction = await prisma.transaction.update({
            where:{id:transaction?.id!},
            data:{status:'SUCCESSFUL'}
          })

        } 
        
        if(body.event_type === 'purchase.payment_failure'){

          const transaction = await prisma.transaction.findFirst({
            where:{reference: body.id}
          })
    
          console.log('transaction here', transaction)

          const updatedTransaction = await prisma.transaction.update({
            where:{id:transaction?.id!},
            data:{status:'FAILED'}
          })

        }

      }


      // FOR FIAT WITHDRAWAL 

      if(body.type === 'payout'){

        if(body.event_type === 'payout.created'){

          const user = await prisma.user.findFirst({
            where:{email:body.client.email}
          })
  
          const wallet = await prisma.wallet.findFirst({
            where:{
              currency: body.payment.currency,
              userId: user?.id
            }
          })
          // record transaction
          const transaction = await prisma.transaction.create({
            data:{
              userId: user?.id,
              currency: wallet?.currency!,
              amount: body?.payment.amount/100,
              reference: body.id,
              status: 'PENDING',
              walletId: wallet?.id,
              type:'FIAT_WITHDRAWAL',
              description:`${wallet?.currency} withdrawal transfer`
            }
          })


        }else if(body.event_type === 'payout.success'){

          const transaction = await prisma.transaction.findFirst({
            where:{reference: body.id}
          })
          // debit user wallet
          await walletService.debit_Wallet(transaction?.amount as any, transaction?.walletId!)

          await prisma.transaction.update({
            where:{id:transaction?.id},
            data:{status: 'SUCCESSFUL',}
          })

        }else{

          const transaction = await prisma.transaction.findFirst({
            where:{reference: body.id}
          })
          
          await prisma.transaction.update({
            where:{id:transaction?.id},
            data:{status: 'FAILED',}
          })

        }

      }
      
  
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

  async tatum_WebHook(req: Request, res: Response) {

    try {
      const { body } = req;

      console.log('body',body)

      // Step 3: Convert webhook body to stringify JSON
      const stringifybody = JSON.stringify(body);

      const xPayloadHash = req.headers['x-payload-hash'] as string;

      // Step 4: Calculate digest as a Base64 string using the HMAC Secret, the webhook payload, and the HMAC SHA512 algorithm.
      const base64Hash = createHmac("sha512", config.HMACSECRET as string)
      .update(JSON.stringify(body))
      .digest("base64");

      // Step 5: Compare x-payload-hash value with calculated digest as a Base64 string
      const checkValues = xPayloadHash == base64Hash;

      console.log(`x-payload-hash and base64Hash are equal? ${checkValues}`);

      // {
      //   "date": 1619176527481,
      //   "amount": "0.005",
      //   "currency": "BTC",
      //   "subscriptionType":"ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
      //   "accountId": "6082ab462936b4478117c6a0",
      //   "reference: "c9875708-4ba3-41c9-a4cd-271048b41b9a", // the reference of the transaction in the virtual account
      //   "txId": "45af182a0ffab58e5ba32fee57b297b2260c6e23a1de5ddc76c7ee22d72dea99",
      //   "blockHash": "45af182a0ffab58e5ba32fee57b297b2260c6e23a1de5ddc76c7ee22d72dea99", // the hash of the block, might not be present every time
      //   "blockHeight": 12345,
      //   "from": "SENDER_ADDRESS", // might not be present every time; not present for UTXO-based blockchains
      //   "to": "RECIPIENT_ADDRESS_CONNECTED_TO_LEDGER_ACCOUNT", // the blockchain address of the recipient
      //   "index": 5 // for UTXO-based blockchains (BCH, BTC, DOGE, LTC), this is the index of the output in the transaction
      // }
      

      

      // FOR ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION 


      if(body.subscriptionType === 'ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION'){

        const wallet = await prisma.wallet.findUnique({
          where:{id: body.accountId}
        })

        const transaction = await prisma.transaction.create({
          data:{
              userId: wallet?.userId,
              currency: wallet?.currency!,
              amount: body.amount,
              reference: body.reference,
              status: 'SUCCESSFUL',
              walletId: wallet?.id!,
              type:'CREDIT_PAYMENT',
              description:`ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION`
            }
        })
    
        console.log('transaction here', transaction)

      }
      
  
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

  async authorize_fiat_Withdrawal(req: Request & Record<string, any>, res: Response) {
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

      if(amount > walletExists.availableBalance){
        return res.status(400)
          .json({
            msg: 'Available balance not sufficient',
            success: false,
          });
      }
  
      const payUrl = await walletService.authorize_Withdrawal(currency, amount, userData?.email!, userData?.phoneNumber!)

      if(payUrl){

        return res
        .status(200)
        .json({
          msg: 'Authorised Successfully',
          success: true,
          url: payUrl
        });

      }else{
        return res
        .status(400)
        .json({
          msg: 'Operation Failed',
          success: false,
        });
      }
  
      

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
          amount
          // walletExists.id,
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

      const wallet = await walletService.getAccount(walletId)
      console.log('main wallet data', wallet)
      //  const wallet = await prisma.wallet.findUnique({
      //     where: {
      //       id: walletId
      //     }
      //   });

      // const wallet = await prisma.wallet.update({
      //   where: {
      //     id: walletId
      //   },
      //   data:{
      //     frozen: result.frozen,
      //     accountBalance:result.balance.accountBalance,
      //     availableBalance:result.balance.availableBalance
      //   }
      // });
      

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

  async fetchWalletByName(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const name = req.params.name;

    try {

      let wallet:any;

      wallet = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          currency: name as Currency
        }
      });

      if(!wallet){
        return res.status(400)
          .json({
            msg: 'wallet not found',
            success: false,
        });
      }

      wallet = await walletService.getAccount(wallet.id)
      console.log('main wallet data', wallet)
      

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

  async fetchTransactions(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const { walletId } = req.query;

    let transactions;

    try {

      if(walletId){

        transactions = await transactionService.getwalletRecords(walletId as string,20)
        
      }else{
        transactions = await transactionService.getUserRecords(user.id as string,20)
      }
      

      console.log('Fetched transactions: ', transactions);

      return res
        .status(200)
        .json({
          msg: 'transactions fetched Successfully',
          success: true,
          transactions
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

 
}

export default new WalletController();