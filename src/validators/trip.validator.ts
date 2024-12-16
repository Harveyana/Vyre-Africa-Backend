import { body } from 'express-validator';

class TripValidator {
  getPrice() {
    return [
      body('originLat').notEmpty().withMessage('origin latitude is required').isFloat().withMessage('Invalid origin latitude'),

      body('originLng').notEmpty().withMessage('origin longitude is required').isFloat().withMessage('Invalid origin longitude'),

      body('destLat').notEmpty().withMessage('destination latitude is required').isFloat().withMessage('Invalid destination latitude'),

      body('destLng').notEmpty().withMessage('destination longitude is required').isFloat().withMessage('Invalid destination longitude')

    ];
  }
}

export default new TripValidator();
