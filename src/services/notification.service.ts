import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import {adminBase} from '../config/firebaseConfig'
import {messaging} from 'firebase-admin'
import mailService from './mail.service';
import {NotificationType} from '@prisma/client';
import smsService from './sms.service';
import config from '../config/env.config';
import mobilePushService from './mobilePush.service';
import { endOfDay, startOfDay } from 'date-fns';

class NotificationService
{
    async create(userId:string|null, storeId:string|null, title:string|null, content:string, type:NotificationType)
    {
        // if(userId){
            return await prisma.notification.create({
                data: {
                    userId,
                    title,
                    content,
                    type
                }
            });
        // }else{
        //     return await prisma.notification.create({
        //         data: {
        //             storeId,
        //             title,
        //             content,
        //             type,
        //         }
        //     });
        // }


    }

    // async subscribeToStore(token:string, userId:string)
    // {

    //     await prisma.user.update({
    //         where: {id: userId},
    //         data:{pushToken: token}
    //     })

    //     const registrationTokens = [
    //         token,
    //     ];

    //     try {
    //         await adminBase.messaging().subscribeToTopic(registrationTokens, 'STORE-BROADCAST')
    //         await adminBase.messaging().subscribeToTopic(registrationTokens, 'GENERAL-BROADCAST')
    //         return true
    //     } catch (error:any) {
    //         console.log('Error subscribing to topic:', error);
    //       return false
    //     }
        
    // }

    async subscribeToUser(token:string, userId:string)
    {

        await prisma.user.update({
            where: {id: userId},
            data:{pushToken: token}
        })

        const registrationTokens = [
            token,
        ];

        try {
            await adminBase.messaging().subscribeToTopic(registrationTokens, 'USER-BROADCAST')
            await adminBase.messaging().subscribeToTopic(registrationTokens, 'GENERAL-BROADCAST')
            return true
        } catch (error:any) {
            console.log('Error subscribing to topic:', error);
          return false
        }
        
    }

    async sendPushNotification(userType:string, title:string, body:string)
    {

        console.log('push  triggered')
        const Channel = userType === 'SHOPPERS' ? 'USER-BROADCAST' : userType === 'MALLS'? 'STORE-BROADCAST' : 'GENERAL-BROADCAST'

        const message = {
            notification: {
              title: title,
              body: body
            },
            topic: Channel
        };

        console.log(message)

        try {
            // if(userType === 'SHOPPERS' || userType === 'ALL'){
            //     const shoppers = await prisma.user.findMany({
            //         where:{ type:'USER' }
            //     });

            //     //get push tokens
            //     const userPushTokens:any = []

            //     shoppers.map((user) => {
            //         if(user.pushToken){
            //             userPushTokens.push(user.pushToken)
            //         }
            //     })

            //     //send push notification
            //     const response = await mobilePushService.BulkPush(title, body, userPushTokens)
            //     console.log(response)
            // }
            
            // if(userType === 'MALLS' || userType === 'ALL'){
            //   const response = await adminBase.messaging().send(message)
            //   console.log(response)

            // }

            return true
        } catch (error:any) {
            console.log('Error subscribing to topic:', error);
          return false
        }
        
    }

    async sendSmsNotification(userType:string, title:string, body:string)
    {
        const allUsers = await prisma.user.findMany();

        const userPhoneNumbers:any = []

        allUsers.map((user) => {
            if(user.phoneNumber){
                const phone = user.phoneNumber.replace(/^\+/, '');
                userPhoneNumbers.push(phone)
            }
        })

        const data = {
            api_key: config.termiiLiveKey,
            to: userPhoneNumbers,
            from: 'Qaya',
            sms: body,
            type: "plain",
            channel: "generic",
        }

        try {
            const response = await smsService.sendBulk(data)
            console.log('response', response.data)
            if(response.data?.code == 'ok'){
                return true
            }

            return false;

        } catch (error:any) {
            console.log('Error Sending Broadcast:', error);
          return false
        }
        
    }

    async sendEmailNotification(userType:string, title:string, body:string)
    {
        
        const allUsers = await prisma.user.findMany();
        
        const mailUsers = allUsers.map((user)=>{
          return {
            email_address:{"address": user.email,"name": user.firstName},
            merge_info: { 
                body: body,
                subject: title,
                user_name: user.firstName
            },
          }
        })

        try {
            const response = await mailService.sendBroadCast(mailUsers)
            console.log(response)

            return true
        } catch (error:any) {
            console.log('Error Sending Broadcast:', error);
          return false
        }
        
    }

    async sendMulticastPushNotification(tokens: string[], title: string, body: string){
        
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: tokens,
        };

        try {
            const response = await adminBase.messaging().sendMulticast(message);

            console.log('Successfully sent multicast notification:', response);

            return true
        } catch (error:any) {
            console.log('Error sending push notification:', error);
          return false
        }
    }

    async getUserNotification(userId:string, limit:string)
    {
        return await prisma.notification.findMany({
            where: {
                userId,
            },
            take: limit ? parseInt(limit) : 20,
            orderBy: {createdAt: 'desc'}
        });
    }

    async filterUserNotification(
        userId:string, 
        limit: string, 
        dateFrom:Date|null, 
        dateTo:Date|null, 
        type:string|null
    ){
        const whereClause: any = {
            userId,

            ...(dateFrom && dateTo && {
                createdAt: {
                  gte: startOfDay(dateFrom),
                  lte: endOfDay(dateTo),
                },
            }),

            ...(type && {
                type: type as NotificationType
            }),
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            take: limit ? parseInt(limit) : 20,
            orderBy: {createdAt: "desc"}
        });

        return notifications
    }

    // async getStoreNotification(storeId:string|null, dateFrom:Date|null, dateTo:Date|null,)
    // {
    //     if(storeId !== null){
    //         if(dateFrom !== null && dateTo !== null){
    //             return await prisma.notification.findMany({
    //                 where: {
    //                     storeId,
    //                     createdAt: {
    //                         gte: dateFrom,
    //                         lte: dateTo,
    //                     },
    //                 },
    //             });
    //         }
    
    //         return await prisma.notification.findMany({
    //             where: {storeId}
    //         });
    //     }

    //     return [];
    // }
}

export default new NotificationService()