import { body } from 'express-validator';

class OrderValidator {
  createOrder() {
    return [
      // body('price')
      //   .notEmpty()
      //   .withMessage('Price is required')
      //   .isFloat()
      //   .withMessage('Invalid price'),
        // body('cartId').notEmpty().withMessage('Cart ID is required'),
      // body('products').isArray(),
      // body('products.*.name')
      //   .notEmpty()
      //   .withMessage('Product name is required'),
      // body('products.*.cart_Quantity')
      //   .notEmpty()
      //   .withMessage('Product quantity is required')
      //   .isInt({ min: 1 })
      //   .withMessage('Invalid quantity. Must be a positive integer'),
      // body('products.*.price')
      //   .notEmpty()
      //   .withMessage('Product price is required')
      //   .isFloat()
      //   .withMessage('Invalid product price'),
      // body('products.*.SKU').notEmpty().withMessage('Product SKU is required'),
      // body('method').notEmpty().withMessage('payment method is required'),
      body('storeId').notEmpty().withMessage('store ID is required'),
    ];
  }
}

export default new OrderValidator();
