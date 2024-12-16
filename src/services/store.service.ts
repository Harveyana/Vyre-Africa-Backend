import { Request, Response } from 'express';
import prisma from '../config/prisma.config';

class StoreService {
    // async fetchOrganizationStores(
    //     organisationId: string,
    //     skip: number,
    //     limit: number,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     searchKeyword: string | null,
    // ) {
    //     let stores;

    //     stores = await prisma.store.findMany({
    //         where: {
    //             organisationId: organisationId,
    //         },
    //         skip: skip,
    //         take: limit,
    //     });

    //     if (dateFrom !== null && dateTo !== null) {
    //         stores = await prisma.store.findMany({
    //             where: {
    //                 organisationId: organisationId,
    //                 createdAt: {
    //                     gte: dateFrom,
    //                     lte: dateTo,
    //                 },
    //             },
    //             skip: skip,
    //             take: limit,
    //         });
    //     }

    //     if (searchKeyword !== null) {
    //         stores = await prisma.store.findMany({
    //             where: {
    //                 organisationId: organisationId,
    //                 OR: [
    //                     {
    //                         location: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                     {
    //                         name: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             },
    //             skip: skip,
    //             take: limit,
    //         });
    //     }

    //     return stores;
    // }
}

export default new StoreService()