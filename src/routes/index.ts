import { Request, Response, Router } from 'express';
import { adminRouter } from './admin';
import config from '../config/env.config';
import roleValidator from '../validators/role.validator';
import tripValidator from '../validators/wallet.validator';
import middleware from '../middleware';
import { Actions, RESOURCES } from '../globals';
import { authMiddleware } from '../services/auth';
import userController from '../controllers/user.controller';
import tripController from '../controllers/wallet.controller';
import orderController from '../controllers/order.controller';
import productController from '../controllers/product.controller';
import storeController from '../controllers/store.controller';
import organisationController from '../controllers/organisation.controller';
import organisationValidator from '../validators/organisation.validator';
import userValidator from '../validators/user.validator';
import walletValidator from '../validators/wallet.validator';
import storeValidator from '../validators/store.validator';
import productValidator from '../validators/product.validator';
import orderValidator from '../validators/order.validator';
import mobileProductController from '../controllers/mobile/mobile.product.controller';
import mobileUserController from '../controllers/mobile/mobile.user.controller';
import mobileAdvertController from '../controllers/mobile/mobile.advert.controller';
import walletController from '../controllers/wallet.controller';

const router = Router();

//use the admin routes
router.use(adminRouter)

router.get('/', (req: Request, res: Response) => {
  res.send(`Welcome to the Qaya Backend API! ${config.nodeEnv}`);
});

// roles

//User
router.post(
  '/register',
  // userValidator.register(),
  // middleware.handleValidationError,
  userController.register
);

// router.post(
//   '/rider/register',
//   userValidator.register(),
//   middleware.handleValidationError,
//   userController.registerRider
// );

router.post(
  '/webhook',
  walletController.qorepay_WebHook
);

router.post(
  '/upload_kyc',
  userValidator.uploadKyc(),
  middleware.handleValidationError,
  userController.uploadKyc
);

router.post(
  '/login',
  userValidator.login(),
  middleware.handleValidationError,
  userController.loginUser,
);

router.post(
  '/authenticate-Otp',
  userValidator.authenticateOtp(),
  middleware.handleValidationError,
  userController.authenticateViaOtp,
);

router.post(
  '/verify-email',
  userValidator.verifyEmail(),
  middleware.handleValidationError,
  userController.verifyEmail,
);
router.post(
  '/resent-otp',
  userValidator.resendOtpCode(),
  middleware.handleValidationError,
  userController.resendOtpCode,
);

router.post(
  '/setup-password',
  // userValidator.setPassword(),
  // middleware.handleValidationError,
  userController.setPassword,
);

router.post(
  '/forgot-password',
  userValidator.resendOtpCode(),
  middleware.handleValidationError,
  userController.forgotPassword,
);

router.post(
  '/verify-Otp',
  userValidator.verifyOtp(),
  middleware.handleValidationError,
  userController.verifyOtp,
);

router.post(
  '/update-password',
  userValidator.updatePassword(),
  middleware.handleValidationError,
  userController.updatePasswordRecovery,
);

// router.post('/sendOTP', userController.sendVerification);

// Wallet
router.post(
  '/wallet/create/:currency',
  authMiddleware,
  walletController.createWallet
)

router.post(
  '/wallet/deposit',
  authMiddleware,
  walletValidator.initDeposit(),
  middleware.handleValidationError,
  walletController.init_BankDeposit
)

router.post(
  '/wallet/active_banks',
  authMiddleware,
  walletValidator.initDeposit(),
  middleware.handleValidationError,
  walletController.get_availableBanks
)

router.post(
  '/wallet/vyre_tranfer',
  authMiddleware,
  walletValidator.initVyreTransfer(),
  middleware.handleValidationError,
  walletController.init_VyreTransfer
)

router.post(
  '/wallet/blockchain_tranfer',
  authMiddleware,
  walletValidator.initBlockchainTransfer(),
  middleware.handleValidationError,
  walletController.init_BlockchainTransfer
)

router.post(
  '/wallet/bank_tranfer',
  authMiddleware,
  walletValidator.initBankTransfer(),
  middleware.handleValidationError,
  walletController.init_BankTransfer
)

router.get(
  '/wallet/all',
  authMiddleware,
  walletController.fetchWallets
)

