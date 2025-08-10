import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import config from '../config/env.config';
import axios from "axios";
import stablecoinService from './stablecoin.service';
import nativecoinService from './nativecoin.service';
// import {Currency,walletType} from '@prisma/client';
// import { currency as baseCurrency } from '../globals';
import qorepayService from './qorepay.service';
import { hasSufficientBalance } from '../utils';

    const tatumAxios = axios.create({
        baseURL: 'https://api.tatum.io/v3',
        headers: {
            'x-api-key': config.TATUM_LIVE_KEY,
            'Content-Type': 'application/json'
        }
    });

    const tatumAxiosV4 = axios.create({
        baseURL: 'https://api.tatum.io/v4',
        headers: {
            'x-api-key': config.TATUM_LIVE_KEY,
            'Content-Type': 'application/json'
        }
    });

    const qorepayAxios = axios.create({
        baseURL: 'https://gate.qorepay.com/api/v1',
        headers: {
            'accept':'application/json',
            'authorization': `Bearer ${config.QOREPAY_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

class WalletService
{    

    private complete_Withdrawal = async(
        withdrawal_Id: string,
        txId: string
    )=>{

        await tatumAxios.put(`/offchain/withdrawal/${withdrawal_Id}/${txId}`)

        const updatedTransaction = await prisma.transaction.update({
            where:{id: withdrawal_Id },
            data:{
              status:'SUCCESSFUL',
            }
        })

        return updatedTransaction

    }


    private Withdraw_USDC_ETH = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.USDT.ETH_MNEMONIC,
            index: 1,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/ethereum/erc20/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'USDC',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'USD COIN transfer'
            }
        })

        if(!result.completed){
            transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

        
    }

    

    async subscribe_address(payload:{
        address: string,
        chain: string
    }){

        const data = {
            type:"ADDRESS_EVENT",
            attr:{
               address: payload.address,
               chain: payload.chain,
               url:"https://api.vyre.africa/api/v1/tatum/events" //The URL of the webhook listener you are using
               }
            }

        const subscribed = await tatumAxiosV4.post('/subscription', data)

        // const subcribed = await prisma.transaction.update({
        //     where:{id: withdrawal_Id },
        //     data:{
        //       status:'SUCCESSFUL',
        //     }
        // })

        return subscribed.data.id

    }


    async createWallet(payload:{userId:string, currencyId:string})
    {
        const {userId, currencyId} = payload

        const currency = await prisma.currency.findUnique({
            where:{id:currencyId},
            select:{
              id: true,
              type: true,
              name: true,
              ISO: true,
              chain: true,
              isStablecoin: true
            }
              
        })

        if(!currency){
            const error = new Error('currency not found');
            error.name = 'CurrencyNotFoundError';
            throw error;
        }

        let result;

        if(currency.isStablecoin){

            switch (currency.ISO) {

                case 'USDC':
                 result = await stablecoinService.create_USDC_wallet(currency.chain!, userId, currency.id)
                return result
                break;

                case 'USDT':
                 result = await stablecoinService.create_Tether_wallet(currency.chain!, userId, currency.id)
                return result
                break;

                default:
                return
            }

        }else{

          result = await nativecoinService.createWallet(currency.ISO, userId, currency.id)

        }

        
    }

    async blockchain_Transfer(payload:{
        userId: string, 
        currencyId:string,
        amount: number,
        address: string,
        destination_Tag?: number
    })
    {
        const {userId,currencyId,amount,address,destination_Tag} = payload

        const currency = await prisma.currency.findUnique({
            where:{id:currencyId},
            select:{
              id: true,
              type: true,
              name: true,
              ISO: true,
              chain: true,
              isStablecoin: true
            }
              
        })

        if(!currency){
            const error = new Error('currency not found');
            error.name = 'CurrencyNotFoundError';
            throw error;
        }

        const wallet = await prisma.wallet.findFirst({
            where:{
                userId,
                currencyId
            }
        })

        if(!wallet)return
        let result;

        if(currency.isStablecoin){

            switch (currency.ISO) {

                case 'USDC':

                    result = await stablecoinService.Transfer_USDC({
                        chain: currency?.chain as string, 
                        userId, 
                        walletId: wallet.id,
                        amount,
                        index: wallet?.derivationKey as number,
                        address
                    })

                return result
                break;

                case 'USDT':

                    result = await stablecoinService.Transfer_Tether({
                        chain: currency?.chain as string, 
                        userId, 
                        walletId: wallet.id,
                        amount,
                        index: wallet?.derivationKey as number,
                        address
                    })

                return result
                break;

                default:
                return
            }


        }else{

            result = await nativecoinService.blockchain_Transfer({
                ISO:currency.ISO, 
                userId, 
                walletId: wallet?.id,
                amount,
                index: wallet?.derivationKey as number,
                address,
                destination_Tag
            })

        }


    
    }

    async offchain_Transfer(payload:{
        userId: string,
        receipientId: string,
        currencyId: string, 
        amount: number
    })
    {
        const {userId,receipientId,currencyId,amount} = payload

        let receipient_Wallet: any;
        let user_Wallet: any;

        const currency = await prisma.currency.findUnique({
            where:{id:currencyId},
            select:{
              id: true,
              type: true,
              name: true,
              ISO: true,
              chain: true 
            }
              
        })

        if(!currency){
            const error = new Error('currency not found');
            error.name = 'CurrencyNotFoundError';
            throw error;
        }

        console.log('transfer data passed',
            userId,
            receipientId,
            currencyId, 
            amount
        )

        receipient_Wallet = await prisma.wallet.findFirst({
            where:{
                userId: receipientId,
                currencyId
            }
        })

        //check if receipient has currency wallet created else we create it
        if(!receipient_Wallet){
            receipient_Wallet = await this.createWallet({userId:receipientId, currencyId: currencyId as string})
        }

        user_Wallet = await prisma.wallet.findFirst({
            where:{
                userId,
                currencyId
            }
        })

        // check if user balance is sufficient enough
        if(!hasSufficientBalance(user_Wallet?.availableBalance,amount))return

        const data = {
            senderAccountId: user_Wallet?.id!,
            recipientAccountId: receipient_Wallet?.id!,
            amount: `${amount}`,
            anonymous: false,
            compliant: false
        };
        console.log('transfer Data',data)
        const response = await tatumAxios.post('/ledger/transaction', data)
        const paymentData = response.data
        console.log(paymentData)

        // create transactions for both parties
        const transactions = await prisma.transaction.createMany({
            data:[
                {
                userId: userId,
                currency: currency.ISO,
                amount: -amount,
                reference: paymentData.reference,
                status: 'SUCCESSFUL',
                walletId: user_Wallet?.id!,
                type:'DEBIT_PAYMENT',
                description:`${currency} transfer`
               },
               {
                userId: userId,
                currency: currency.ISO,
                amount: amount,
                reference: paymentData.reference,
                status: 'SUCCESSFUL',
                walletId: user_Wallet?.id!,
                type:'CREDIT_PAYMENT',
                description:`${currency} transfer`
               }
            ]
        })

        return  transactions
    
    }

    async bank_Transfer(payload:{
        account_number: string,
        bank_code: string, 
        recipient_name: string,
        endpoint: string
    })
    {
        const {account_number,bank_code,recipient_name,endpoint} = payload

        const data = {
            account_number,
            bank_code,
            recipient_name
        }

        const response = await axios.post(endpoint, data)
        console.log('qorepay transfer response',response.data)
        const result = response.data

        return result
    }

    async direct_bank_Transfer(payload:{
        currency: string,
        amount:number,
        email:string, 
        phone:string,
     
        account_number: string,
        bank_code: string, 
        recipient_name: string
     
    })
    {
        // const {account_number,bank_code,recipient_name,currency} = payload

        const result = await qorepayService.bank_Transfer(payload)
        return result
    }

    async depositFiat(payload:{
        currency: string,
        amount: number, 
        email: string,
        userId: string,
        walletId: string
    })
    {
        const { currency, amount, email, userId, walletId } = payload
        
        const details = await qorepayService.deposit_via_Bank({
            currency,
            amount, 
            email,
            userId,
            walletId
        })
    
        return details
    }

    async getRate(currency: string,basePair: string)
    {
        const response = await tatumAxios.get(`/tatum/rate/${currency}?basePair=${basePair}`)
        // console.log(response)
        const result = response.data
        return result
    }

    async getAccount(id: string)
    {
        const response = await tatumAxios.get(`/ledger/account/${id}`)
        // console.log(response)
        const result = response.data

        const wallet = await prisma.wallet.update({
            where: {
              id
            },
            data:{
              frozen: result.frozen,
              accountBalance:result.balance.accountBalance,
              availableBalance:result.balance.availableBalance
            },
            include:{
                currency:{
                    select:{
                      id: true,
                      name:true,
                      ISO: true,
                      type: true,
                      imgUrl: true,
                      chain: true,
                      chainImgUrl: true,
                      flagEmoji: true,
                      isStablecoin: true
                    }
                }
            }
        });

        return wallet
    }

    async authorize_Withdrawal(currency: string,amount:number, email:string, phone:string)
    {
        const data = {
            client: {
                email,
                phone
              },
              payment: {
                amount: amount * 100,
                currency,
                description: `${currency} withdrawal `,
              },
              sender_name:'Vyre Africa',
              brand_id: config.QOREPAY_BRAND_ID,
        }

        const response = await qorepayAxios.post(`/payouts/`, data)
        console.log('first response',response.data)
        const result = response.data

        const registered = await axios.get(result?.execution_url)
        const payment = registered.data

        // const paymentDetails ={
        //     banks: payment?.detail.data,
        //     url: payment?.payout_url,
        // }

        if(payment?.status === 'error'){
            return null
        }

        return payment?.payout_url
    }

    async debit_Wallet(amount: number, accountId: string){

        const data = {
            accountId,
            amount
        };

        const response = await tatumAxios.put('/ledger/virtualCurrency/revoke', data)
        const responseData = response.data
        console.log(responseData.reference)

        return responseData.reference
        
    }

    async credit_Wallet(amount: number, accountId: string){

        const data = {
            accountId,
            amount
        };

        const response = await tatumAxios.put('/ledger/virtualCurrency/mint', data)
        const responseData = response.data
        console.log(responseData.reference)

        return responseData.reference
    }

    async block_Amount(amount: number, accountId: string){

        const data = {
            amount: `${amount}`,
            type:'ORDER_BLOCK',
            description:'order amount blocked',
            ensureSufficientBalance: true
        };

        const response = await tatumAxios.post(`https://api.tatum.io/v3/ledger/account/block/${accountId}`, data)
        const responseData = response.data
        console.log(responseData.id)

        const record = await prisma.block.create({
            data:{
                id: responseData.id,
                walletId: accountId,
                amount,
                description:'order amount blocked'
            }
        })

        console.log('amount blocked')

        return responseData.id
        
    }

    async unblock_Transfer(amount:number, blockId:string, recipientAccountId:string){

        const data = {
            recipientAccountId,
            amount,
            anonymous: true,
            compliant: false
        };

        const response = await tatumAxios.put(`https://api.tatum.io/v3/ledger/account/block/${blockId}`, data)
        const responseData = response.data
        console.log(responseData.reference)

        // const record = await prisma.block.create({
        //     data:{
        //         id: responseData.id,
        //         walletId: accountId,
        //         amount,
        //         description:'order amount blocked'
        //     }
        // })

        console.log('amount transferred')

        return responseData.reference
        
    }

    async deletePaymentAccountById(accountId: string): Promise<boolean> {
        try {
          // First try to delete from fiat accounts
          const deletedFiatAccount = await prisma.fiatAccount.deleteMany({
            where: {
              id: accountId
            }
          })
      
          // If a fiat account was deleted, return true
          if (deletedFiatAccount.count > 0) {
            return true
          }
      
          // If no fiat account was found, try crypto accounts
          const deletedCryptoAccount = await prisma.cryptoAccount.deleteMany({
            where: {
              id: accountId
            }
          })
      
          // Return true if a crypto account was deleted
          return deletedCryptoAccount.count > 0
        } catch (error) {
          console.error('Error deleting account:', error)
          return false
        }
      }

    async createUserWallet(userId: string|null)
    {
        // return await prisma.wallet.create({
        //     data: {
        //         userId,
        //         currency: config.defaultCurrency
        //     }
        // })
    }

    async getUserbalance(userId: string|null)
    {
        // const wallet =  await prisma.wallet.findFirst({
        //     where:{userId : userId}
        // })
        // return wallet?.balance
    }

    // async createStoreWallet(storeId: string|null)
    // {
    //     return await prisma.wallet.create({
    //         data: {
    //             storeId,
    //             currency: config.defaultCurrency
    //         }
    //     })
    // }

    async fundUserWallet(amount: number, userId: string){
        // const wallet =  await prisma.wallet.findFirst({
        //     where: {userId},
        // })

        // if(!wallet){
        //     return false;
        // }

        // const balance: number = Number(wallet.balance);

        // return await prisma.wallet.update({
        //     where: {userId},
        //     data: {
        //         balance: balance + amount
        //     }
        // })
    }

    
}

export default new WalletService()