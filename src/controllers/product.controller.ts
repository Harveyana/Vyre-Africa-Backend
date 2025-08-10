import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import { generateRefCode, generateSku } from '../utils';
// import productService from '../services/product.service';
// import { ProductStatus } from '@prisma/client';

class ProductController {
  // async createProduct(req: Request | any, res: Response) {
  //   const {
  //     name,
  //     price,
  //     description,
  //     Sales_price,
  //     quantity,
  //     alertQuantity,
  //     expiry_date,
  //     categories,
  //     variants,
  //     images,
  //     saleStartDate,
  //     saleEndDate,
  //     Sale_Status,
  //     status,
  //     barCode
  //   } = req.body;

  //   let reference:string;

  //   try {

  //     if(alertQuantity > quantity){
  //       return res.status(400).json({ msg: 'Quantity must be more than alert quantity', success: false });
  //     }

  //     reference = generateRefCode();

  //     if(barCode){
  //       reference = barCode
  //     }

  //     const creator = req.user;

  //     const storeAdmin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id as string }
  //     })

  //     if (!storeAdmin) {
  //       return res.status(400).json({ msg: 'Store not Assigned', success: false });
  //     }

  //     const categoryIDs: string[] = []

  //     const result = await prisma.$transaction(async (prisma) => {

  //       const SKU = generateSku();

  //       const categoryPromise = categories.map(async (category: string) => {
  //         const subCategory = await prisma.subCategory.findFirst({
  //           where: { name: category, storeId: storeAdmin.storeId }
  //         })
  //         if (subCategory) { categoryIDs.push(subCategory.id) }
  //       })

  //       await Promise.all(categoryPromise);

  //       const product = await prisma.product.create({
  //         data: {
  //           name,
  //           price: parseInt(price),
  //           Description: description,
  //           saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
  //           saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
  //           Sales_price: parseInt(Sales_price) > 0 ? parseInt(Sales_price) : 0,
  //           Sale_Status,
  //           status,
  //           reference,
  //           // categories: categoryIDs,
  //           categories: {
  //             connect: categoryIDs.map((subcategoryId: string) => ({
  //               id: subcategoryId,
  //             })),
  //           },
  //           SKU,
  //           images: {
  //             create: images.map((image: string) => ({
  //               url: image,
  //               storeId: storeAdmin?.storeId,
  //             })),
  //           },
  //           alertQuantity: parseInt(alertQuantity),
  //           Quantity: parseInt(quantity),
  //           Expiry_date: new Date(expiry_date),
  //           storeId: storeAdmin?.storeId,
  //         },
  //       });

  //       if (variants && variants.length) {

  //         const variantPromises = variants.map(async (variant: any) => {
  //           // First create the variant
  //           const newVariant = await prisma.variant.create({
  //             data: {
  //               name: variant.name,
  //               productId: product.id
  //             }
  //           });

  //           // Then create the options for the newly created variant
  //           const optionPromises = variant.options.map((option: { value: string, price: string }) => {
  //             return prisma.variantOption.create({
  //               data: {
  //                 variantId: newVariant.id,
  //                 value: option.value,
  //                 price: parseInt(option.price)
  //               }
  //             });
  //           });

  //           await Promise.all(optionPromises);
  //         });

  //         await Promise.all(variantPromises);


  //       }

  //       return product

  //     })

  //     return res
  //       .status(200)
  //       .json({ msg: 'Product created successfully', success: true, result });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ msg: 'operation failed', success: false, error });
  //   }
  // }

  // async updateProduct(req: Request | any, res: Response) {
  //   const {
  //     name,
  //     price,
  //     Description,
  //     Sales_price,
  //     Quantity,
  //     alertQuantity,
  //     Expiry_date,
  //     categories,
  //     variants,
  //     images,
  //     saleStartDate,
  //     saleEndDate,
  //     Sale_Status,
  //     status,
  //     barCode,
  //   } = req.body;
  
  //   const productId = req.params.id;

  
  
  //   try {
  //     console.log('payload',req.body)

  //     const product = await prisma.product.findUnique({
  //       where: { id: productId },
  //       // include: {
  //       //   variants: {
  //       //     include: {
  //       //       options: true,
  //       //     },
  //       //   },
  //       // },
  //     });
  
