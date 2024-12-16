import { body } from 'express-validator';

class BroadcastValidator {
  createBroadCast() {
    return [
      body('type')
        .notEmpty()
        .withMessage('type is required')
        .isIn(['INSTANT', 'SCHEDULED']),
      body('title')
        .notEmpty()
        .withMessage('title is required'),
      body('body')
        .notEmpty()
        .withMessage('body content is required'),
      body('recipient')
        .notEmpty()
        .withMessage('recipient is required'),
        body('mode')
        .notEmpty()
        .withMessage('mode is required')
        .isIn(['PUSH', 'EMAIL', 'SMS'])
    ];
  }
}

export default new BroadcastValidator();
