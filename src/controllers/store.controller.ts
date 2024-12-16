// import { OrderStatus, PrismaClient, StoreStatus, TransactionStatus, UserType } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import config from '../config/env.config';
import mailService from '../services/mail.service';
import { generateRefCode, OTP_CODE_EXP, hashData } from '../utils';
import transactionService from '../services/transaction.service';
import dashboardService from '../services/dashboard.service';
import notificationService from '../services/notification.service';
import walletService from '../services/wallet.service';
import orderService from '../services/order.service';
import { calculateDistance } from '../utils';

import { serve } from 'swagger-ui-express';
import { endOfDay, startOfDay } from 'date-fns';
import { configDotenv } from 'dotenv';

class StoreController {
  // async createStore(req: Request & Record<string, any>, res: Response) {
  //   const { name, latitude, longitude, location, admin } = req.body;
  //   const creator = req.user;
  //   let storeAdminId;
  //   let isNewUser = false;

  //   try {
  //     // const result = await prisma.$transaction(async (prisma) => {
  //     const adminUser = await prisma.user.findUnique({
  //       where: { email: admin.email },
  //     });

  //     const organisation = await prisma.organisation.findUnique({
  //       where:{id:creator.organisationId}
  //     })

  //     const role = await prisma.role.findFirst({
  //       where:{ name: 'superAdmin' }
  //     })

  //     console.log('first part', adminUser)

  //     console.log('adminId', adminUser?.id)

  //     if (adminUser) {
  //       console.log('adminId', adminUser.id)
  //       storeAdminId = adminUser.id;
  //     } else {
  //       const otpCode = generateRefCode();
  //       isNewUser = true;
  //       const defaultPassword = generateRefCode('pass', 10)
  //       const encryptedPassword = await hashData(defaultPassword);
  //       const newStoreAdmin = await prisma.user.create({
  //         data: {
  //           email: admin.email,
  //           firstName: admin.firstName,
  //           lastName: admin.lastName,
  //           organisationId: organisation?.id,
  //           phoneNumber: admin.phoneNo,
  //           type: UserType.ORGANISATIONSTAFF,
  //           otpCode: otpCode,
  //           otpCodeExpiryTime: OTP_CODE_EXP,
  //           photoUrl: config.defaultPhotoUrl,
  //           password: encryptedPassword,
  //           verified: true,
  //           roleId: role?.id ?? "clycs1ims0000ts0z4fdvvflp"
  //         },

  //       });
  //       console.log('first part', newStoreAdmin)

  //       storeAdminId = newStoreAdmin.id;
  //       const url = `${config.urls.salesDashboard}/create-password?user=${newStoreAdmin?.id}&code=${otpCode}`;
  //       // await mailService.sendMail(newStoreAdmin.email, url);

  //       await mailService.sendInvitationWithDetails(newStoreAdmin.email,newStoreAdmin.firstName, defaultPassword, name,organisation?.name!,url)
  //     }

  //     console.log('entering creating store')
  //     // Create the store

  //     console.log(req.body)
  //     const store = await prisma.store.create({
  //       data: {
  //         name: name,
  //         latitude: String(latitude),
  //         longitude: String(longitude),
  //         location: location,
  //         status: StoreStatus.ACTIVE,
  //         creator: { connect: { id: creator.id } },
  //         organisation: { connect: { id: creator.organisationId } },
  //         wallet: {
  //           create: {
  //             currency: config.defaultCurrency
  //           }
  //         }
  //       },
  //       include: { organisation : true }
  //     });
  //     console.log('the store part', store)

  //     const storeAdmin = await prisma.storeAdmin.create({
  //       data: {
  //         userId: storeAdminId,
  //         storeId: store.id,
  //         roleId: 'clycs1ims0000ts0z4fdvvflp'
  //       },
  //     });

  //     console.log('the store admin', storeAdmin)

  //     //   return { store, storeAdmin };
  //     // });

  //     return res.status(200).json({
  //       msg: isNewUser
  //         ? 'Store created and create password link sent to admin email'
  //         : 'Store created and admin assigned to store',
  //       store: store.name,
  //       storeAdmin: storeAdmin,
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Internal Server Error', error });
  //   } finally {
  //     // await prisma.$disconnect();
  //   }
  // }

  // async updateStore(req: Request & Record<string, any>, res: Response) {
  //   const { name, latitude, longitude, location } = req.body;
  //   const storeId = req.params.id;

