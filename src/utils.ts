import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from './config/env.config';
import { User } from './globals';
import Decimal from 'decimal.js';
import crypto from 'crypto';

const algorithm: string = 'aes-256-cbc';
const key: Buffer = crypto.randomBytes(32);
const iv: Buffer = crypto.randomBytes(16);


export const hasSufficientBalance = (
    availableBalance: any, // Store balance as string
    amount: string
  ): boolean => {
    const balanceDecimal = new Decimal(availableBalance);
    const amountDecimal = new Decimal(amount);
  
    return amountDecimal.lte(balanceDecimal); // Use lte (less than or equal)
}


export const generateSku = () => {
    const randomPart = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0'); // Generate a random 6-digit number
    const timestampPart = Date.now().toString(); // Get current timestamp
    return `Q-${randomPart}-${timestampPart}`;
};

export const generateAccessToken = (user: User) => {
    const options = { expiresIn: config.jwt.expiry };

    return jwt.sign(user, config.jwt.secret, options);
};

export const verifyAccessToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        return { success: true, data: decoded };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const OTP_CODE_EXP: string = moment().add(45, 'minutes').toString();

export const hashData = async (data: string) => {
    const hash = await bcrypt.hash(data, 10);
    return hash;
};

export const compareHashedData = async (data: string, encrypted:string) => {
    const match = await bcrypt.compare(data, encrypted);
    return match;
};

export const generateRefCode = (key?: string, length = 6) => {
    const characters = key + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};
export const generateOtp = (key?: string, length = 6) => {
    // const characters = key + '0123456789';
    const characters = '0123456789';

    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};

export const calculateDistance = (latitude1: number, longitude1: number, latitude2: number, longitude2: number)  => {
    // Radius of the Earth in kilometers
    const radius = 6371; 

    const toRadians = (degree: number): number => {
        return degree * (Math.PI / 180);
    };

    const differenceInLatitude = toRadians(latitude2 - latitude1);
    const differenceInLongitude = toRadians(longitude2 - longitude1);

    const a =
        Math.sin(differenceInLatitude / 2) * Math.sin(differenceInLatitude / 2) +
        Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) *
        Math.sin(differenceInLongitude / 2) * Math.sin(differenceInLongitude / 2);

    const distanceInRadians = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    const distance = radius * distanceInRadians;

    return distance;
}

export const encryptData = async (data: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export const decryptData = async (data: string) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
