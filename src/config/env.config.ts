import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.HOST || '',
    port: process.env.PORT || '5000',
    nodeEnv: process.env.NODE_ENV || '',

    dialect: process.env.DB_DIALECT || 'postgres',
    dbCreds: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        db: process.env.DB,
    },
    defaultPhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/qaya-a252a.appspot.com/o/images%2FAvatar%20%5B1.0%5D%20(1).png?alt=media&token=0260df3d-de90-4559-8be4-feeffabd17e9',
    defaultOrganisationUrl: 'https://firebasestorage.googleapis.com/v0/b/qaya-a252a.appspot.com/o/Empty%20(1).png?alt=media&token=8ad9b6d2-6f11-4def-8921-2c13245f686b',

    jwt: {
        secret: process.env.JWT_SECRET || '',
        expiry: process.env.JWT_EXPIRY || '',
    },

    refreshJwt: {
        secret: process.env.JWT_REFRESH_SECRET || '',
        expiry: process.env.JWT_REFRESH_EXPIRY || '',
    },
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE,
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASSWORD || '',
            from: process.env.SMTP_FROM || '',
        },
    },
    accessCookieAge: 1000 * 60 * 15, //expire in 15 mins
    refreshCookieAge: 1000 * 60 * 60 * 24, //expire in 24 hours
    device: {
        web: 'web',
        mobile: 'mobile',
    },
    urls: {
        userDashboard: process.env.Dashboard_URL || 'http://localhost:3000',
        // adminDashboard: process.env.ADMIN_DASHBOARD_URL,

        naira_Img: process.env.naira_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/naira.png?alt=media&token=ba63da45-5f49-4f1a-83cb-9a9edb76c845',
        dollar_Img: process.env.dollar_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/dollar.png?alt=media&token=37a66d45-cd5f-489b-ae06-26c2fa1fc42b',
        bitcoin_Img: process.env.bitcoin_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/bitcoin.svg?alt=media&token=5b0a8d19-4b76-4ca9-abde-2a299b1a6998',
        ethereum_Img: process.env.ethereum_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/ethereum2.png?alt=media&token=c083d145-d7b9-4bfd-a100-2c7d5266cdcd',
        tron_Img: process.env.tron_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/tron.png?alt=media&token=e8df6d78-b716-4a35-94ee-def32c78ab25',
        litecoin_Img: process.env.litecoin_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/litecoin.svg?alt=media&token=c7312a44-2640-400f-b268-f379badf7955',
        ripple_Img: process.env.ripple_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/ripple.png?alt=media&token=8ccd5926-0ff1-4284-8466-0eeef9bff3cd',
        usdt_eth_Img: process.env.usdt_eth_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/tether%20(1).png?alt=media&token=c4661dcf-2cf4-4a30-ab80-48f8259bd06c',
        usdt_tron_Img: process.env.usdt_tron_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/tether%20(1).png?alt=media&token=c4661dcf-2cf4-4a30-ab80-48f8259bd06c',

        usdc_Img: process.env.usdc_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/usdc.png?alt=media&token=081f1646-7728-4adc-9aab-73ca1a55928f',
        bnb_Img: process.env.bnb_Img || 'https://firebasestorage.googleapis.com/v0/b/vyre-a6527.appspot.com/o/binance.png?alt=media&token=08d89c33-d0df-41ae-956b-d95b7bb61c2c',
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET || ''
    },
    Admin_Id: process.env.Admin_Id || '',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'NGN',
    termiiBaseUrl: process.env.TERMII_BASE_URL || 'https://v3.api.termii.com',
    termiiLiveKey: process.env.TERMII_LIVE_KEY || '',

    defaultPassword: process.env.DEFAULT_PASSWORD || 'defaultPassword123',

    QOREPAY_BEARER_TOKEN: process.env.BEARER_TOKEN,
    QOREPAY_BRAND_ID: process.env.BRAND_ID,
    QOREPAY_PUBLIC_KEY: process.env.PUBLIC_KEY,

    TATUM_TEST_KEY: process.env.TATUM_TEST_KEY,
    TATUM_LIVE_KEY: process.env.TATUM_LIVE_KEY,
    HMACSECRET: process.env.HMACSECRET,

    BTC_XPUB: process.env.BTC_XPUB,
    BTC_MNEMONIC: process.env.BTC_MNEMONIC,

    ETH_XPUB: process.env.ETH_XPUB,
    ETH_MNEMONIC: process.env.ETH_MNEMONIC,

    USDT_ETH_XPUB: process.env.USDT_ETH_XPUB,
    USDT_ETH_MNEMONIC: process.env.USDT_ETH_MNEMONIC,

    LTC_XPUB: process.env.LTC_XPUB,
    LTC_MNEMONIC: process.env.LTC_MNEMONIC,

    TRON_XPUB: process.env.TRON_XPUB,
    TRON_MNEMONIC: process.env.TRON_MNEMONIC,

    USDT_TRON_XPUB: process.env.USDT_TRON_XPUB,
    USDT_TRON_MNEMONIC: process.env.USDT_TRON_MNEMONIC,

    USDC_XPUB: process.env.USDC_XPUB,
    USDC_MNEMONIC: process.env.USDC_MNEMONIC,

    BNB_ADDRESS: process.env.BNB_ADDRESS,
    BNB_KEY: process.env.BNB_KEY,

    XRP_ADDRESS: process.env.XRP_ADDRESS,
    XRP_SECRET: process.env.XRP_SECRET,

    SOL_ADDRESS: process.env.SOL_ADDRESS

    
};

export default config;