  //   const creator = req.user;
  //   let storeAdminId;

  //   try {

  //     const store = await prisma.store.findUnique({
  //       where:{id: storeId }
  //     })

  //     console.log(req.body)
  //     const updatedStore = await prisma.store.update({
  //       where:{id: storeId },
  //       data: {
  //         name: name ? name : store?.name,
  //         latitude: latitude ? String(latitude) :store?.latitude,
  //         longitude: longitude ? String(longitude) : store?.longitude,
  //         location: location ? location : store?.location,
  //       }
  //     });
  //     console.log('the store part', store)
      

  //     return res.status(200).json({
  //       msg:'Store Updated Successfully',
  //       store:updatedStore,
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Internal Server Error', error });
  //   }
  // }

  // async createStoreAdmin(req: Request & Record<string, any>, res: Response) {
  //   const { firstName, lastName, email, password, roleId } = req.body;
  //   console.log('started operation', firstName, lastName, email, password, roleId)
  //   const creator = req.user;
  //   console.log(creator)
  //   // fetch storeAdmin 
  //   const organisation = await prisma.organisation.findFirst({
  //     where: { id: creator.organisationId }
  //   })
  //   console.log(organisation)
  //   const admin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id }
  //   })
  //   console.log("storeAdmin", admin)
  //   // fetch store
  //   const store = await prisma.store.findUnique({
  //     where: { id: admin?.storeId }
  //   })
  //   console.log("store", store)
  //   // fetch Role
  //   const adminRole = await prisma.role.findUnique({
  //     where: { id: roleId }
  //   });
  //   if (!adminRole) return res.status(400).json({ msg: 'role not found', success: false });
  //   console.log(adminRole)

  //   let newStoreAdmin;

  //   try {
  //     // const result = await prisma.$transaction(async (prisma) => {
  //     console.log('first part', firstName, lastName, email)

  //     const userExist = await prisma.user.findUnique({
  //       where: { email: email },
  //     });

  //     if (userExist) {
  //       // if user exists no matter the usertype
  //       const adminUser = await prisma.storeAdmin.findFirst({
  //         where: { userId: userExist.id }
  //       });

  //       if (adminUser) {
  //         // if user exists and is already a store admin
  //         return res.status(200).json({ msg: 'user already an admin', adminUser, success: false });

  //       } else {
  //         // user already exists but not an admin
  //         // make user an admin
  //         console.log('user already exists but not an admin')

  //         const result = await prisma.$transaction(
  //           async (prisma) => {

  //             if (creator.type == "ORGANISATIONSTAFF") {

  //               newStoreAdmin = await prisma.storeAdmin.create({
  //                 data: {
  //                   user: { connect: { id: userExist.id } },
  //                   role: { connect: { id: adminRole.id } },
  //                   store: { connect: { id: store?.id } }
  //                 }
  //               });

  //             }
  //             // and update user update with the required role
  //             const updatedUser = await prisma.user.update({
  //               where: { id: userExist.id },
  //               data: { roleId: roleId },
  //             })

  //             return updatedUser

  //           },
  //           {
  //             maxWait: 5000, // default: 2000
  //             timeout: 10000, // default: 5000
  //           }
  //         )

  //         console.log(result)

  //         if (creator.type == "ORGANISATIONSTAFF") {
  //           await mailService.sendInvitation(
  //             email,
  //             firstName,
  //             store?.name!,
  //             organisation?.name!,
  //             'https://google.com'
  //           );

  //         } else {

  //           await mailService.sendAdminInvitation(
  //             email,
  //             firstName,
  //             organisation?.name!,
  //             'https://google.com'
  //           );

  //         }

  //         return res.status(200).json({ msg: 'user Updated successfully', result, success: true });


  //       }



  //     }


  //     const result = await prisma.$transaction(
  //       async (prisma) => {

  //         const otpCode = generateRefCode();
  //         const encryptedPassword = await hashData(password);

  //         const newAdmin = await prisma.user.create({
  //           data: {
  //             email: email,
  //             firstName: firstName,
  //             lastName: lastName,
  //             organisationId: organisation?.id,
  //             type: UserType.ORGANISATIONSTAFF,
  //             otpCode: otpCode,
  //             otpCodeExpiryTime: OTP_CODE_EXP,
  //             photoUrl: config.defaultPhotoUrl,
  //             password: encryptedPassword,
  //             roleId: roleId
  //           },

  //         });

