import { body } from 'express-validator';

class OrganisationValidator {
    createNewOrgUser() {
        return [
            body('firstName').notEmpty().withMessage('firstName is required'),
            body('lastName').notEmpty().withMessage('lastName is required'),
            body('email').notEmpty().isEmail().withMessage('Email is required'),
            // body('phoneNumber').isMobilePhone('any').notEmpty(),
            body('organisation').isObject({ strict: true }),
            body('organisation.name')
                .notEmpty()
                .withMessage('Organisation name is required'),
            body('organisation.cacRegNo')
                .notEmpty()
                .withMessage('Organisation cacRegNo is required'),
        ];
    }

    createUserPassword() {
        return [
            body('userId').notEmpty().withMessage('userId is required'),
            body('password')
                .notEmpty()
                // .isStrongPassword()
                .withMessage('Password is not strong'),
            body('code').notEmpty().withMessage('otp code is required'),
        ];
    }

    resendEmail() {
        return [
            body('email').notEmpty().withMessage('Email is requried').isEmail(),
        ];
    }

    updateOrg() {
        return [
            body('organizationName')
                .notEmpty()
                .withMessage('Organisation name is required'),
            body('organizationCacRegNo')
                .notEmpty()
                .withMessage('Organisation cacRegNo is required'),
            body('logo'),
        ];
    }

    withdrawRevenue() {
        return [
            body('amount')
                .notEmpty()
                .withMessage('amount is required')
                .isNumeric(),
            body('bankId')
                .notEmpty()
                .withMessage('bank is required'),
        ];
    }
}

export default new OrganisationValidator();
