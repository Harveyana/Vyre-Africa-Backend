import { Request, Response } from "express";
import { Paystack } from "paystack-sdk";
import config from "../config/env.config";
import prisma from '../config/prisma.config';
import { Prisma } from "@prisma/client";
import axios from "axios";
import { UserBank,UserStatus } from "@prisma/client";
import { generateRefCode } from "../utils";

const fernAxios = axios.create({
  baseURL: 'https://api.fernhq.com',
  headers: {
    'Authorization': `Bearer ${config.fern.Key}`,
    'Content-Type': 'application/json'
  }
});

class FernService {

  async customer(payload:{customerType:string,firstName:string,lastName:string,email:string}){
    
    const response = await fernAxios.post('/customers', payload)
    const result = response.data
    console.log(result)

    return result
  }

  async customer_Created(payload:{customerId:string, status:string, kycLink:string, email:string}){

    const {customerId,status,kycLink,email} = payload

    console.log('customer created',{
      customerId,
      status,
      kycLink,
      email
    })
    
    const updatedUser = await prisma.user.update({
      where:{email},
      data:{
        userStatus: status as UserStatus,
        fernUserId: customerId,
        fernKycLink: kycLink
      }
    })
    console.log(updatedUser)

    return true
  }

  async customer_updated(status:string, email:string){
    
    const updatedUser = await prisma.user.update({
      where:{email},
      data:{
        userStatus: status as UserStatus
      }
    })
    console.log(updatedUser)

    return true
  }

  async fiatAccount(payload:{
    userId:string,
    bankName:string,
    accountNumber:string,
    currency:string,
    addressLine1:string,
    addressLine2:string,
    city:string,
    state:string,
    postalCode:string,
    accountType:string,
    bankMethod:string,

  }){

    const user = await prisma.user.findUnique({
      where:{id:payload.userId}
    })

    const accountData = {
        paymentAccountType: "EXTERNAL_BANK_ACCOUNT",
        customerId: user?.fernUserId,
        nickname: `${payload.bankName} Savings Account`,
        externalBankAccount: {
          accountNumber: payload.accountNumber,
          bankName: payload.bankName,
          bankAccountCurrency: payload.currency,
          bankAddress: {
            country: user?.country,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            locale: "en-US"
          },
          bankAccountType: payload.accountType,
          bankAccountPaymentMethod: payload.bankMethod,
          bankAccountOwner: {
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            address: {
              country: user?.country,
              addressLine1: user?.address,
              // addressLine2: user?.addressLine2,
              city: user?.city,
              state: user?.state,
              postalCode: user?.postalCode,
              "locale": "en-US"
            },
            type: "INDIVIDUAL"
          }
          
        }
    }
    
    const response = await fernAxios.post('/payment-accounts', accountData)
    const result = response.data
    console.log(result)

    return result

  }

  async cryptoAccount(payload:{
    userId:string,
    chain:string,
    address:string
  }){

    const user = await prisma.user.findUnique({
      where:{id:payload.userId}
    })
      
    const accountData = {
      paymentAccountType: "EXTERNAL_CRYPTO_WALLET",
      customerId: user?.fernUserId,
      nickname: `${payload.chain} Account`,
      externalCryptoWallet: {
       cryptoWalletType: "EVM",
       chain: payload.chain,
       address: payload.address
      },
    }
          
    const response = await fernAxios.post('/payment-accounts', accountData)
    const result = response.data
    console.log(result)
      
    return result
      
  }

  // async payment_Account_Created(payload:{
  //   customerId: string, 
  //   paymentAccountId: string, 
  //   bankName?: string, 
  //   nickname: string
  //   accountMask?: string,
  //   currency: string,
  //   method?: string,

  //   cryptoWalletType ?:string,
  //   chain?: string,
  //   address?: string
  // }){

  //   const user = await prisma.user.findFirst({
  //     where:{fernUserId:payload.customerId }
  //   })

  //   if(payload.bankName){
  //     const fiatAccount = await prisma.fiatAccount.create({
  //       data:{
  //         id: payload.paymentAccountId,
  //         name: payload.nickname,
  //         currency: payload.currency,
  //         country: user?.country!,
  //         userId: user?.id,
  //         bank: payload.bankName,
  //         accountNumber: payload.accountMask!,
  //         method: payload.method!
          
  //       }
  //     })

  //   }

  //   if(payload.chain){
  //     const cryptoAccount = await prisma.cryptoAccount.create({
  //       data:{
  //         id: payload.paymentAccountId,
  //         name: payload.nickname,
  //         userId:user?.id,
          