  //     if (!product) {
  //       return res.status(404).json({ msg: 'Product not found', success: false });
  //     }
  
  //     const creator = req.user;
  
  //     const storeAdmin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id as string },
  //     });
  
  //     if (!storeAdmin) {
  //       return res.status(400).json({ msg: 'Store not Assigned', success: false });
  //     }
  
  //     const categoryIDs: string[] = [];
  
  //     // Begin transaction
  //     const updatedProduct = await prisma.$transaction(async (prisma) => {
  //       // Map categories
  //       const categoryPromise = categories.map(async (category: string) => {
  //         const subCategory = await prisma.subCategory.findFirst({
  //           where: { name: category, storeId: storeAdmin.storeId },
  //         });
  //         if (subCategory) {
  //           categoryIDs.push(subCategory.id);
  //         }
  //       });
  
  //       await Promise.all(categoryPromise);
  
  //       // Update the product details
  //       const updatedProduct = await prisma.product.update({
  //         where: { id: productId },
  //         data: {
  //           name,
  //           price: parseInt(price),
  //           Description,
  //           saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
  //           saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
  //           Sales_price: parseInt(Sales_price) > 0 ? parseInt(Sales_price) : 0,
  //           Sale_Status,
  //           status,
  //           categories: {
  //             set: categoryIDs.map((subcategoryId: string) => ({
  //               id: subcategoryId,
  //             })),
  //           },
  //           alertQuantity: parseInt(alertQuantity),
  //           Quantity: parseInt(Quantity),
  //           Expiry_date: Expiry_date ? Expiry_date : product.Expiry_date
  //         },
  //       });
  //       return updatedProduct;
        
  //     });

  //     if(updatedProduct){
        
  //       //handle images
  //       await prisma.image.deleteMany({
  //         where: {productId}
  //       })

  //       await Promise.all(
  //         images.map((image: string) =>
  //           prisma.image.create({
  //             data: {
  //               productId,
  //               url: image,
  //               storeId: storeAdmin.storeId,
  //             },
  //           })
  //         )
  //       );

  //       //handle variants
  //       if (variants && variants.length) {
  //         const variantPromises = variants.map(async (variant: any) => {
  //           if (variant.id) {
  //             await prisma.variant.update({
  //               where: { id: variant.id },
  //               data: {
  //                 name: variant.name,
  //                 options: {
  //                   deleteMany: {}, // Delete old options before setting new ones
  //                   create: variant.options.map((option: { value: string, price: string }) => ({
  //                     value: option.value,
  //                     price: parseInt(option.price),
  //                   })),
  //                 },
  //               },
  //             });
  //           } else {
  //             await prisma.variant.create({
  //               data: {
  //                 name: variant.name,
  //                 productId,
  //                 options: {
  //                   create: variant.options.map((option: { value: string, price: string }) => ({
  //                     value: option.value,
  //                     price: parseInt(option.price),
  //                   })),
  //                 },
  //               },
  //             });
  //           }
  //         });
  
  //         await Promise.all(variantPromises);
  //       }
  //     }

  //     const productDetails = await prisma.product.findUnique({
  //       where: { id: productId },
  //       include: {
  //         variants: {
  //           include: {
  //             options: true,
  //           },
  //         },
  //         images: true,
  //         categories: true,
  //       },
  //     });
  
