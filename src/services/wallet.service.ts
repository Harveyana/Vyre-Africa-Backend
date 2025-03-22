import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import config from '../config/env.config';
import axios from "axios";
import {Currency,walletType} from '@prisma/client';
import { currency as baseCurrency } from '../globals';
import { hasSufficientBalance } from '../utils';

    const tatumAxios = axios.create({
        baseURL: 'https://api.tatum.io/v3',
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

    private generate_Address = async(Account_ID:string)=>{
    
        const response = await tatumAxios.post(`/offchain/account/${Account_ID}/address`)
        const result = response.data
        console.log(result)

        return result
    }

    private subscribe_events = async(
        accountId: string
    )=>{

        const data = {
            type:"ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
            attr:{
               id: accountId, // The Virtual_Account_ID
               url:"https://vyre-a33d9c003be3.herokuapp.com/api/v1/tatum/events" //The URL of the webhook listener you are using
               }
            }

        const subscribed = await tatumAxios.post('/subscription', data)

        // const subcribed = await prisma.transaction.update({
        //     where:{id: withdrawal_Id },
        //     data:{
        //       status:'SUCCESSFUL',
        //     }
        // })

        return subscribed.data.id

    }

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



    private Withdraw_Bitcoin = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.BTC_MNEMONIC,
            xpub: config.BTC_XPUB,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/bitcoin/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'BTC',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'Bitcoin transfer'
            }
        })

        if(!result.completed){
            transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

    }

    private Withdraw_Ethereum = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.ETH_MNEMONIC,
            index: 1,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/ethereum/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'ETH',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'Ethereum transfer'
            }
        })

        if(!result.completed){
            transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

        
    }

    private Withdraw_Litecoin = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.LTC_MNEMONIC,
            xpub: config.LTC_XPUB,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/litecoin/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'LTC',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'Litecoin transfer'
            }
        })

        if(!result.completed){
           transaction = await this.complete_Withdrawal(result.id, result.txId)
        }
        return transaction
        
    }
    
    private Withdraw_Tron = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.TRON_MNEMONIC,
            index: 1,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/tron/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'TRON',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'Tron transfer'
            }
        })

        if(!result.completed){
           transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

        
    }

    private Withdraw_BNB = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            fromPrivateKey: config.BNB_KEY,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/bnb/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'BNB',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'BNB transfer'
            }
        })

        if(!result.completed){
           transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

    }

    private Withdraw_XRP = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
        destination_Tag: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            account: config.XRP_ADDRESS,
            secret: config.XRP_SECRET,
            attr: destination_Tag,
            address,
            amount
        };

        let transaction;

        const response = await tatumAxios.post('/offchain/xrp/transfer', data)
        console.log(response)
        const result = response.data

        transaction = await prisma.transaction.create({
            data:{
                id: result.id,
                userId: userId,
                currency: 'XRP',
                amount,
                status: result.completed ? 'SUCCESSFUL' : 'PENDING',
                walletId: account_ID,
                type:'DEBIT_PAYMENT',
                description:'Ripple transfer'
            }
        })

        if(!result.completed){
           transaction = await this.complete_Withdrawal(result.id, result.txId)
        }

        return transaction

    }

    private Withdraw_USDC = async(
        userId: string, 
        account_ID: string,
        address: string,
        amount: number,
    )=>{
        const data = {
            senderAccountId: account_ID,
            mnemonic: config.USDC_MNEMONIC,
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

    



    private create_Naira_wallet = async(userId:string)=>{
        const data = {
            currency: "VC_NGN",
            customer:{
               accountingCurrency: "NGN",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'NGN',
                imgurl: config.urls.naira_Img,
                type: 'FIAT',
                userId,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Dollar_wallet = async(userId:string)=>{
        const data = {
            currency: "VC_USD",
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'USD',
                imgurl: config.urls.dollar_Img,
                type: 'FIAT',
                userId,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Bitcoin_wallet = async(userId:string)=>{
        const data = {
            currency: "BTC",
            xpub: config.BTC_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data

        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'BTC',
                imgurl: config.urls.bitcoin_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Ethereum_wallet = async(userId:string)=>{
        const data = {
            currency: "ETH",
            xpub: config.ETH_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data

        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'ETH',
                imgurl: config.urls.ethereum_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Litecoin_wallet = async(userId:string)=>{
        const data = {
            currency: "LTC",
            xpub: config.LTC_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'LTC',
                imgurl: config.urls.litecoin_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Tron_wallet = async(userId:string)=>{
        const data = {
            currency: "TRON",
            xpub: config.TRON_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'TRON',
                imgurl: config.urls.tron_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Bnb_wallet = async(userId:string)=>{
        const data = {
            currency: "BNB",
            xpub: config.BNB_ADDRESS,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'BNB',
                imgurl: config.urls.bnb_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_Ripple_wallet = async(userId:string)=>{
        const data = {
            currency: "XRP",
            xpub: config.XRP_ADDRESS,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'XRP',
                imgurl: config.urls.ripple_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                destinationTag: deposit.destinationTag,

                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_USDC_wallet = async(userId:string)=>{
        const data = {
            currency: "USDC",
            xpub: config.USDC_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'USDC',
                imgurl: config.urls.usdc_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_TetherErc_wallet = async(userId:string)=>{
        const data = {
            currency: "USDT",
            xpub: config.USDT_ETH_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'USDT_ETH',
                imgurl: config.urls.usdt_eth_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }

    private create_TetherTrc_wallet = async(userId:string)=>{
        const data = {
            currency: "USDT_TRON",
            xpub: config.USDT_TRON_XPUB,
            customer:{
               accountingCurrency: "USD",
               externalId: userId
            }
        };
        const response = await tatumAxios.post('/ledger/account', data)
        console.log(response)
        const result = response.data
        const deposit = await this.generate_Address(result.id)

        const newWallet = await prisma.wallet.create({
            data:{
                id: result.id,
                currency: 'USDT_TRON',
                imgurl: config.urls.usdt_tron_Img,
                type: 'CRYPTO',
                userId,
                depositAddress: deposit.address,
                derivationKey: deposit.derivationKey,
                Tatum_customerId: result.customerId,
                accountingCurrency: result.accountingCurrency,
                frozen: result.frozen
            }
        })

        return newWallet
    }


    async createWallet(userId: string,currency: Currency)
    {
        let result;

        switch (currency) {
            case 'NGN':
              result = await this.create_Naira_wallet(userId)
              return result
              break;

            case 'USD':
              result = await this.create_Dollar_wallet(userId)
              return result
              break;
            
            case 'BTC':
              result = await this.create_Bitcoin_wallet(userId)
              return result
              break;
            
            case 'ETH':
              result = await this.create_Ethereum_wallet(userId)
              return result
              break;

            case 'LTC':
              result = await this.create_Litecoin_wallet(userId)
              return result
              break;
            
            case 'TRON':
              result = await this.create_Tron_wallet(userId)
              return result
              break;

            case 'BNB':
              result = await this.create_Bnb_wallet(userId)
              return result
              break;

            case 'XRP':
              result = await this.create_Ripple_wallet(userId)
              return result
              break;

            case 'USDC':
              result = await this.create_USDC_wallet(userId)
              return result
              break;

            case 'USDT_ETH':
              result = await this.create_TetherErc_wallet(userId)
              return result
              break;

            case 'USDT_TRON':
              result = await this.create_TetherTrc_wallet(userId)
              return result
              break;

            default:
             return
        }
    }

    async blockchain_Transfer(
        userId: string, 
        currency: Currency, 
        amount: number,
        address: string,
        destination_Tag?: number
    )
    {

        const wallet = await prisma.wallet.findFirst({
            where:{
                userId,
                currency
            }
        })

        if(!wallet)return
        let result;


        switch (currency) {
            
            case 'BTC':
              result = await this.Withdraw_Bitcoin(
                userId, 
                wallet.id,
                address,
                amount
              )
              return result
              break;
            
            case 'ETH':
                result = await this.Withdraw_Ethereum(
                    userId, 
                    wallet.id,
                    address,
                    amount
                )
                return result
              break;

            case 'LTC':
                result = await this.Withdraw_Litecoin(
                    userId, 
                    wallet.id,
                    address,
                    amount
                )
                return result
              break;
            
            case 'TRON':
                result = await this.Withdraw_Tron(
                    userId, 
                    wallet.id,
                    address,
                    amount
                )
                return result
              break;

            case 'BNB':
                result = await this.Withdraw_BNB(
                    userId, 
                    wallet.id,
                    address,
                    amount
                )
                return result
              break;

            case 'XRP':
                result = await this.Withdraw_XRP(
                    userId, 
                    wallet.id,
                    address,
                    amount,
                    destination_Tag!
                )
                return result
              break;

            case 'USDC':
                result = await this.Withdraw_USDC(
                    userId, 
                    wallet.id,
                    address,
                    amount
                )
                return result
              break;

            default:
             return
        }


    
    }

    async offchain_Transfer(
        userId: string,
        receipientId: string, 
        currency: Currency, 
        amount: number
    )
    {
        let receipient_Wallet: any;
        let user_Wallet: any;

        console.log('transfer data passed',
            userId,
            receipientId, 
            currency, 
            amount
        )

        receipient_Wallet = await prisma.wallet.findFirst({
            where:{
                userId: receipientId,
                currency: currency
            }
        })

        //check if receipient has currency wallet created else we create it
        if(!receipient_Wallet){
            receipient_Wallet = await this.createWallet(receipientId,currency)
        }

        user_Wallet = await prisma.wallet.findFirst({
            where:{
                userId,
                currency
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
                currency,
                amount: -amount,
                reference: paymentData.reference,
                status: 'SUCCESSFUL',
                walletId: user_Wallet?.id!,
                type:'DEBIT_PAYMENT',
                description:`${currency} transfer`
               },
               {
                userId: userId,
                currency,
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

    async bank_Transfer(
        account_number: string,
        bank_code: string, 
        recipient_name: string,
        endpoint: string
    )
    {
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

    async depositFiat(
        currency: Currency,
        amount: number, 
        email:string,
        userId:string,
        walletId:string
    )
    {
        const data = {
            client: {
                email
              },
              purchase: {
                currency,
                products: [
                  {
                    name: "Deposit",
                    quantity: 1,
                    price: amount * 100
                  }
                ]
              },
              brand_id: config.QOREPAY_BRAND_ID,
              failure_redirect: `${config.urls.userDashboard}/failed`,
              success_redirect: `${config.urls.userDashboard}/successful`
        }
        const response = await qorepayAxios.post(`/purchases/`, data)
        console.log(response.data)
        const result = response.data

        // create transaction record
        const transaction = await prisma.transaction.create({
            data:{
                userId,
                currency,
                amount,
                reference: result.id,
                status: 'PENDING',
                walletId,
                type:'FIAT_DEPOSIT',
                description:`${currency} deposit`
            }
        })
        const paymentDetails ={
            id: result.id,
            url:result.checkout_url,
            success_redirect:result.success_redirect,
            failure_redirect:result.failure_redirect,
        }
        return paymentDetails
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
            }
        });

        return wallet
    }

    async getBankList(currency: string,amount:number, email:string, phone:string)
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
        console.log(response.data)
        const result = response.data

        if(result?.status == 'error') return

        const registered = await axios.get(result?.execution_url)
        const payment = registered.data

        console.log(payment)

        const paymentDetails ={
            banks: payment?.detail.data,
            url: payment?.payout_url,
        }

        return paymentDetails
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

    // async fundStoreWallet(amount: number, storeId: string){
    //     const wallet =  await prisma.wallet.findUnique({
    //         where: {storeId},
    //     })

    //     if(!wallet){
    //         return false;
    //     }

    //     const balance: number = Number(wallet.balance);

    //     return await prisma.wallet.update({
    //         where: {storeId},
    //         data: {
    //             balance: balance + amount
    //         }
    //     })
    // }

    

    // async debitStoreWallet(amount: number, storeId: string){
    //     const wallet =  await prisma.wallet.findFirst({
    //         where: {storeId},
    //     })

    //     if(!wallet){
    //         return false;
    //     }

    //     const balance: number = Number(wallet.balance);

    //     return await prisma.wallet.update({
    //         where: {storeId},
    //         data: {
    //             balance: balance - amount
    //         }
    //     })
    // }
}

export default new WalletService()