import { body } from 'express-validator';

class StoreValidator {
    createStore() {
        return [
            body('name').notEmpty().withMessage('Store name is required'),
            body('latitude')
                .notEmpty()
                .withMessage('Store latitude is required'),
            body('longitude')
                .notEmpty()
                .withMessage('Store longitude is required'),
            body('location')
                .notEmpty()
                .withMessage('Store location is required'),
            body('admin').isObject(),
            body('admin.firstName')
                .notEmpty()
                .withMessage('store admin first name is required'),
            body('admin.lastName')
                .notEmpty()
                .withMessage('store admin last name is required'),
            body('admin.email')
                .notEmpty()
                .withMessage('store admin email address is required'),
            body('admin.phoneNo')
                .notEmpty()
                .withMessage('store admin phone number is required'),
        ];
    }
    updateStore() {
        return [
            body('name').notEmpty().withMessage('Store name is required'),
            body('latitude')
                .notEmpty()
                .withMessage('Store latitude is required'),
            body('longitude')
                .notEmpty()
                .withMessage('Store longitude is required'),
            body('location')
                .notEmpty()
                .withMessage('Store location is required'),
        ];
    }

    createAdmin() {
        return [
          body('firstName').notEmpty().withMessage('firstName is required'),
          body('lastName').notEmpty().withMessage('lastName is required'),
          body('email').notEmpty().withMessage('email is required'),
          body('password').notEmpty().withMessage('password is required'),
          body('roleId').notEmpty().withMessage('roleId is required')
        ];
    }
}

export default new StoreValidator();
