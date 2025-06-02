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
      body('address').notEmpty().withMessage('address is required'),
      body('currency').notEmpty().withMessage('currency is required')
    ];
  }

  generateQuote() {
    return [
      body('source').isObject(),
            body('admin.sourcePaymentAccountId')
                .optional(),
            body('source.sourceCurrency')
                .notEmpty().withMessage('sourceCurrency is required'),
            body('source.sourcePaymentMethod')
                .notEmpty().withMessage('sourcePaymentMethod is required'),
            body('source.sourceAmount')
                .notEmpty().withMessage('sourceAmount is required'),

      body('destination').isObject(),
            body('destination.destinationPaymentAccountId')
                .notEmpty().withMessage('destinationPaymentAccountId is required'),
            body('destination.destinationCurrency')
                .notEmpty().withMessage('destinationCurrency is required'),
            body('destination.destinationPaymentMethod')
                .notEmpty().withMessage('destinationPaymentMethod is required')
            
    ];

    
  }

  initiateSwap() {
    return [
      body('quoteId').notEmpty().withMessage('quoteId is required')
    ];
  }

}

export default new SwapValidator();
