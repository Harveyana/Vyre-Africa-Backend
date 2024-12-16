import { PrismaClient } from '@prisma/client';
import { Paystack } from 'paystack-sdk';
import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import axios from "axios";
import orderService from '../services/order.service';
import walletService from '../services/wallet.service';
import paystackService from '../services/paystack.service';
import notificationService from '../services/notification.service';
import config from '../config/env.config';
import smsService from '../services/sms.service';
import mobilePushService from '../services/mobilePush.service';
import { subMinutes } from 'date-fns';
import { generateRefCode } from '../utils';

class TripController {
  paystack: Paystack;

  constructor() {
    this.paystack = new Paystack(
      'sk_test_3425cf96b06b8ce98715964ed1255707871fc486',
    );
  }


  async getPrice(req: Request, res: Response) {
    const { originLat,originLng,destLat,destLng } = req.body;

    // if (!longitude || !latitude) {
    //   return res.status(400).send('Location required');
    // }

    try {
      console.log('body',req.body)
      

      const apiKey = 'AIzaSyBBYUi-MAFpiGyHI67x-xCrAWArKPm4n7w'; // Replace with your actual API key
      // const originLat = 38.895111; // Lati,tude of Washington, D.C.
      // const originLng = -77.036366; // Longitude of Washington, D.C.
      // const destLat = 40.712776; // Latitude of New York City
      // const destLng = -74.005974; // Longitude of New York City
      const units = 'imperial';

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&units=${units}&key=${apiKey}`;
      const response = await axios.get(url)
      console.log(response)
      const data = response.data
      console.log(`The distance between the two locations is ${data.rows[0].elements[0].distance.text}`);

      const distance = data.rows[0].elements[0].distance.text;
      const duration = data.rows[0].elements[0].duration.text;

      console.log(`Distance: ${distance}`);
      console.log(`Duration: ${duration}`);

      const distanceInMeters = data.rows[0].elements[0].distance.value;
      const ratePerKilometer = 10; // Adjust the rate as needed

      // Convert meters to kilometers
      const distanceInKilometers = distanceInMeters / 1000;
      // Calculate the price
      const price = (distanceInKilometers * ratePerKilometer).toFixed(2);

      console.log(`Price: ${price}`);

      return res
        .status(200)
        .json({
          msg:`price for a distance of ${distance} and ${duration}`,
          success: true,
          price
        });


      // res.status(200).send(stores);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }


  // async createOrder(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const { storeId } = req.body;
  //   let result: any
  //   let Amount = 0

  //   // console.log(storeId)

  //   const userData = await prisma.user.findUnique({
  //     where: { id: user.id }
  //   })

  //   const cart = await prisma.cart.findUnique({
  //     where: { userId: user.id },
  //     include: {
  //       products: {
  //         include: {
  //           product: true,
  //           variants: true
  //         }
  //       }
  //     }
  //   })

  //   if (!cart) {
  //     return res.status(500)
  //       .json({
  //         msg: 'Your Cart Empty',
  //         success: false,
  //       });
  //   }

  //   cart.products.forEach((cartProduct: any) => {
  //     let variantsPrice = 0;
  //     if (cartProduct.variants && cartProduct.variants.length) {
  //       variantsPrice = cartProduct.variants.reduce((acc: number, variant: any) => acc + variant.price, 0);
  //     }
  //     Amount += (cartProduct.product.price + variantsPrice) * cartProduct.quantity;
  //   });

  //   const userMessage = 'Your Order has been placed successfully. You will be updated'

  //   try {


  //     const order = await prisma.order.create({
  //       data: {
  //         price: Amount,
  //         userId: user.id,
  //         storeId: storeId,
  //         products: {
  //           create: cart?.products.map((cartProduct: any) => ({
  //             productId: cartProduct.product.id,
  //             storeId: cartProduct.product.storeId,
  //             name: cartProduct.product.name,
  //             SKU: cartProduct.product.SKU,
  //             price: cartProduct.product.price,
  //             cart_Quantity: cartProduct.quantity,
  //             images: cartProduct.images,
  //             categories: [],
  //             Variants: {
  //               create: cartProduct.variants.map((variant: any) => ({
  //                 name: variant.name,
  //                 value: variant.value,
  //                 price: variant.price,
  //               })),
  //             },
  //           })),
  //         },
  //       },
  //     })

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Order created Successfully',
  //         success: true,
  //         order
  //       });

  //   } catch (error) {
  //     console.log(error)
  //     res.status(500)
  //       .json({
  //         msg: 'Internal Server Error',
  //         success: false,
  //       });
  //   }
  // }

  // async updateOrder(req: Request & Record<string, any>, res: Response) {
  //   const user = req.user;
  //   const { orderId, method } = req.body;
  //   const now = new Date();

  //   console.log(user)

  //   if (!orderId) {
  //     return res.status(400).send({ msg: 'Order ID required', success: false });
  //   }

  //   console.log('started operation')

  //   const cart = await prisma.cart.findUnique({
  //     where: { userId: user.id }
  //   })

  //   const order = await prisma.order.findUnique({
  //     where: { id: orderId as string },
  //     include: { store: true }
  //   })

  //   const store = await prisma.store.findUnique({
  //     where: { id: (order?.storeId) },
  //     include: {
  //       organisation: true,
  //       wallet: true,
  //       admins: {
  //         include: { user: true }
  //       }
  //     }
  //   })

  //   const Amount: number = Number(order?.price)

  //   try {

  //     console.log('started operation 2')

  //     if (method === 'WALLET') {

  //       const userBalance = await walletService.getUserbalance(user.id);
  //       console.log('user balance', userBalance)
  //       const reference = generateRefCode('trn', 15).toLocaleLowerCase()

  //       // console.log('cart', cart?.products)

  //       if (userBalance && Number(userBalance) < Amount) {
  //         return res
  //           .status(200)
  //           .json({
  //             msg: 'Balance insufficient',
  //             success: true,
  //           });
  //       }

  //       console.log('entering transaction operation')

  //       const result = await prisma.$transaction(
  //         async (prisma) => {


  //           // update user wallet
  //           await prisma.wallet.update({
  //             where: { userId: user.id },
  //             data: {
  //               balance: Number(userBalance) - Amount
  //             }
  //           })

  //           //update store wallet
  //           await prisma.wallet.update({
  //             where: { storeId: store?.id },
  //             data: {
  //               balance: Number(store?.wallet?.balance) + Amount
  //             }
  //           })

  //           //update organization wallet
  //           await prisma.wallet.upsert({
  //             where: { organisationId: store?.organisationId },
  //             update: {
  //               balance: Number(store?.wallet?.balance) + Amount
  //             },
  //             create: {
  //               organisationId: store?.organisationId,
  //               currency: config.defaultCurrency
  //             }
  //           })

  //           //save user transaction
  //           await prisma.transaction.create({
  //             data: {
  //               userId: user.id,
  //               reference,
  //               amount: Amount,
  //               status: 'SUCCESSFUL',
  //               paymentMethod: 'WALLET',
  //               type: 'DEBIT',
  //               description: 'Payment for order'
  //             }
  //           })

  //           //create store transaction
  //           await prisma.transaction.create({
  //             data: {
  //               storeId: store?.id,
  //               reference,
  //               amount: Amount,
  //               status: 'SUCCESSFUL',
  //               paymentMethod: 'WALLET',
  //               type: 'CREDIT',
  //               description: 'Payment for order'
  //             }
  //           })

  //           console.log('debited')

  //           const updatedOrder = await prisma.order.update({
  //             where: { id: order?.id },
  //             data: {
  //               Status: 'PAID',
  //               updatedAt: now
  //             }
  //           })

  //           // delete cart
  //           await prisma.cartProduct.deleteMany({
  //             where: { cartId: cart?.id },
  //           });

  //           await prisma.cart.delete({
  //             where: { userId: user.id },
  //           });

  //           return {
  //             order: updatedOrder
  //           }
  //         },
  //         {
  //           maxWait: 50000, // default: 2000
  //           timeout: 50000, // default: 5000
  //         }
  //       )

  //       const updatedUser = await prisma.user.findUnique({
  //         where: { id: user.id },
  //         include:{
  //           wallet: true
  //         }
  //       })

  //       return res
  //         .status(200)
  //         .json({
  //           msg: 'order updated Successfully',
  //           success: true,
  //           user: updatedUser,
  //           order: result.order,
  //       });

  //     } else {

  //       const result = await paystackService.verifyTransaction(orderId as string)
  //       console.log(result)

  //       const updatedOrder = await prisma.order.update({
  //         where: { id: orderId as string },
  //         data: {
  //           Status: result?.data?.status == 'success' ? 'PAID' : 'FAILED',
  //           paymentMethod: 'TRANSFER',
  //           updatedAt: now
  //         },
  //       });

  //       console.log('Updated order: ', updatedOrder);

  //         // delete cart
  //         await prisma.cartProduct.deleteMany({
  //           where: { cartId: cart?.id },
  //         });

  //         await prisma.cart.delete({
  //           where: { userId: user.id },
  //         });

  //       return res
  //         .status(200)
  //         .json({
  //           msg: 'order updated Successfully',
  //           success: true,
  //           order: updatedOrder,
  //         });

  //     }

  //     // const result = await this.paystack.transaction.verify(orderId as string);

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });

  //   }
  // }

  // async fetchOrder(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const { orderId } = req.query;

  //   if (!orderId) {
  //     return res.status(400).send('Order ID required');
  //   }

  //   try {
  //     const order = await prisma.order.findUnique({
  //       where: {
  //         id: orderId as string,
  //       },
  //       include: {
  //         products: {
  //           include : {
  //             product: {
  //               include: { images: true }
  //             }
  //           }
  //         },
  //         user: true
  //       },
  //     });

  //     console.log('Fetched order: ', order);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'order fetched Successfully',
  //         success: true,
  //         order: order,
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async fetchOrders(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const cursor = req.query.cursor as string | null;
  //   const limit = req.query.limit as string | null;
  //   // const status = req.query.status as string|null;

  //   try {
  //     let orders;
  //     // orders = await orderService.getUserOrders(cursor, status, limit, user.id)
  //     if (cursor) {
  //       orders = await prisma.order.findMany({
  //         take: limit ? parseInt(limit as string) : 20,
  //         skip: 1,
  //         cursor: {
  //           id: cursor as string,
  //         },
  //         where: {
  //           userId: user.id,
  //         },
  //         include: {
  //           products: {
  //           include : {
  //             product: {
  //               include: { images: true }
  //             }
  //           }
  //         },
  //         },
  //         orderBy: { createdAt: "desc" }
  //       });
  //     } else {

  //       orders = await prisma.order.findMany({
  //         take: limit ? parseInt(limit as string) : 20,
  //         where: {
  //           userId: user.id,
  //         },
  //         include: {
  //           products: true,
  //         },
  //         orderBy: { createdAt: "desc" }
  //       });
  //     }


  //     console.log('Fetched orders: ', orders);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         orders: orders,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async sendOrderNotifications() {
  //   const now = new Date();

  //   try {
  //     const orders = await prisma.order.findMany({
  //       where: {
  //         updatedAt: {
  //           lte: now,
  //         },
  //         Status: 'PAID',
  //         isNotificationSent: false,
  //       },
  //     });

  //     // console.log('Orders:', orders);

  //     if (orders.length) {
  //       orders.forEach(async order => {
  //         //send notifications
  //         const user = await prisma.user.findUnique({
  //           where: { id: order.userId }
  //         })

  //         const store = await prisma.store.findUnique({
  //           where: { id: order.storeId },
  //           include: { 
  //             admins: {
  //               include: { user: true }
  //             } 
  //           }
  //         })

  //         const storeAdmins = store?.admins
  //         const storeAdminTokens: any = []
  //         storeAdmins?.forEach(storeAdmin => {
  //           if (storeAdmin.user.pushToken) {
  //             storeAdminTokens.push(storeAdmin.user.pushToken)
  //           }
  //         })

  //         const userMessage = 'Your Order has been placed successfully. You will be updated';
          
  //         //create user inapp notification
  //         await prisma.notification.create({
  //           data: {
  //             userId: user?.id,
  //             title: 'Order Placed',
  //             content: userMessage,
  //             type: 'ORDER'
  //           }
  //         })

  //         // create store inapp notification
  //         await prisma.notification.create({
  //           data: {
  //             storeId: store?.id ?? null,
  //             title: 'Order Placed',
  //             content: 'You have a new order from ' + user?.firstName + ' . OrderID: ' + order.id,
  //             type: 'ORDER'
  //           }
  //         })

  //         // send user sms notification
  //         // if(user?.phoneNumber){
  //         //   await smsService.send({
  //         //     api_key: config.termiiLiveKey,
  //         //     to: user?.phoneNumber.replace(/^\+/, ''),
  //         //     from: 'Qaya',
  //         //     sms: userMessage,
  //         //     type: "plain",
  //         //     channel: "generic",
  //         //   })
  //         // }

  //         //send user push notification
  //         await mobilePushService.singlePush('Order Placed', userMessage, user?.pushToken!)

  //         //send store  push notification
  //         await notificationService.sendMulticastPushNotification(
  //           storeAdminTokens,
  //           'Order',
  //           'You have a new order from ' + user?.firstName + ' . OrderID: ' + order.id
  //         )

  //         //update order
  //         await prisma.order.update({
  //           where: { id: order.id },
  //           data: { isNotificationSent: true }
  //         })

  //         console.log("Notification successfully sent for order "+ order.id)
  //       })
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
}

export default new TripController();
