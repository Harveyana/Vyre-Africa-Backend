import { PrismaClient } from '@prisma/client';
import { Paystack } from 'paystack-sdk';
import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import orderService from '../services/order.service';
import walletService from '../services/wallet.service';
import paystackService from '../services/paystack.service';
import notificationService from '../services/notification.service';
import config from '../config/env.config';
import smsService from '../services/sms.service';
import mobilePushService from '../services/mobilePush.service';
import { subMinutes } from 'date-fns';
import {Currency,walletType} from '@prisma/client';
import { generateRefCode } from '../utils';

class OrderController {
  paystack: Paystack;

  constructor() {
    this.paystack = new Paystack(
      'sk_test_3425cf96b06b8ce98715964ed1255707871fc486',
    );
  }


  async createOrder(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const { price, amount, type, pairId } = req.body;
   

    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // fetch pair
    // check the base currency balance if its sufficient
    // block the amount for the order
    // create the order using a prisma transaction

    const pair = await prisma.pair.findFirst({
      where:{id: pairId}
    })

    console.log('pair', pair)

    const baseWalletExists = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        currency: pair?.base as Currency
      }
    });

    console.log('baseWalletExists', baseWalletExists)

    const quoteWalletExists = await prisma.wallet.findFirst({
      where: {
        userId: user.id,
        currency: pair?.quote as Currency
      }
    });

    console.log('quoteWalletExists', quoteWalletExists)

    if(!baseWalletExists || !quoteWalletExists){
      return res.status(400)
        .json({
          msg: 'User wallet does not exist',
          success: false,
        });
    }

    if(type === 'SELL' && amount > baseWalletExists.availableBalance){
      return res.status(400)
        .json({
          msg: 'Available balance not sufficient',
          success: false,
        });
    }

    console.log('checked amount sufficiency')

    if(type === 'BUY' && amount > quoteWalletExists.availableBalance){
      return res.status(400)
        .json({
          msg: 'Available balance not sufficient',
          success: false,
        });
    }

    console.log('entering prisma transaction')
    
    const result = await prisma.$transaction(
              async (prisma) => {

                // Calculate the fee (1.2% of the amount)
                const fee = amount * 0.012;
                const adjustedAmount = amount - fee;

                // deduct fee amount
                await walletService.offchain_Transfer(
                  user.id,
                  type === 'SELL'? pair?.baseWalletId as string: pair?.quoteWalletId as string,
                  type === 'SELL'? pair?.base as Currency: pair?.quote as Currency,
                  fee,
                  type === 'SELL'? baseWalletExists.id: quoteWalletExists.id
                )

                // block adjustedAmount
                const blockId = await walletService.block_Amount(adjustedAmount, type === 'SELL'? baseWalletExists.id: quoteWalletExists.id)
    
                const order = await prisma.order.create({
                  data:{
                    userId: userData?.id,
                    baseWalletId: baseWalletExists.id,
                    quoteWalletId: quoteWalletExists.id,
                    blockId,
                    amount,
                    type,
                    pairId,
                    price
                  }
                })
    
                return {
                  order
                }
              },
              {
                maxWait: 50000, // default: 2000
                timeout: 50000, // default: 5000
              }

    )

    try {


      return res
        .status(200)
        .json({
          msg: 'Order created Successfully',
          success: true,
          order: result.order
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

  async processOrder(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const {amount, orderId } = req.body;
   

    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    })

    const order = await prisma.order.findUnique({
      where:{id: orderId}
    })

    const pair = await prisma.pair.findFirst({
      where:{id: order?.pairId}
    })

    const userBaseWallet = await prisma.wallet.findFirst({
      where:{
        currency: pair?.base as Currency,
        userId: user.id
      }
    })

    const userQuoteWallet = await prisma.wallet.findFirst({
      where:{
        currency: pair?.quote as Currency,
        userId: user.id
      }
    })

    if (!userBaseWallet || !userQuoteWallet) {
      return res.status(400)
        .json({
          msg: 'User wallet does not exist',
          success: false,
        });
    }

    const orderBaseWallet = await prisma.wallet.findUnique({
      where:{
        id: order?.baseWalletId as string
      }
    })

    const orderQuoteWallet = await prisma.wallet.findUnique({
      where:{
        id: order?.quoteWalletId as string
      }
    })

    if (!orderBaseWallet || !orderQuoteWallet) {
      return res.status(400)
        .json({
          msg: 'Order wallet not found',
          success: false,
      });
    }

    if (order?.status !== "OPEN") {
      return res.status(400)
        .json({
          msg: 'Order is not open',
          success: false,
      });
    }

    // Validate user balances
    if (order?.type === "BUY" && userBaseWallet.availableBalance < amount) {
      return res.status(400)
        .json({
          msg: 'Insufficient base currency balance.',
          success: false,
      });
    }

    if (order?.type === "SELL" && userQuoteWallet.availableBalance < amount) {
      return res.status(400)
        .json({
          msg: 'Insufficient quote currency balance.',
          success: false,
      });
    }


    try {

      const result = await prisma.$transaction(
        async (prisma) => {

          let amountToProcess: number;

          amountToProcess = order?.type === "BUY"
          ? amount / order.price // User is sending base, calculate quote amount
          : amount * order.price; // User is sending quote, calculate base amount

          const amountLeft = order?.amount - (order?.amountProcessed + amount)

          let orderTransfer;
          let newBlockId;
          let userTransfer;

          if (order?.type === "BUY"){
            // User sends base currency, order sends quote currency

            // order sends quote currency
            orderTransfer = await walletService.unblock_Transfer(amountToProcess, order?.blockId as string, userQuoteWallet.id)
            newBlockId = await walletService.block_Amount(amountLeft, orderQuoteWallet.id)
            // user sends base currency
            userTransfer = await walletService.offchain_Transfer(user.id, orderBaseWallet.id, pair?.base as Currency, amount, userBaseWallet.id)

          } else {
            // User sends quote currency, order sends base currency

            // order sends base currency
            orderTransfer = await walletService.unblock_Transfer(amountToProcess, order?.blockId as string, userBaseWallet.id)
            newBlockId = await walletService.block_Amount(amountLeft, orderBaseWallet.id)
            // user sends quote currency
            userTransfer = await walletService.offchain_Transfer(user.id, orderQuoteWallet.id, pair?.quote as Currency, amount, userQuoteWallet.id)

          }

          const updatedOrder = await prisma.order.update({
            where:{id: order.id },
            data:{
              blockId: newBlockId,
              amountProcessed: order?.amountProcessed + amountToProcess,
              percentageProcessed: ((order?.amountProcessed + amountToProcess) / order?.amount) * 100,
              status: (order.amountProcessed + amountToProcess) >= order?.amount ? 'CLOSED' :'OPEN'
            }
          })

          
          return {
            order: updatedOrder
          }
        },
        {
          maxWait: 50000, // default: 2000
          timeout: 50000, // default: 5000
        }

      )


      return res
        .status(200)
        .json({
          msg: 'Order Processed Successfully',
          success: true,
          order: result.order
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

  async fetchOrders(req: Request | any, res: Response) {
    const { limit, page, type, pairId } = req.query;

    try {

      const totalCount = await prisma.order.count();

      const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
      console.log(limit)
      const totalPages = Math.ceil(totalCount / itemLimit);

      const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
      const skip = (currentPage - 1) * itemLimit;

      const orders = await prisma.order.findMany({
        where:{
          ...(type && { type }),
          ...(pairId && { pairId })
        },
        skip: skip,
        take: itemLimit || 20
      })

      return res
        .status(200)
        .json({
          msg: 'Successful',
          success: true,
          totalCount: totalCount,
          totalPages: totalPages,
          limit: itemLimit,
          currentPage: currentPage,
          orders,
        });

    } catch (error) {
      console.error(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

  async fetchPairs(req: Request | any, res: Response) {
    // const { limit, page, type, pairId } = req.query;

    try {

      const totalCount = await prisma.order.count();

      // const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
      // console.log(limit)
      // const totalPages = Math.ceil(totalCount / itemLimit);

      // const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
      // const skip = (currentPage - 1) * itemLimit;

      const pairs = await prisma.pair.findMany({
        include:{
          baseWallet: true,
          quoteWallet: true
        }
      })

      return res
        .status(200)
        .json({
          msg: 'Successful',
          success: true,
          totalCount: totalCount,
          pairs,
        });

    } catch (error) {
      console.error(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

  async fetchPairWallets(req: Request & Record<string, any>, res: Response) {
    const { user } = req;
    const { orderType, pairId } = req.query;

    try {

      let baseWallet;
      let quoteWallet;

      const pair = await prisma.pair.findFirst({
        where:{id: pairId as string}
      })

      if (!pair) {
        return res.status(400)
          .json({
            msg: 'pair not found',
            success: false,
          });
      }

      baseWallet = await prisma.wallet.findFirst({
        where:{
          userId: user.id, 
          currency: pair.base as Currency
        }
      })
      quoteWallet = await prisma.wallet.findFirst({
        where:{
          userId: user.id, 
          currency: pair.quote as Currency
        }
      })

      baseWallet = await walletService.getAccount(baseWallet?.id as string)
      quoteWallet = await walletService.getAccount(quoteWallet?.id as string)
      // console.log('main wallet data', wallet)
      

      // console.log('Fetched wallets: ', wallet);


      return res
        .status(200)
        .json({
          msg: 'wallets fetched Successfully',
          success: true,
          baseWallet,
          quoteWallet
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
    }
  }

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

  // async fetchStores(req: Request, res: Response) {
  //   const { longitude, latitude } = req.query;

  //   if (!longitude || !latitude) {
  //     return res.status(400).send('Location required');
  //   }

  //   try {
  //     const stores = await prisma.store.findMany();

  //     res.status(200).send(stores);
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send(error);
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

export default new OrderController();
