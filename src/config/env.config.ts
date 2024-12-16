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
        salesDashboard: process.env.SALES_DASHBOARD_URL || 'https://sales12.web.app',
        adminDashboard: process.env.ADMIN_DASHBOARD_URL,
    },
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET || ''
    },
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'NGN',
    termiiBaseUrl: process.env.TERMII_BASE_URL || 'https://v3.api.termii.com',
    termiiLiveKey: process.env.TERMII_LIVE_KEY || '',

    defaultPassword: process.env.DEFAULT_PASSWORD || 'defaultPassword123',
};

export default config;
