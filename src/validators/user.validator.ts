import { body } from 'express-validator';

class UserValidator {

    register() {
        return [
            body('firstName').notEmpty().withMessage('first name is required'),
            body('lastName').notEmpty().withMessage('lastName is required'),
            body('email').notEmpty().withMessage('Email address is required').isEmail(),
            body('phoneNumber').notEmpty(),
        ];
    }

    uploadKyc() {
        return [
            body('idType').notEmpty().withMessage('idType is required'),
            body('idNumber').notEmpty().withMessage('idNumber is required'),
            body('idFront').notEmpty().withMessage('idFront is required'),
            body('idBack').notEmpty().withMessage('idBack is required'),
            body('userId').notEmpty().withMessage('userId is required')
        ];
    }
    

    login() {
        return [
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
                // .isStrongPassword(),
        ];
    }

    authenticateOtp(){
        return [
            body('code').notEmpty().withMessage('Otp code is required'),
            body('userId').notEmpty().withMessage('userId is required')
        ];
    }


    Subscribe() {
        return [
            body('token')
                .notEmpty()
                .withMessage('push token  is required')
        ];
    }

    setPassword() {
        return [
            body('userId').notEmpty().withMessage('userId is required'),
            body('password').notEmpty().withMessage('Password is not strong')
        ];
    }

    verifyEmail() {
        return [
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
            body('code').notEmpty().withMessage('Otp code is required'),
        ];
    }

    verifyOtp() {
        return [
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
            body('code').notEmpty().withMessage('Otp code is required'),
        ];
    }

    resendOtpCode() {
        return [
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
        ];
    }
    updatePassword() {
        return [
            body('userId')
            .notEmpty()
            .withMessage('userId is required'),
            body('password')
                .notEmpty()
                // .isStrongPassword()
                .withMessage('Password is required')
        ];
    }
    updateProfile() {
        return [
            body('firstName').notEmpty().withMessage('first name is required'),
            body('lastName').notEmpty().withMessage('last name is required'),
            // body('phoneNumber').notEmpty().withMessage('phone Number is required'),
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
            body('photoUrl').notEmpty().withMessage('photo url is required'),
        ];
    }

    changePassword() {
        return [
            body('currentPassword').notEmpty().withMessage('current password is required'),
            body('newPassword').notEmpty().withMessage('new password is required'),
        ];
    }

    verifyAccountDetail() {
        return [
            body('bankId').notEmpty().withMessage('bank ID is required'),
            body('accountNumber').notEmpty().withMessage('account number is required').isString(),
        ];
    }

    addBank() {
        return [
            body('bankId').notEmpty().withMessage('bank ID is required'),
            body('accountNumber').notEmpty().withMessage('account number is required'),
            body('accountName').notEmpty().withMessage('account name is required'),
        ];
    }

    setNotificationMethod(){
        return [
            body('emailNotification').notEmpty().withMessage('email notification value is required').isBoolean(),
            body('pushNotification').notEmpty().withMessage('push notification value is required').isBoolean(),
            body('smsNotification').notEmpty().withMessage('sms notification value is required').isBoolean(),
        ];
    }

    setTwoFactorAuthenticationMethod(){
        return [
            body('method').notEmpty().withMessage('method is required').isIn(['EMAIL_OTP', 'SMS_OTP', 'THIRD_PARTY_AUTHENTICATOR']).withMessage('invalid 2FA method'),
            body('userSecret').optional(),
            body('token').optional()
        ];
    }

    disableTwoFactorAuthenticationMethod(){
        return [
            body('token').optional()
            // body('token').notEmpty().withMessage('token is required')
        ];
    }

    verifyTwoFactorAuthenticationCode(){
        return [
            body('token').notEmpty().withMessage('token is required'),
        ];
    }

    deleteAccount(){
        return [
            body('password').notEmpty().withMessage('password is required'),
            body('reason').notEmpty().withMessage('reason is required'),
        ];
    }

    fundUserWallet(){
        return [
            body('amount').notEmpty().withMessage('amount is required').isNumeric(),
            body('transactionId').notEmpty().withMessage('transaction id is required')
        ];
    }

    addCard(){
        return [
            body('cardHolderName').notEmpty().withMessage('card holder name is required').isString(),
            body('cardNumber').notEmpty().withMessage('card number is required'),
            body('brand').notEmpty().withMessage('brand is required').isString(),
            body('cardType').notEmpty().withMessage('card type is required').isString(),
            body('expiryDate').notEmpty().withMessage('expiry date is required').isDate().withMessage('expiry date must be a date field'),
            body('cvv').notEmpty().withMessage('cvv is required').isNumeric(),
            body('transactionId').notEmpty().withMessage('transaction id is required')
        ];
    }

    verifyCard(){
        return [
            body('cardNumber').notEmpty().withMessage('card number is required').isLength({max: 6}),
        ]
    }

    changeAdminPassword() {
        return [
            body('newPassword').notEmpty().withMessage('new password is required'),
        ];
    }

    updateAdminProfile() {
        return [
            body('firstName').notEmpty().withMessage('first name is required'),
            body('lastName').notEmpty().withMessage('last name is required'),
            body('email')
                .notEmpty()
                .withMessage('Email address is required')
                .isEmail(),
            body('photoUrl').notEmpty().withMessage('photo url is required'),
        ];
    }

}

export default new UserValidator();
