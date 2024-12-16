import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
// import { ProductStatus, Status } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';

class ProductService {
    // async fetchStoreProducts(
    //     storeId: string,
    //     skip: number,
    //     limit: number,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     searchKeyword: string | null,
    //     status :string|null,
    //     type : string,
    // ) {
    //     let products;

    //     products = await prisma.product.findMany({
    //         where: {
    //           storeId: storeId,
    //           status: type as ProductStatus,
    //         },
    //         include:{images: true, categories: true, variants: true},
    //         skip: skip,
    //         take: limit || 20,
    //         orderBy: { createdAt: "desc" }
    //       });

    //     if (dateFrom !== null && dateTo !== null) {
    //         products = await prisma.product.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 status: type as ProductStatus,
    //                 createdAt: {
    //                     gte: startOfDay(dateFrom),
    //                     lte: endOfDay(dateTo),
    //                 },
    //             },
    //             include:{images: true},
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     if (searchKeyword !== null) {
    //         products = await prisma.product.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 status: type as ProductStatus,
    //                 OR: [
    //                     {
    //                         name: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                     {
    //                         reference: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                     {
    //                         SKU: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             },
    //             include:{images: true},
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     if (status !== null) {
    //         products = await prisma.product.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 status: type as ProductStatus,
    //                 Sale_Status: status as Status,
    //             },
    //             include:{images: true},
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     return products;
    // }

    // async fetchProductCategories(
    //     storeId: string,
    //     skip: number,
    //     limit: number,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     searchKeyword: string | null,
    // ) {
    //     let categories;

    //     categories = await prisma.category.findMany({
    //         where: {
    //           storeId: storeId,
    //         },
    //         skip: skip,
    //         take: limit || 20,
    //         orderBy: { createdAt: "desc" }
    //       });

    //     if (dateFrom !== null && dateTo !== null) {
    //         categories = await prisma.category.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 createdAt: {
    //                     gte: startOfDay(dateFrom),
    //                     lte: endOfDay(dateTo),
    //                 },
    //             },
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     if (searchKeyword !== null) {
    //         categories = await prisma.category.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 OR: [
    //                     {
    //                         name: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             },
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     return categories;
    // }

    // async fetchProductSubCategories(
    //     storeId: string,
    //     skip: number,
    //     limit: number,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     searchKeyword: string | null,
    // ) {
    //     let sub_categories;

    //     sub_categories = await prisma.subCategory.findMany({
    //         where: {
    //           storeId: storeId,
    //         },
    //         include:{category: true},
    //         skip: skip,
    //         take: limit || 20,
    //         orderBy: { createdAt: "desc" }
    //       });

    //     if (dateFrom !== null && dateTo !== null) {
    //         sub_categories = await prisma.subCategory.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 createdAt: {
    //                     gte: startOfDay(dateFrom),
    //                     lte: endOfDay(dateTo),
    //                 },
    //             },
    //             include:{category: true},
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     if (searchKeyword !== null) {
    //         sub_categories = await prisma.subCategory.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 OR: [
    //                     {
    //                         name: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             },
    //             include:{category: true},
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     return sub_categories;
    // }

    // async fetchDraftProducts(
    //     storeId: string,
    //     skip: number,
    //     limit: number,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     searchKeyword: string | null,
    // ) {
    //     let products;

    //     products = await prisma.product.findMany({
    //         where: {
    //           storeId: storeId,
    //           status: 'DRAFTED',
    //         },
    //         skip: skip,
    //         take: limit || 20,
    //         orderBy: { createdAt: "desc" }
    //       });

    //     if (dateFrom !== null && dateTo !== null) {
    //         products = await prisma.product.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 status: 'DRAFTED',
    //                 createdAt: {
    //                     gte: startOfDay(dateFrom),
    //                     lte: endOfDay(dateTo),
    //                 },
    //             },
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     if (searchKeyword !== null) {
    //         products = await prisma.product.findMany({
    //             where: {
    //                 storeId: storeId,
    //                 status: 'DRAFTED',
    //                 OR: [
    //                     {
    //                         name: {
    //                             contains: searchKeyword,
    //                             mode: 'insensitive'
    //                         }
    //                     },
    //                 ]
    //             },
    //             skip: skip,
    //             take: limit || 20,
    //             orderBy: { createdAt: "desc" }
    //         });
    //     }

    //     return products;
    // }

    // async filterProducts(
    //     storeId: string,
    //     limit: string,
    //     dateFrom: Date | null,
    //     dateTo: Date | null,
    //     category: string | null,
    //     minPrice: number | null,
    //     maxPrice: number | null,
    // ){
    //     const whereClause: any = {
    //         storeId,
    //         status: 'PUBLISHED',

    //         ...(dateFrom && dateTo && {
    //             createdAt: {
    //               gte: startOfDay(dateFrom),
    //               lte: endOfDay(dateTo),
    //             },
    //         }),

    //         ...(minPrice && maxPrice && {
    //             price: {
    //               gte: minPrice,
    //               lte: maxPrice
    //             },
    //         }),

    //         ...(category && {
    //             categories: {
    //                 some: {
    //                   category: {
    //                     name: category,
    //                   },
    //                 },
    //             },
    //         })
    //     }
        
    //     const products = await prisma.product.findMany({
    //         where: whereClause,
    //         include: {
    //             images: true
    //         },
    //         take: limit ? parseInt(limit) : 10,
    //         orderBy: {createdAt: "desc"}
    //     });

    //     return products;
    // }
}

export default new ProductService()