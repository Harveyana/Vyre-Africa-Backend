import { body } from 'express-validator';

class AdvertValidator {
  createAdvert() {
    return [
      body('title')
        .notEmpty()
        .withMessage('title is required'),
      body('imgUrl')
        .notEmpty()
        .withMessage('imgUrl is required')
    ];
  }

  updateAdvert() {
    return [
      body('title')
        .notEmpty()
        .withMessage('title is required'),
      body('imgUrl')
        .notEmpty()
        .withMessage('imgUrl is required'),
      body('type').notEmpty().withMessage('type is required').isIn(['published', 'draft']).withMessage('type must either be published or draft')
    ];
  }

  deleteAdvert() {
    return [
      body('type').notEmpty().withMessage('type is required').isIn(['published', 'draft']).withMessage('type must either be published or draft')
    ];
  }
}

export default new AdvertValidator();
