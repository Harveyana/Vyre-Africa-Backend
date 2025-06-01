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
import { getPaymentMethodByCurrency, getISOByCountry } from '../utils';
import transactionService from '../services/transaction.service';
import fernService from '../services/fern.service';


class SwapController {


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


  async addFiatAccount(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {
      accountNumber,

      routingNumber,
      bicSwift,
      sortCode,
      institutionNumber,
      bsbNumber,
      ifscCode,
      clabeNumber,
      cnapsCode,
      pixCode,
      clearingCode,

      bankName,
      currency,
      type,
      Address,
    } = req.body
      

    try {

      if(!bankName || !currency || !type || !Address){
        return res.status(400)
        .json({
          msg: 'Incomplete Details',
          success: false,
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if(!userData){
        return res.status(400)
          .json({
            msg: 'User not found',
            success: false,
          });
      }
  
      const account = await fernService.fiatAccount(
        {
          userId:user.id,
          bankName,
          accountNumber,
          currency,
          bankAddress: {
            country: getISOByCountry(userData?.country as string),
            addressLine1: Address.addressLine1,
            addressLine2: Address.addressLine2,
            city: Address.city,
            state: Address.state,
            postalCode: Address.postalCode,
            locale: "en-US"
          },

          ...(userData?.country === 'United States' && { routingNumber }),
          ...(userData?.country === 'Nigeria' && { nubanNumber: accountNumber }),
          ...(userData?.country === 'United Kingdom' && { sortCode }),
          ...(userData?.country === 'Australia' && { bsbNumber }),
          ...(userData?.country === 'Canada' && { institutionNumber }),
          ...(userData?.country === 'India' && { ifscCode }),
          ...(userData?.country === 'Mexico' && { clabeNumber }),
          ...(userData?.country === 'China' && { cnapsCode }),
          ...(userData?.country === 'Brazil' && { pixCode }),
          ...(userData?.country === 'Hong Kong' && { clearingCode }),
          ...(bicSwift && { bicSwift }),
          accountType: type,
          bankMethod: getPaymentMethodByCurrency(currency as string) || ''
      
        }
      )

      const fiatAccount = await prisma.fiatAccount.create({
        data:{
          id: account.paymentAccountId,
          name: account.nickname,
          bank: account.externalBankAccount.bankName,
          accountNumber: account.externalBankAccount.bankAccountMask,
          currency,
          method:account.externalBankAccount.bankAccountPaymentMethod,
          country: userData?.country!,
          userId: user.id
        }
      })

      return res
        .status(200)
        .json({
          msg: 'Account Added Successfully',
          success: true,
          account
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

  async addCryptoAccount(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {
      chain,
      address
    } = req.body

    try {

      if(!chain || !address){
        return res.status(400)
        .json({
          msg: 'Incomplete Details',
          success: false,
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: user.id }
      })
  
      const account = await fernService.cryptoAccount(
        {
          userId:user.id,
          chain,
          address      
        }
      )

      await prisma.cryptoAccount.create({
        data:{
          id: account.paymentAccountId,
          name: account.nickname,
          cryptoWalletType: account.cryptoWalletType,
          chain:account.chain,
          address:account.address,   
          userId: user.id
        }
      })

      return res
        .status(200)
        .json({
          msg: 'Account Added Successfully',
          success: true,
          account
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

  

 
}

export default new SwapController();