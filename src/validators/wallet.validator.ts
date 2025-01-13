import { body } from 'express-validator';

class walletValidator {
  initDeposit() {
    return [
      body('currency').notEmpty().withMessage('currency is required'),
      body('amount').notEmpty().withMessage('amount is required')
    ];
  }

  initBlockchainTransfer() {
    return [
      body('currency').notEmpty().withMessage('currency is required'),
      body('amount').notEmpty().withMessage('amount is required'),
      body('address').notEmpty().withMessage('blockchain is required'),
      // body('destinationTag').optional().withMessage('destinationTag is required for XRP')
    ];
  }

  initVyreTransfer() {
    return [
      body('currency').notEmpty().withMessage('currency is required'),
      body('amount').notEmpty().withMessage('amount is required'),
      body('receipient_id').notEmpty().withMessage('receipient_id is required'),
    ];
  }

  initBankTransfer() {
    return [
      body('account_number').notEmpty().withMessage('account_number is required'),
      body('bank_code').notEmpty().withMessage('bank_code is required'),
      body('recipient_name').notEmpty().withMessage('recipient_name is required'),
      body('endpoint_url').notEmpty().withMessage('endpoint_url is required'),
    ];
  }
}

export default new walletValidator();