  //         cryptoWalletType: payload.cryptoWalletType,
  //         chain: payload.chain,
  //         address: payload.address
          
  //       }
  //     })
  //   }
    

  //   return true
  // }

  

    // async getBanks(){
    //    try {
    //     const secretKey = config.paystack.secretKey

    //     const availableBanks = await paystackAxios.get('https://api.paystack.co/bank', {
    //         headers: {
    //             Authorization: `Bearer ${secretKey}`
    //         },
    //         params:{
    //             country: 'nigeria',
    //             use_cusor: false
    //         }
    //     })

    //     const banks:any[] = availableBanks?.data.data;

    //     // availableBanks?.data.data.map(async(item:any) => {
    //     //     await prisma.bank.create({
    //     //         data:{
    //     //           name: item.name,
    //     //           slug: item.slug,
    //     //           code: item.code,
    //     //           country: item.country
    //     //         }
    //     //     })

    //     // });

    //     for (const bank of banks) {
    //         await prisma.bank.create({
    //           data: {
    //             name: bank.name,
    //             slug: bank.slug,
    //             code: bank.code,
    //             country: bank.country,
    //           },
    //         });
    //     }

    //     console.log('Banks successfully fetched and saved to the database.');


    //    } catch (error) {
    //     console.log(error)
    //     return null
    //    }
    // }

    // async getAllBanks(): Promise<void> {

    //     interface Bank {
    //         name: string;
    //         slug: string;
    //         code: string;
    //         country: string;
    //         currency: string;
    //         type: string;
    //     }

    //     interface PaystackBankResponse {
    //         status: boolean;
    //         message: string;
    //         data: Bank[];
    //         meta: {
    //             next: string | null;
    //             previous: string | null;
    //             perPage: number;
    //         };
    //     }

    //     try {
    //       const secretKey = config.paystack.secretKey;
    //       let nextCursor: string | null = null;
      
    //       do {
    //         // Fetch banks from Paystack API with cursor pagination
    //         const response = await axios.get<PaystackBankResponse>('https://api.paystack.co/bank', {
    //           headers: {
    //             Authorization: `Bearer ${secretKey}`,
    //           },
    //           params: {
    //             country: 'nigeria',
    //             use_cursor: true,
    //             next: nextCursor, // Use the cursor for pagination
    //           },
    //         });
      
    //         // Access the `data` property of the AxiosResponse
    //         const paystackResponse: PaystackBankResponse = response.data;
    //         const { data: banks, meta } = paystackResponse;
      
    //         // Save banks to the database
    //         for (const bank of banks) {
    //           await prisma.bank.create({
    //             data: {
    //               name: bank.name,
    //               slug: bank.slug,
    //               code: bank.code,
    //               country: bank.country
    //             },
    //           });
    //         }
      
    //         console.log(`Fetched and saved ${banks.length} banks.`);
    //         nextCursor = meta.next; // Update the cursor for the next request
    //       } while (nextCursor); // Continue until there are no more pages
      
    //       console.log('All banks fetched and saved to the database.');
    //     } catch (error) {
    //       console.error('Error fetching or saving banks:', error);
    //       throw error; // Re-throw the error to handle it elsewhere if needed
    //     }
    // }

    // async resolveAccount(bank_code: string, account_number:string){
    //     return await this.paystack.verification.resolveAccount({
    //         account_number,
    //         bank_code
    //     });
    // }

    // async verifyTransaction(transactionId: string)
    // {
    //     return await this.paystack.transaction.verify(transactionId)
    // }

    // async resolveCard(bin: number){
    //     return await this.paystack.verification.resolveCard(bin);
    // }

    // async makeTransfer(amount: number, reference:string, userBank:any)
    // {
    //     try {
    //         const recipient = await this.paystack.recipient.create({
    //             type: 'nuban',
    //             name: userBank.accountName,
    //             account_number: userBank.accountNumber,
    //             bank_code: userBank.bank.code
    //         })
    
    //         if(recipient.status && recipient.data?.recipient_code){
    //             return await this.paystack.transfer.initiate({
    //                 source: 'balance',
    //                 amount: amount * 100,
    //                 recipient: recipient.data?.recipient_code,
    //                 reason: 'Qaya withdrawal',
    //                 reference
    //             })
    //         }
    
    //         return false
    //     } catch (error) {
    //         console.log(error)
    //         return false
    //     }
    // }
}

export default new  FernService()