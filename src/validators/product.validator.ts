import { body, query } from 'express-validator';

class ProductValidator {
  createProduct() {
    return (
      body('name').notEmpty().withMessage('Product name is required'),
      body('price').notEmpty().withMessage('Product price is required'),
      body('description')
        .notEmpty()
        .withMessage('Product description is required'),
      body('quantity').notEmpty().withMessage('Product quantity is required'),
      body('expiry_date').notEmpty().withMessage('expiry_date is required'),
      body('status').notEmpty().withMessage('status is required').isIn(['PUBLISHED', 'DRAFTED'])
      // body('barCode').notEmpty().withMessage('bar code is required')
    );
  }

  updateProduct() {
    return (
      body('name').notEmpty().withMessage('Product name is required'),
      body('price').notEmpty().withMessage('Product price is required'),
      body('description')
        .notEmpty()
        .withMessage('Product description is required'),
      body('quantity').notEmpty().withMessage('Product quantity is required'),
      body('expiry_date').notEmpty().withMessage('expiry_date is required'),
      body('status').notEmpty().withMessage('status is required').isIn(['PUBLISHED', 'DRAFTED'])
      // body('barCode').notEmpty().withMessage('bar code is required')
    );
  }

  createCategory() {
    return (
      body('name').notEmpty().withMessage('category name is required')
    );
  }

  createSubCategory() {
    return (
      body('name').notEmpty().withMessage('subCategory name is required'),
      body('parentId').notEmpty().withMessage('category Id name is required')
    );
  }

  submitReview(){
    return (
      body('rating').notEmpty().withMessage('rating is required').isNumeric(),
      body('feedback').notEmpty().withMessage('feedback is required')
    );
  }

  addToCart(){
    return (
      body('product').notEmpty().withMessage('product is required')
      // body('total').notEmpty().withMessage('total is required').isNumeric()
    );
  }

  removeFromCart(){
    return (
      body('product').notEmpty().withMessage('product is required')
    );
  }
  
}

export default new ProductValidator();