router.get(
  '/wallet/:id',
  authMiddleware,
  walletController.fetchWallet
)

router.get(
  '/rate',
  authMiddleware,
  walletController.getRate
)




//get adverts
router.get(
  '/adverts',
  mobileAdvertController.get,
);

// //update user profile

router.get(
  '/user/get-profile',
  authMiddleware,
  userController.getProfile,
);

router.post(
  '/user/query',
  authMiddleware,
  userController.queryUser
)


router.post(
  '/user/update-profile',
  authMiddleware,
  userValidator.updateProfile(),
  middleware.handleValidationError,
  userController.updateProfile,
);

router.post(
  '/user/change-password',
  authMiddleware,
  userValidator.changePassword(),
  middleware.handleValidationError,
  userController.changePassword,
);

router.post(
  '/user/subscribe',
  authMiddleware,
  userValidator.Subscribe(),
  middleware.handleValidationError,
  userController.subscribe,
);

//get banks
router.get(
  '/banks',
  userController.getAllBanks,
);

router.post(
  '/user/verify-account-detail',
  authMiddleware,
  userValidator.verifyAccountDetail(),
  middleware.handleValidationError,
  userController.verifyAccountDetail,
);

//add user bank
router.post(
  '/user/bank/create',
  authMiddleware,
  userValidator.addBank(),
  middleware.handleValidationError,
  userController.addBank,
);

//get user bank
router.get(
  '/user/bank',
  authMiddleware,
  userController.getUserBank,
);

router.get(
  '/user/wallet/balance',
  authMiddleware,
  userController.getUserWalletBalance,
);

//delete user bank
router.delete(
  '/user/bank/:userBankId',
  authMiddleware,
  userController.deleteUserBank,
);

//user save notification setting
router.post(
  '/user/notification-setting',
  authMiddleware,
  userValidator.setNotificationMethod(),
  middleware.handleValidationError,
  userController.setNotificationMethod,
);

//user get notification setting
router.get(
  '/user/notification-setting',
  authMiddleware,
  userController.getNotificationMethod,
);

//user get auth secret for third party authenticator
router.get(
  '/user/get-Auth-secret',
  authMiddleware,
  userController.getAuthSecret,
);

router.get(
  '/user/get-two-factor-authentication-status',
  authMiddleware,
  userController.getTwoFactorAuthenticationMethod,
);

//save 2FA method
router.post(
  '/user/two-factor-authentication',
  authMiddleware,
  userValidator.setTwoFactorAuthenticationMethod(),
  middleware.handleValidationError,
  userController.setTwoFactorAuthenticationMethod,
);

//save 2FA method
router.post(
  '/user/disable-two-factor-authentication',
  authMiddleware,
  userValidator.disableTwoFactorAuthenticationMethod(),
  middleware.handleValidationError,
  userController.disableTwoFactorAuthenticationMethod,
)

//delete account
router.delete(
  '/user/account/delete',
  authMiddleware,
  userValidator.deleteAccount(),
  middleware.handleValidationError,
  mobileUserController.deleteAccount,
);

//get user notifications
router.get(
  '/user/notification',
  authMiddleware,
  userController.getNotification,
);

//filter user notifications
router.get(
  '/user/notification/filter',
  authMiddleware,
  userController.filterNotification,
);

//get user transactions
router.get(
  '/user/transactions',
  authMiddleware,
  userController.getTransactions,
);

// router.get(
//   '/user/transactions/filter',
//   authMiddleware,
//   userController.filterTransactions,
// );

// router.get(
//   '/user/transactions/filter-by-status',
//   authMiddleware,
//   userController.getTransactionsByStatus,
// );

// router.get(
//   '/user/transactions/filter-by-type',
//   authMiddleware,
//   userController.getTransactionsByType,
// );

//fund user wallet
router.post(
  '/user/wallet/fund',
  authMiddleware,
  userValidator.fundUserWallet(),
  middleware.handleValidationError,
  userController.fundWallet,
);

//verify carsd
router.post(
  '/user/card/verify',
  authMiddleware,
  userValidator.verifyCard(),
  middleware.handleValidationError,
  mobileUserController.verifyCard,
);


//add atm card
router.post(
  '/user/card/add',
  authMiddleware,
  userValidator.addCard(),
  middleware.handleValidationError,
  mobileUserController.addCard,
);

