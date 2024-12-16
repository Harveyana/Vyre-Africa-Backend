import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import config from '../config/env.config';

class WalletService
{
    async createUserWallet(userId: string|null)
    {
        return await prisma.wallet.create({
            data: {
                userId,
                currency: config.defaultCurrency
            }
        })
    }

    async getUserbalance(userId: string|null)
    {
        const wallet =  await prisma.wallet.findFirst({
            where:{userId : userId}
        })
        return wallet?.balance
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
        const wallet =  await prisma.wallet.findFirst({
            where: {userId},
        })

        if(!wallet){
            return false;
        }

        const balance: number = Number(wallet.balance);

        return await prisma.wallet.update({
            where: {userId},
            data: {
                balance: balance + amount
            }
        })
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

    async debitUserWallet(amount: number, userId: string){
        const wallet = await prisma.wallet.findFirst({
            where: {userId: userId}
        })

        if(!wallet){
            return false;
        }

        const balance: number = Number(wallet.balance);

        const update = await prisma.wallet.update({
            where: {userId: userId},
            data: {
                balance: balance - amount
            }
        })
        return update
    }

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