  //         if (creator.type == "ORGANISATIONSTAFF") {

  //           newStoreAdmin = await prisma.storeAdmin.create({
  //             data: {
  //               user: { connect: { id: newAdmin.id } },
  //               role: { connect: { id: adminRole.id } },
  //               store: { connect: { id: store?.id } },
  //             },
  //           });

  //         }

  //         return newAdmin

  //       },
  //       {
  //         maxWait: 5000, // default: 2000
  //         timeout: 10000, // default: 5000
  //       }
  //     )

  //     console.log(result)

  //     if (creator.type == "ORGANISATIONSTAFF") {
  //       await mailService.sendInvitationWithDetails(
  //         email,
  //         firstName,
  //         password,
  //         store?.name!,
  //         organisation?.name!,
  //         'https://google.com'
  //       );

  //     } else {

  //       await mailService.sendAdminInvitationWithDetails(
  //         email,
  //         firstName,
  //         password,
  //         organisation?.name!,
  //         'https://google.com'
  //       );

  //     }

  //     return res.status(200).json({
  //       msg: 'User created and email sent successfully',
  //       storeAdmin: newStoreAdmin,
  //       success: true
  //     });


  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Internal Server Error', error, success: false });
  //   } finally {
  //     // await prisma.$disconnect();
  //   }
  // }

  // async fetchStoreAdmins(req: Request | any, res: Response) {
  //   const { limit, page } = req.query;

  //   const creator = req.user;
  //   console.log(creator)
  //   // fetch storeAdmin 
  //   const admin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id }
  //   })
  //   console.log("storeAdmin", admin)

  //   if (!admin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'admin not found', success: false });
  //   }

  //   try {


