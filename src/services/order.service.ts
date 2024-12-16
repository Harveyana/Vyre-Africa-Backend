import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
// import { OrderStatus } from '@prisma/client';

class OrderService {
    // async getUserOrders(cursor: string | null, status: string | null, limit: string | null, userId: string) {
    //     let orders;

    //     if (cursor !== null) {

    //         if (status !== null) {
    //             orders = await prisma.order.findMany({
    //                 take: limit ? parseInt(limit as string) : 10,
    //                 skip: 1,
    //                 cursor: {
    //                     id: cursor as string,
    //                 },
    //                 where: {
    //                     userId,
    //                     Status: status as OrderStatus
    //                 },
    //                 include: {
    //                     products: true,
    //                 },
    //             });
    //         }

    //         orders = await prisma.order.findMany({
    //             take: limit ? parseInt(limit as string) : 10,
    //             skip: 1,
    //             cursor: {
    //                 id: cursor as string,
    //             },
    //             where: {
    //                 userId
    //             },
    //             include: {
    //                 products: true,
    //             },
    //         });
    //     } else {
    //         if (status !== null) {
    //             orders = await prisma.order.findMany({
    //                 take: limit ? parseInt(limit as string) : 10,
    //                 where: {
    //                     userId,
    //                     Status: status as OrderStatus
    //                 },
    //                 include: {
    //                     products: true,
    //                 },
    //             });
    //         }

    //         orders = await prisma.order.findMany({
    //             take: limit ? parseInt(limit as string) : 10,
    //             where: {
    //                 userId
    //             },
    //             include: {
    //                 products: true,
    //             },
    //         });
    //     }

    //     return orders;
    // }

    // async getStoreOrders(cursor: string | null, status: string | null, limit: string | null, storeId: string) {
    //     let orders;

    //     if (cursor !== null) {

    //         if (status !== null) {
    //             orders = await prisma.order.findMany({
    //                 take: limit ? parseInt(limit as string) : 10,
    //                 skip: 1,
    //                 cursor: {
    //                     id: cursor as string,
    //                 },
    //                 where: {
    //                     storeId,
    //                     Status: status as OrderStatus
    //                 },
    //                 include: {
    //                     products: true,
    //                 },
    //             });
    //         }

    //         orders = await prisma.order.findMany({
    //             take: limit ? parseInt(limit as string) : 10,
    //             skip: 1,
    //             cursor: {
    //                 id: cursor as string,
    //             },
    //             where: {
    //                 storeId
    //             },
    //             include: {
    //                 products: true,
    //             },
    //         });
    //     } else {
    //         if (status !== null) {
    //             orders = await prisma.order.findMany({
    //                 take: limit ? parseInt(limit as string) : 10,
    //                 where: {
    //                     storeId,
    //                     Status: status as OrderStatus
    //                 },
    //                 include: {
    //                     products: true,
    //                 },
    //             });
    //         }

    //         orders = await prisma.order.findMany({
    //             take: limit ? parseInt(limit as string) : 10,
    //             where: {
    //                 storeId
    //             },
    //             include: {
    //                 products: true,
    //             },
    //         });
    //     }

    //     return orders;
    // }

    // async search(searchKeyword: string, limit: string | null, storeId: string) {
    //     let orders;

    //     orders = await prisma.order.findMany({
    //         take: limit ? parseInt(limit as string) : 10,
    //         where: {
    //             storeId,
    //             OR: [
    //                 {
    //                     user: {
    //                         firstName: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 },
    //                 {
    //                     user: {
    //                         lastName: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 },
    //                 {
    //                     id: {
    //                         contains: searchKeyword,
    //                         mode: 'insensitive'
    //                     },
    //                 },
    //             ],
    //         },
    //         include: {
    //             products: true,
    //         },
    //     });

    //     return orders;
    // }
}

export default new OrderService()