//get cards
router.get(
  '/user/card/fetch',
  authMiddleware,
  mobileUserController.getCards,
);

//set card as preferred
router.post(
  '/user/card/set-as-preferred/:card_id',
  authMiddleware,
  mobileUserController.setCardAsPreferred,
);

//unset card as preferred
router.post(
  '/user/card/unset-as-preferred/:card_id',
  authMiddleware,
  mobileUserController.unSetCardAsPreferred,
);

//delete card
router.post(
  '/user/card/delete/:card_id',
  authMiddleware,
  mobileUserController.deleteCard,
);

// router.get(
//   '/user/two-factor-authentication',
//   authMiddleware,
//   userController.getTwoFactorAuthenticationMethod,
// );

//Orders
// router.post(
//   '/orders/create',
//   authMiddleware,
//   orderValidator.createOrder(),
//   middleware.handleValidationError,
//   orderController.createOrder,
// );

// router.post('/orders/update', authMiddleware, orderController.updateOrder);

// router.get('/orders/fetchOrder', authMiddleware, orderController.fetchOrder);
// router.get('/orders/fetchOrders', authMiddleware, orderController.fetchOrders);

// router.get('/store/orders', authMiddleware, storeController.getOrders);
// router.get('/store/orders/search', authMiddleware, storeController.searchOrders);
// router.get('/store/orders/filter-by-status', authMiddleware, storeController.filterOrdersByStatus);


//Products
// router.post(
//   '/products/create',
//   authMiddleware,
//   middleware.checkAbilities(Actions.Create, RESOURCES.product),
//   middleware.handleValidationError,
//   productValidator.createProduct(),
//   productController.createProduct,
// );

// router.post(
//   '/products/update/:id',
//   authMiddleware,
//   middleware.checkAbilities(Actions.Create, RESOURCES.product),
//   middleware.handleValidationError,
//   productValidator.updateProduct(),
//   productController.updateProduct,
// );

// router.post(
//   '/products/draft',
//   authMiddleware,
//   middleware.checkAbilities(Actions.Create, RESOURCES.product),
//   middleware.handleValidationError,
//   productController.createDraft,
// );

// router.get(
//   '/products/fetchProduct',
//   authMiddleware,
//   productController.fetchProduct,
// );

// router.delete(
//   '/product/delete/:id',
//   authMiddleware,
//   productController.deleteProduct,
// );

// router.get(
//   '/products/fetchDeals',
//   authMiddleware,
//   productController.fetchDeals,
// ); 

// router.get(
//   '/products/store',
//   authMiddleware,
//   productController.fetchProducts,
// );

// router.get(
//   '/drafts/store',
//   authMiddleware,
//   productController.fetchDrafts,
// );


// router.post(
//   '/products/Summary',
//   authMiddleware,
//   productController.calculatePrice,
// );

//category & product endpoints for the mobile app

// search products
// router.get(
//   '/products/search',
//   authMiddleware,
//   mobileProductController.fetchProductsbyKeyword,
// );



//add product to cart

//Organisation
// router.post(
//   '/organisation/user/create',
//   organisationValidator.createNewOrgUser(),
//   middleware.handleValidationError,
//   organisationController.createOrgUser,
// );

// router.post(
//   '/organisation/user/setup-password',
//   organisationValidator.createUserPassword(),
//   middleware.handleValidationError,
//   organisationController.createPassword,
// );

// router.post(
//   '/organisation/user/resend-email',
//   organisationValidator.resendEmail(),
//   middleware.handleValidationError,
//   organisationController.orgResendEmail,
// );

// router.post(
//   '/organisation/profile/update',
//   authMiddleware,
//   organisationValidator.updateOrg(),
//   middleware.handleValidationError,
//   organisationController.updateOrgProfile,
// );

// router.get('/organisation/dashboard', authMiddleware, organisationController.fetchDashboardData);

// router.get('/organisation/administrators', authMiddleware, organisationController.fetchAdministrators);

// router.post(
//   '/organisation/withdraw',
//   authMiddleware,
//   organisationValidator.withdrawRevenue(),
//   middleware.handleValidationError,
//   organisationController.withdrawRevenue,
// );

export { router };