  //     const totalCount = await prisma.storeAdmin.count({
  //       where: {
  //         storeId: admin.storeId,
  //       }
  //     });


  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const users = await prisma.storeAdmin.findMany({
  //       where: {
  //         storeId: admin.storeId,
  //       },
  //       include: {
  //         user: true,
  //         role: true
  //       },
  //       skip: skip,
  //       take: itemLimit || 20
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         users: users,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async deleteAdmin(req: Request | any, res: Response) {
  //   const adminId = req.params.id;

  //   const creator = req.user;
  //   console.log(creator)
  //   // fetch storeAdmin
  //   const admin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id }
  //   })
  //   console.log("storeAdmin", admin)
  //   if (!admin) {
  //     return res.status(404).json({ msg: 'admin not found' });
  //   }

  //   try {

  //     const existingAdmin = await prisma.storeAdmin.findUnique({
  //       where: {
  //         id: adminId,
  //       }
  //     });

  //     const result = await prisma.$transaction(async (prisma) => {
  //       const deletedAdmin = await prisma.storeAdmin.delete({
  //         where: { id: existingAdmin?.id },
  //       });

  //       // Then delete the user
  //       const deletedUser = await prisma.user.delete({
  //         where: { id: existingAdmin?.userId },
  //       });

  //       return deletedUser;
  //     });

  //     return res.status(200).json({
  //       msg: 'admin deleted successfully',
  //       deletedUser: result,
  //       success: true,
  //     });


  //   } catch (error) {
  //     console.log(error);
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }


  // async fetchStores(req: Request, res: Response) {
  //   const { longitude, latitude } = req.query;
  //   const maxDistance = 5;

  //   if (!longitude || !latitude) {

  //     const stores = await prisma.store.findMany({
  //       take: 10
  //     })

  //     // return res.status(400).send('Location required');
  //     return res.status(201).json({
  //       msg: 'Location Required',
  //       success: true,
  //       stores: stores
  //     });


  //   }

  //   try {

  //     const stores = await prisma.store.findMany();

  //     //find nearby stores by distance
  //     const nearbyStores = stores.filter(store => {
  //       if (store.latitude === null || store.longitude === null) return false;
  //       const storeLatitude = Number(store.latitude)
  //       const storeLongitude = Number(store.longitude)

  //       const distance = calculateDistance(Number(latitude), Number(longitude), storeLatitude, storeLongitude);
  //       return distance <= maxDistance;
  //     });

  //     return res.status(201).json({
  //       msg: 'Stores fetched successfully',
  //       success: true,
  //       stores: nearbyStores
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }


  // async fetch_Organisation_Stores(req: Request & Record<string, any>, res: Response) {
  //   const { limit, page, date_from, date_to } = req.query;

  //   const creator = req.user
  //   const search = req.query.search as string ?? null;

  //   let dateFrom: Date | null = null;
  //   let dateTo: Date | null = null;

  //   if (creator.type !== 'ORGANISATIONADMIN') {
  //     return res.status(403).json({ msg: 'User Not Authorised', success: false, });
  //   }

  //   try {
  //     const totalCount = await prisma.store.count({
  //       where: {
  //         organisationId: creator.organisationId as string,
  //       }
  //     });

  //     const itemLimit = limit ? parseInt(limit as string) : 20;
  //     const totalPages = Math.ceil(totalCount / itemLimit);
  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     // const stores = await prisma.store.findMany({
  //     //     where: {
  //     //       organisationId: creator.organisationId as string,
  //     //     },
  //     //     skip: skip,
  //     //     take: itemLimit,
  //     // });

  //     if (date_from && date_to) {
  //       dateFrom = new Date(date_from as string);
  //       dateTo = new Date(date_to as string);
  //     }

  //     const stores = await storeService.fetchOrganizationStores(creator.organisationId, skip, itemLimit, dateFrom, dateTo, search)

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         stores: stores,
  //       });


  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async deleteStore(req: Request, res: Response) {
  //   const storeId = req.params.id;

  //   try {
  //     const existingStore = await prisma.store.findUnique({
  //       where: { id: storeId },
  //     });

  //     if (!existingStore) {
  //       return res.status(404).json({ msg: 'Store not found' });
  //     }

  //     const result = await prisma.$transaction(async (prisma) => {
  //       const deletedAdmins = await prisma.storeAdmin.deleteMany({
  //         where: { storeId },
  //       });

  //       // Then delete the store itself
  //       const deletedStore = await prisma.store.delete({
  //         where: { id: storeId },
  //       });

  //       return { deletedStore, deletedAdmins };
  //     });

  //     return res.status(200).json({
  //       msg: 'Store deleted successfully',
  //       deletedStore: result.deletedStore,
  //       deletedAdmins: result.deletedAdmins,
  //       success: true,
  //     });
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   } finally {
  //     await prisma.$disconnect();
  //   }
  // }

  // async fetchTransactions(req: Request & Record<string, any>, res: Response) {
  //   const { limit, page } = req.query;

  //   const creator = req.user;
  //   console.log(creator)
  //   // fetch storeAdmin 
  //   const admin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id }
  //   })

  //   if (!admin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'admin not found', success: false });
  //   }

  //   try {
  //     const totalCount = await prisma.transaction.count({
  //       where: {
  //         storeId: admin.storeId,
  //       }
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     const totalPages = Math.ceil(totalCount / itemLimit);
  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const transactions = await prisma.transaction.findMany({
  //       where: {
  //         storeId: admin.storeId,
  //       },
  //       include: {
  //         user: true
  //       },
  //       skip: skip,
  //       take: itemLimit || 20
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         transactions: transactions,
  //       });


  //   } catch (error) {
  //     console.log(error)
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async fetchTransaction(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const { reference } = req.query;

  //   if (!reference) {
  //     return res.status(400).send('reference required');
  //   }

  //   const admin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id }
  //   })

  //   if (!admin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'admin not found', success: false });
  //   }

  //   try {
  //     const transaction = await prisma.transaction.findFirst({
  //       where: {
  //         reference: reference as string,
  //       },
  //       include: {
  //         user: true
  //       },

  //     });

  //     console.log('Fetched order: ', transaction);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'transaction fetched Successfully',
  //         success: true,
  //         transaction
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async searchTransaction(req: Request & Record<string, any>, res: Response) {
  //   const { limit, page, keyword } = req.query;
  //   const creator = req.user

  //   try {

  //     if (!keyword) {
  //       return res.status(400).json({ msg: 'Search keyword is required', success: false })
  //     }

  //     const admin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id }
  //     })

  //     if (!admin) {
  //       return res
  //         .status(400)
  //         .json({ msg: 'admin not found', success: false });
  //     }

  //     const totalCount = await prisma.transaction.count({
  //       where: {
  //         storeId: admin.storeId,
  //         OR: [
  //           {
  //             user: {
  //               firstName: {
  //                 contains: keyword as string,
  //                 mode: 'insensitive'
  //               }
  //             },
  //           },
  //           {
  //             user: {
  //               lastName: {
  //                 contains: keyword as string,
  //                 mode: 'insensitive'
  //               }
  //             },
  //           },
  //           {
  //             id: {
  //               contains: keyword as string,
  //               mode: 'insensitive'
  //             },
  //           },
  //           {
  //             reference: {
  //               contains: keyword as string,
  //               mode: 'insensitive'
  //             },
  //           },

  //         ]
  //       }
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const transactions = await prisma.transaction.findMany({
  //       where: {
  //         storeId: admin.storeId,
  //         OR: [
  //           {
  //             user: {
  //               firstName: {
  //                 contains: keyword as string,
  //                 mode: 'insensitive'
  //               }
  //             },
  //           },
  //           {
  //             user: {
  //               lastName: {
  //                 contains: keyword as string,
  //                 mode: 'insensitive'
  //               }
  //             },
  //           },
  //           {
  //             id: {
  //               contains: keyword as string,
  //               mode: 'insensitive'
  //             },
  //           },
  //           {
  //             reference: {
  //               contains: keyword as string,
  //               mode: 'insensitive'
  //             },
  //           },
  //           {
  //             orderId: {
  //               contains: keyword as string,
  //               mode: 'insensitive'
  //             }
  //           }
  //         ]
  //       },
  //       include: {
  //         user: true,
  //         store: true,
  //       },
  //       skip: skip,
  //       take: itemLimit || 20
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         transactions,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async transactionFilterByDate(req: Request & Record<string, any>, res: Response) {
  //   const { limit, page, date_from, date_to } = req.query;
  //   const creator = req.user

  //   try {

  //     if (!date_from || !date_to) {
  //       return res.status(400).json({ msg: 'Date from and Date to are required', success: false })
  //     }

  //     const admin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id }
  //     })

  //     if (!admin) {
  //       return res
  //         .status(400)
  //         .json({ msg: 'admin not found', success: false });
  //     }

  //     const dateFrom = new Date(date_from as string);
  //     const dateTo = new Date(date_to as string);

  //     const totalCount = await prisma.transaction.count({
  //       where: {
  //         storeId: admin.storeId,
  //         createdAt: {
  //           gte: startOfDay(dateFrom),
  //           lte: endOfDay(dateTo),
  //         },
  //       }
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const transactions = await prisma.transaction.findMany({
  //       where: {
  //         storeId: admin.storeId,
  //         createdAt: {
  //           gte: startOfDay(dateFrom),
  //           lte: endOfDay(dateTo),
  //         },
  //       },
  //       include: { user: true, store: true },
  //       skip: skip,
  //       take: itemLimit || 20
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         transactions,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async transactionFilterByStatus(req: Request & Record<string, any>, res: Response) {
  //   const { limit, page, status } = req.query;
  //   const creator = req.user

  //   try {

  //     if (!status) {
  //       return res.status(400).json({ msg: 'Status is required', success: false })
  //     }

  //     const admin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id }
  //     })

  //     if (!admin) {
  //       return res
  //         .status(400)
  //         .json({ msg: 'admin not found', success: false });
  //     }

  //     const totalCount = await prisma.transaction.count({
  //       where: {
  //         storeId: admin.storeId,
  //         status: status as TransactionStatus,
  //       }
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const transactions = await prisma.transaction.findMany({
  //       where: {
  //         storeId: admin.storeId,
  //         status: status as TransactionStatus
  //       },
  //       include: { user: true, store: true },
  //       skip: skip,
  //       take: itemLimit || 20
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         transactions,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async fetchDashboardData(req: Request & Record<string, any>, res: Response) {
  //   const user = req.user
  //   const {filter, store_id } = req.query
  //   let storeId = null
  //   let revenueCategory

  //   storeId = (store_id as string)
  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id },
  //     include: { store: true },
  //   });

  //   if (storeAdmin !== null) {
  //     storeId = storeAdmin?.storeId
  //   }

  //   let data; 
    
    
  //   let currentDateFrom: Date | null = null;
  //   let currentDateTo: Date | null = null;

  //   let previousDateFrom: Date | null = null;
  //   let previousDateTo: Date | null = null;
    
  //   let dateFilter: string = 'alltime'

  //   try {
      
  //     if(filter){
  //       dateFilter = filter as string
  //     }

  //     const getDateRange = await dashboardService.getDateRange(dateFilter) 
  //     currentDateFrom = getDateRange.dateFrom
  //     currentDateTo = getDateRange.dateTo


  //     const getPreviousDateRange = await dashboardService.getPreviousDateRange(dateFilter)
  //     previousDateFrom = getPreviousDateRange.dateFrom
  //     previousDateTo = getPreviousDateRange.dateTo

  //     const currentOverview = await dashboardService.getStoreDashboardOverview(storeId, currentDateFrom, currentDateTo)
  //     const previousOverview = await dashboardService.getStoreDashboardOverview(storeId, previousDateFrom, previousDateTo)

  //     const revenuePercentageChange = await dashboardService.calculateRevenuePercentageChange(Number(currentOverview.revenue), Number(previousOverview.revenue))
  //     const productPercentageChange = await dashboardService.calculateProductPercentageChange(Number(currentOverview.products), Number(previousOverview.products))
  //     const orderPercentageChange = await dashboardService.calculateOrderPercentageChange(Number(currentOverview.orders), Number(previousOverview.orders))

  //     const monthlySalesInflow: any = {
  //       January: 0, February: 0, March: 0,
  //       April: 0, May: 0, June: 0,
  //       July: 0, August: 0, September: 0,
  //       October: 0, November: 0, December: 0,
  //     }

  //     const monthlySalesOutflow: any = {
  //       January: 0, February: 0, March: 0,
  //       April: 0, May: 0, June: 0,
  //       July: 0, August: 0, September: 0,
  //       October: 0, November: 0, December: 0,
  //     }

  //     const currentYear = new Date().getFullYear();

  //     const salesInflow = await dashboardService.getMonthlySalesInflow(null, storeId, currentYear)
  //     salesInflow.forEach((transaction) => {
  //       const month = new Date(transaction.createdAt).toLocaleString('default', { month: 'long' });
  //       if (monthlySalesInflow[month] !== undefined) {
  //         monthlySalesInflow[month] += Number(transaction._sum.amount);
  //       }
  //     });

  //     const salesOutflow = await dashboardService.getMonthlySalesOutflow(null, storeId, currentYear)
  //     salesOutflow.forEach((transaction) => {
  //       const month = new Date(transaction.createdAt).toLocaleString('default', { month: 'long' });
  //       if (monthlySalesOutflow[month] !== undefined) {
  //         monthlySalesOutflow[month] += Number(transaction._sum.amount);
  //       }
  //     });

  //     const topSellingProducts = await dashboardService.getTopSellingProducts(null, storeId)
  //     const topSelling = await Promise.all(topSellingProducts.map(async (item) => {
  //       const product = await prisma.product.findUnique({
  //         where: { id: item.productId as string },
  //         include: { images: true }
  //       });
  //       return {
  //         product,
  //         amountSold: item._sum.price || 0,
  //         quantitySold: item._sum.cart_Quantity || 0,
  //       };
  //     }));

  //     const revenueCategoryCount = await dashboardService.getRevenueCategories(null, storeId)
      
  //     if(revenueCategoryCount){
  //       revenueCategory = await Promise.all(revenueCategoryCount.map(async (item) => {
  //         const product = await prisma.product.findUnique({
  //           where: { id: item.productId as string },
  //           include: { categories: true, images: true }
  //         });
  //         return {
  //           // product,
  //           category: product?.categories[0] ?? [],
  //           count: item._count
  //         };
  //       }));
  //     }

  //     const lowStockProducts = await dashboardService.getLowQuantityStock(null, storeId);

  //     data = {
  //       store: storeAdmin?.store,
  //       revenue: currentOverview.revenue,
  //       products: currentOverview.products,
  //       orders: currentOverview.orders,
  //       revenuePercentageChange,
  //       productPercentageChange,
  //       orderPercentageChange,
  //       monthlySalesInflow,
  //       monthlySalesOutflow,
  //       topSelling,
  //       revenueCategory,
  //       lowStockProducts
  //     }

  //     return res.status(201).json({
  //       msg: 'Dashboard data fetched successfully',
  //       success: true,
  //       data
  //     });

  //   } catch (error) {
  //     console.log(error)
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async getNotification(req: Request & Record<string, any>, res: Response) {
  //   const user = req.user
  //   const { date_from, date_to } = req.query

  //   let storeId = null
  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id }
  //   });

  //   if (storeAdmin != null) {
  //     storeId = storeAdmin?.storeId
  //   }

  //   try {
  //     let dateFrom: Date | null = null;
  //     let dateTo: Date | null = null;

  //     if (date_from && date_to) {
  //       dateFrom = new Date(date_from as string);
  //       dateTo = new Date(date_to as string);
  //     }

  //     const notifications = await notificationService.getStoreNotification(storeId, dateFrom, dateTo)

  //     return res.status(201).json({
  //       msg: 'Notifications fetched successfully',
  //       success: true,
  //       notifications
  //     });

  //   } catch (error) {
  //     console.log(error)
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async getOrders(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const page = req.query.page as string | null;
  //   const limit = req.query.limit as string | null;
  //   const status = req.query.status as string ?? null;
  //   const search = req.query.search as string ?? null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id }
  //   });

  //   if (!storeAdmin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'Store does not have an admin', success: false });
  //   }

  //   try {

  //     const totalCount = await prisma.order.count({
  //       where: {
  //         OR: [
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(search !== null && { id: search }),
  //             // ...(search !== null && { id: { contains: search}})

  //           },
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(status !== null && { Status: status as OrderStatus }),
  //           },
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(search !== null && {
  //               user: {
  //                 firstName: {
  //                   contains: search,
  //                 }
  //               }
  //             })

  //           },
  //         ],
  //       },
  //     });

  //     const itemLimit = limit ? parseInt(limit as string) : 20;
  //     const totalPages = Math.ceil(totalCount / itemLimit);
  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;


  //     const orders = await prisma.order.findMany({
  //       where: {
  //         OR: [
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(search !== null && { id: search }),
  //             // ...(search !== null && { id: { contains: search}})

  //           },
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(status !== null && { Status: status as OrderStatus }),
  //           },
  //           {
  //             storeId: storeAdmin.storeId,
  //             ...(search !== null && {
  //               user: {
  //                 firstName: {
  //                   contains: search,
  //                 }
  //               }
  //             })

  //           },
  //         ],
  //       },
  //       include: { user: true, store: true, products: true },
  //       skip: skip,
  //       take: itemLimit,
  //     });


  //     console.log('Fetched orders: ', orders);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         orders: orders,
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async searchOrders(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const page = req.query.page as string | null;
  //   const limit = req.query.limit as string | null;
  //   const search = req.query.search as string ?? null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id }
  //   });

  //   if (!storeAdmin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'Store does not have an admin', success: false });
  //   }

  //   try {

  //     const totalCount = await prisma.order.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         OR: [
  //           {
  //             user: {
  //               firstName: {
  //                 contains: search,
  //                 mode: 'insensitive'
  //               }
  //             }
  //           },
  //           {
  //             id: {
  //               contains: search,
  //               mode: 'insensitive'
  //             }
  //           }
  //         ],
  //       },
  //     });

  //     const itemLimit = limit ? parseInt(limit as string) : 20;
  //     const totalPages = Math.ceil(totalCount / itemLimit);
  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;


  //     const orders = await prisma.order.findMany({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         OR: [
  //           {
  //             user: {
  //               firstName: {
  //                 contains: search,
  //                 mode: 'insensitive'
  //               }
  //             }
  //           },
  //           {
  //             id: {
  //               contains: search,
  //               mode: 'insensitive'
  //             }
  //           }
  //         ],
  //       },
  //       include: { user: true, store: true, products: true },
  //       skip: skip,
  //       take: itemLimit,
  //     });


  //     console.log('Fetched orders: ', orders);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         orders: orders,
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }

  // async filterOrdersByStatus(req: Request & Record<string, any>, res: Response) {
  //   const { user } = req;
  //   const page = req.query.page as string | null;
  //   const limit = req.query.limit as string | null;
  //   const status = req.query.status as string ?? null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: user.id }
  //   });

  //   if (!storeAdmin) {
  //     return res
  //       .status(400)
  //       .json({ msg: 'Store does not have an admin', success: false });
  //   }

  //   try {

  //     const totalCount = await prisma.order.count({
  //       where: {
  //         Status: status as OrderStatus
  //       },
  //     });

  //     const itemLimit = limit ? parseInt(limit as string) : 20;
  //     const totalPages = Math.ceil(totalCount / itemLimit);
  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;


  //     const orders = await prisma.order.findMany({
  //       where: {
  //         Status: status as OrderStatus
  //       },
  //       include: { user: true, store: true, products: true },
  //       skip: skip,
  //       take: itemLimit,
  //     });


  //     console.log('Fetched orders: ', orders);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         orders: orders,
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ msg: 'Something went wrong', error });
  //   }
  // }
}

export default new StoreController();
