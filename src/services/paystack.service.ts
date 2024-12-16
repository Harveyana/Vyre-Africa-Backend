import { Request, Response } from "express";
import { Paystack } from "paystack-sdk";
import config from "../config/env.config";
import axios from "axios";
import { UserBank } from "@prisma/client";
import { generateRefCode } from "../utils";

const paystackAxios = axios.create({
    baseURL: "api.paystack.co",
    withCredentials: true
});

class PaystackService {
    paystack: Paystack;

    constructor() {
        this.paystack = new Paystack(config.paystack.secretKey);
    }

    async getBanks(){
       try {
        const secretKey = config.paystack.secretKey

        const availableBanks = await paystackAxios.get('https://api.paystack.co/bank', {
            headers: {
                Authorization: `Bearer ${secretKey}`
            },
            params:{
                country: 'nigeria',
                use_cusor: false
            }
        })

        const banks:any = [];

        availableBanks?.data.data.forEach((item:any) => {
            const newData = {
               name: item.name,
               slug: item.slug,
               code: item.code,
               country: item.country,
            };

            banks.push(newData);
        });

        return banks;

       } catch (error) {
        console.log(error)
        return null
       }
    }

    async resolveAccount(bank_code: string, account_number:string){
        return await this.paystack.verification.resolveAccount({
            account_number,
            bank_code
        });
    }

    async verifyTransaction(transactionId: string)
    {
        return await this.paystack.transaction.verify(transactionId)
    }

    async resolveCard(bin: number){
        return await this.paystack.verification.resolveCard(bin);
    }

    async makeTransfer(amount: number, reference:string, userBank:any)
    {
        try {
            const recipient = await this.paystack.recipient.create({
                type: 'nuban',
                name: userBank.accountName,
                account_number: userBank.accountNumber,
                bank_code: userBank.bank.code
            })
    
            if(recipient.status && recipient.data?.recipient_code){
                return await this.paystack.transfer.initiate({
                    source: 'balance',
                    amount: amount * 100,
                    recipient: recipient.data?.recipient_code,
                    reason: 'Qaya withdrawal',
                    reference
                })
            }
    
            return false
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

export default new PaystackService()