import { body } from 'express-validator';

class SwapValidator {

  addFiatAccount() {
    return [
      body('accountNumber').notEmpty().withMessage('accountNumber is required'),
      body('bankName').notEmpty().withMessage('bankName is required'),
      body('currency').notEmpty().withMessage('currency is required'),
      body('Address').isObject().withMessage('Address is required')
    ];
  }

  addCryptoAccount() {
    return [
      body('chain').notEmpty().withMessage('chain is required'),
      body('address').notEmpty().withMessage('address is required')
    ];
  }

}

export default new SwapValidator();