  //     // Return the updated product
  //     res.status(200).json({ msg: 'Product updated successfully', success: true, data: productDetails });
  
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ msg: 'Error updating product', success: false, error });
  //   }
  // }
  
  // async createCategory(req: Request | any, res: Response) {
  //   const {
  //     name
  //   } = req.body;

  //   try {

  //     const creator = req.user;

  //     const storeAdmin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id as string }
  //     })

  //     if (!storeAdmin) {
  //       return res.status(400).json({ msg: 'Store admin not found', success: false });
  //     }

  //     const result = await prisma.$transaction(async (prisma) => {

  //       const category = await prisma.category.create({
  //         data: {
  //           name,
  //           store: { connect: { id: storeAdmin.storeId } }
  //         },
  //       });

  //       return category

  //     })

  //     return res
  //       .status(200)
  //       .json({ msg: `${result.name} created successfully`, success: true, result });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ msg: 'operation failed', success: false, error });
  //   }
  // }

  // async createSubCategory(req: Request | any, res: Response) {
  //   const {
  //     name,
  //     parentId
  //   } = req.body;

  //   try {

  //     const creator = req.user;

  //     const storeAdmin = await prisma.storeAdmin.findFirst({
  //       where: { userId: creator.id as string }
  //     })

  //     if (!storeAdmin) {
  //       return res.status(400).json({ msg: 'Store admin not found', success: false });
  //     }

  //     const category = await prisma.category.findUnique({
  //       where: { id: parentId }
  //     })

  //     console.log('category', category)

  //     if (!category) {
  //       return res.status(400).json({ msg: 'category not found', success: false });
  //     }

  //     const result = await prisma.$transaction(async (prisma) => {

  //       const subcategory = await prisma.subCategory.create({
  //         data: {
  //           name,
  //           category: {
  //             connect: {
  //               id: category?.id
  //             },
  //           },
  //           store: {
  //             connect: {
  //               id: storeAdmin.storeId
  //             },
  //           }
  //         },
  //       });

  //       return subcategory

  //     })

  //     return res
  //       .status(200)
  //       .json({ msg: `${result.name} created successfully`, success: true, result });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ msg: 'operation failed', success: false, error });
  //   }
  // }

  // async fetchCategoriesWithSub(req: Request | any, res: Response) {
  //   try {
  //       const categories = await prisma.category.findMany();
  //       return res
  //           .status(200)
  //           .json({ categories, success: true });
  //   } catch (error) {
  //       return res
  //           .status(500)
  //           .json({ msg: 'Cannot find categories', success: true });
  //   }
  // }


  // async fetchCategoriesWithSub(req: Request | any, res: Response) {

  //   const creator = req.user;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {

  //     const categories = await prisma.category.findMany({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //       },
  //       include: {
  //         subCategories: true
  //       },
  //       orderBy: { createdAt: "desc" }
  //     });


  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         categories: categories
  //       });
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Could not fetch Categories', success: true });
  //   }
  // }

  // async fetchCategories(req: Request | any, res: Response) {

  //   const { limit, page, date_from, date_to } = req.query;

  //   const creator = req.user;
  //   const search = req.query.search as string ?? null;

  //   // let dateFrom: Date | null = null;
  //   // let dateTo: Date | null = null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {

  //     const totalCount = await prisma.category.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //       },
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     // if (date_from && date_to) {
  //     //   dateFrom = new Date(date_from as string);
  //     //   dateTo = new Date(date_to as string);
  //     // }
  //     const categories = await prisma.category.findMany({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //       },
  //       skip: skip,
  //       take: itemLimit || 20,
  //       orderBy: { createdAt: "desc" }
  //     });

  //     console.log(totalCount, "totalCount")
  //     console.log(itemLimit, 'itemLimit')
  //     console.log(totalPages, 'totalPages')
  //     console.log(currentPage, 'currentPage')
  //     console.log(skip, 'skip')



  //     // const categories = await productService.fetchProductCategories(storeAdmin.storeId, skip, limit, dateFrom, dateTo, search)


  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         categories: categories
  //       });
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Could not fetch Categories', success: true });
  //   }
  // }

  // async fetchChildCategories(req: Request | any, res: Response) {

  //   const categoryId = req.params.id;

  //   const creator = req.user;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {

  //     const subCategories = await prisma.subCategory.findMany({
  //       where: {
  //         parentId: categoryId
  //       },
  //       orderBy: { createdAt: "desc" }
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         // totalCount: subCategories.count,
  //         subCategories: subCategories
  //       });

  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Could not fetch sub Categories', success: true });
  //   }
  // }

  // async fetchSubCategories(req: Request | any, res: Response) {

  //   const { limit, page, date_from, date_to } = req.query;

  //   const creator = req.user;
  //   const search = req.query.search as string ?? null;

  //   let dateFrom: Date | null = null;
  //   let dateTo: Date | null = null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {

  //     const totalCount = await prisma.subCategory.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //       },
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     if (date_from && date_to) {
  //       dateFrom = new Date(date_from as string);
  //       dateTo = new Date(date_to as string);
  //     }

  //     console.log(totalCount, "totalCount")
  //     console.log(itemLimit, 'itemLimit')
  //     console.log(totalPages, 'totalPages')
  //     console.log(currentPage, 'currentPage')
  //     console.log(skip, 'skip')

  //     const subcategories = await productService.fetchProductSubCategories(storeAdmin.storeId, skip, parseInt(limit), dateFrom, dateTo, search);


  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         subcategories: subcategories
  //       });
  //   } catch (error) {
  //     console.log(error)
  //     return res
  //       .status(500)
  //       .json({ msg: 'Could not fetch subCategories', success: false });
  //   }
  // }

  // async deleteCategory(req: Request | any, res: Response) {
  //   const categoryId = req.params.id;
  //   const creator = req.user;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {

  //     const deletedSubCategories = await prisma.subCategory.deleteMany({
  //       where: {
  //         parentId: categoryId
  //       }
  //     })

  //     const deletedCategory = await prisma.category.delete({
  //       where: { id: categoryId }
  //     })

  //     return res
  //       .status(200)
  //       .json({
  //         msg: `Deleted ${deletedSubCategories.count} subcategories under ${deletedCategory.name}`,
  //         success: true,
  //         category: deletedCategory
  //       });

  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async deleteSubCategory(req: Request | any, res: Response) {
  //   const subcategoryId = req.params.id;
  //   const creator = req.user;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {
  //     console.log('started deletion')
  //     const deletedSubCategory = await prisma.subCategory.delete({
  //       where: { id: subcategoryId }
  //     })

  //     return res
  //       .status(200)
  //       .json({
  //         msg: `Deleted ${deletedSubCategory.name}`,
  //         success: true,
  //         category: deletedSubCategory
  //       });

  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }


  // async fetchProducts(req: Request | any, res: Response) {
  //   const { limit, page, date_from, date_to } = req.query;

  //   const creator = req.user;
  //   const search = req.query.search as string ?? null;
  //   const status = req.query.status as string ?? null;
  //   const type = req.query.type

  //   let dateFrom: Date | null = null;
  //   let dateTo: Date | null = null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }


  //   try {
  //     const totalCount = await prisma.product.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         status: type as ProductStatus,
  //       },
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     if (date_from && date_to) {
  //       dateFrom = new Date(date_from as string);
  //       dateTo = new Date(date_to as string);
  //     }

  //     console.log(totalCount, "totalCount")
  //     console.log(itemLimit, 'itemLimit')
  //     console.log(totalPages, 'totalPages')
  //     console.log(currentPage, 'currentPage')
  //     console.log(skip, 'skip')


  //     const products = await productService.fetchStoreProducts(storeAdmin.storeId, skip, itemLimit, dateFrom, dateTo, search, status, type)

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         products: products,
  //       });

  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async fetchProductsbyKeyword(req: Request | any, res: Response) {
  //   const { limit, page, search } = req.query;

  //   const creator = req.user;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }
  //   if (!search) {
  //     return res.status(400).json({ msg: 'keyword required', success: false });
  //   }


  //   try {
  //     const totalCount = await prisma.product.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         name: {
  //           contains: search,
  //         }
  //       },
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     const products = await prisma.product.findMany({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         name: {
  //           contains: search,
  //         }
  //       },
  //       include: {
  //         images: true
  //       },
  //       skip: skip,
  //       take: itemLimit || 20,
  //       orderBy: { createdAt: "desc" }
  //     });

  //     console.log(totalCount, "totalCount")
  //     console.log(itemLimit, 'itemLimit')
  //     console.log(totalPages, 'totalPages')
  //     console.log(currentPage, 'currentPage')
  //     console.log(skip, 'skip')


  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         products: products,
  //       });

  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async fetchDrafts(req: Request | any, res: Response) {
  //   const { limit, page, date_from, date_to } = req.query;

  //   const creator = req.user;
  //   const search = req.query.search as string ?? null;

  //   let dateFrom: Date | null = null;
  //   let dateTo: Date | null = null;

  //   const storeAdmin = await prisma.storeAdmin.findFirst({
  //     where: { userId: creator.id as string }
  //   })

  //   if (!storeAdmin) {
  //     return res.status(400).json({ msg: 'Store admin not found', success: false });
  //   }

  //   try {
  //     const totalCount = await prisma.product.count({
  //       where: {
  //         storeId: storeAdmin.storeId,
  //         status: 'DRAFTED',
  //       },
  //     });

  //     const itemLimit = (limit ? parseInt(limit as string) : 20) || 20;
  //     console.log(limit)
  //     const totalPages = Math.ceil(totalCount / itemLimit);

  //     const currentPage = page ? Math.max(parseInt(page as string), 1) : 1;
  //     const skip = (currentPage - 1) * itemLimit;

  //     if (date_from && date_to) {
  //       dateFrom = new Date(date_from as string);
  //       dateTo = new Date(date_to as string);
  //     }

  //     console.log(totalCount, "totalCount")
  //     console.log(itemLimit, 'itemLimit')
  //     console.log(totalPages, 'totalPages')
  //     console.log(currentPage, 'currentPage')
  //     console.log(skip, 'skip')

  //     const products = await productService.fetchDraftProducts(storeAdmin.storeId, skip, itemLimit, dateFrom, dateTo, search);

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         totalCount: totalCount,
  //         totalPages: totalPages,
  //         limit: itemLimit,
  //         currentPage: currentPage,
  //         products: products,
  //       });

  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).send({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async fetchDeals(req: Request, res: Response) {
  //   const { storeId, limit } = req.query;

  //   if (!storeId) {
  //     return res.status(400).json({ msg: 'store required', success: false });
  //   }

  //   try {
  //     const products = await prisma.product.findMany({
  //       where: {
  //         storeId: storeId as string,
  //         status: 'PUBLISHED',
  //       },
  //       include: {
  //         images: true,
  //         // categories: true,
  //         // variants: true
  //       },
  //       take: limit ? parseInt(limit as string) : 10,
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         products: products,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send(error);
  //   }
  // }

  // async fetchProduct(req: Request, res: Response) {
  //   const { productId } = req.query;

  //   if (!productId) {
  //     return res.status(400).send('Product id required');
  //   }

  //   try {
  //     const product = await prisma.product.findUnique({
  //       where: { id: productId as string },
  //       include: {
  //         images: true,
  //         categories: true,
  //         variants: {
  //           include: {
  //             options: true
  //           }
  //         },
  //         // reviews: {
  //         //   include: {
  //         //     user: true
  //         //   }
  //         // },
  //       },
  //     });

  //     const reviews = await prisma.productReview.aggregate({
  //       where: {productId: productId as string},
  //       _count: true,
  //       _avg: {rating: true}
  //     })

  //     if (!product) return res.status(400).json({ msg: 'product not found', success: false });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Successful',
  //         success: true,
  //         product: {totalReviews: reviews._count,averageRating: reviews._avg.rating, ...product},
  //         // totalReviews: reviews._count,
  //         // averageRating: reviews._avg.rating
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send(error);
  //   }
  // }

  // async calculatePrice(req: Request, res: Response) {
  //   const { cart } = req.body;

  //   if (!Array.isArray(cart)) {
  //     return res.status(400).json({ error: 'Cart should be an array' });
  //   }

  //   try {
  //     const total = cart.reduce((acc, product) => {
  //       return acc + product.price * product.cart_Quantity;
  //     }, 0);

  //     res.status(200).json({ status: 'successful', total: total });
  //   } catch (error) {
  //     console.log(error);
  //     return res
  //       .status(500)
  //       .json({ msg: 'Internal Server Error', success: false, error });
  //   }
  // }

  // async deleteProduct(req: Request, res: Response) {
  //   const productId = req.params.id
    
  //   if (!productId) {
  //     return res.status(400).send('Product id required');
  //   }

  //   try {

  //     //delete product 
  //     await prisma.product.delete({
  //       where: { id: productId as string },
  //     });

  //     return res
  //       .status(200)
  //       .json({
  //         msg: 'Product deleted successfully',
  //         success: true,
  //       });

  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send(error);
  //   }
  // }
}

export default new ProductController();
