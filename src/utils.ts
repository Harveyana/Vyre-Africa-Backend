import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './config/prisma.config';
import moment from 'moment';
import config from './config/env.config';
import { User } from './globals';
import Decimal from 'decimal.js';
import crypto from 'crypto';

const algorithm: string = 'aes-256-cbc';
const key: Buffer = crypto.randomBytes(32);
const iv: Buffer = crypto.randomBytes(16);


export const generateSignature = (
    body: string,       // raw JSON string of the request body
    timestamp: string,  // timestamp string from header
    secret: string      // your webhook secret
): string => {
    const payloadToSign = `${timestamp}.${body}`;
    return crypto
      .createHmac("sha256", secret)
      .update(payloadToSign)
      .digest("hex");
};

export const isValidSignature = (
    body: string,       // raw JSON string of the request body
    timestamp: string,  // timestamp string from X-Api-Timestamp header
    signature: string,  // hex string from X-Api-Signature header
    secret: string      // your webhook secret
): boolean => {
    const expectedSignature = generateSignature(body, timestamp, secret);
    // Use timing-safe comparison to avoid timing attack vulnerability
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedSigBuffer = Buffer.from(expectedSignature, "hex");
    return (
      sigBuffer.length === expectedSigBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
    );
};

export const hasSufficientBalance = (
    availableBalance: any, // Store balance as string
    amount: string|number
  ): boolean => {
    const balanceDecimal = new Decimal(availableBalance);
    const amountDecimal = new Decimal(amount);
  
    return amountDecimal.lte(balanceDecimal); // Use lte (less than or equal)
}

export const amountSufficient = (
    amount1: string|number,
    amount2: string|number
  ): boolean => {
    const amount1Decimal = new Decimal(amount1);
    const amount2Decimal = new Decimal(amount2);
  
    return amount1Decimal.greaterThanOrEqualTo(amount2Decimal); // Use greater than or equal to
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

export const checkUserPaymentMethods = async (userId: string)=> {
    const [fiatAccounts, cryptoAccounts] = await Promise.all([
      prisma.fiatAccount.findMany({
        where: { userId },
        select: { id: true, name: true, currency: true }
      }),
      prisma.cryptoAccount.findMany({
        where: { userId },
        select: { id: true, name: true, cryptoWalletType: true }
      })
    ]);
  
    return {
      hasAnyPaymentMethod: fiatAccounts.length > 0 || cryptoAccounts.length > 0,
      hasFiatAccount: fiatAccounts.length > 0,
      hasCryptoAccount: cryptoAccounts.length > 0,
    //   fiatAccounts,
    //   cryptoAccounts
    };
}

export const calculateFee = (sourceAmount: number): number => {
    // Base fee is 4.5%, but decreases with higher amounts
    let feePercentage: number;
  
    if (sourceAmount <= 10) {
      feePercentage = 0.045; // 4.5% for small amounts (<$10)
    } else if (sourceAmount <= 50) {
      feePercentage = 0.035; // 3.5% for $10–50
    } else {
      feePercentage = 0.025; // 2.5% for $50–100
    }
  
    // Calculate fee in USD
    let fee = sourceAmount * feePercentage;
  
    // Ensure minimum fee of $0.40
    return Number(Math.max(fee, 0.40).toFixed(2));
  };

type PaymentMethod =
  | 'ACH'          // USA
  | 'WIRE'         // International
  | 'SEPA'         // Eurozone
  | 'AE_UAEFTS'    // UAE
  | 'AR_TRANSFERS_3' // Argentina
  | 'AU_BECS'      // Australia
  | 'BD_BEFTN'     // Bangladesh
  | 'BO_RTGS'      // Bolivia
  | 'BR_TED_DOC_PIX' // Brazil
  | 'CA_INTERAC'   // Canada
  | 'CL_TEF'       // Chile
  | 'CN_CNAPS'     // China
  | 'CO_ACH'       // Colombia
  | 'CR_SINPE'     // Costa Rica
  | 'CZ_CERTIS'    // Czech Republic
  | 'DK_NEMKONTO_FI' // Denmark
  | 'DO_ACH'       // Dominican Republic
  | 'EC_LOCAL'     // Ecuador
  | 'EG_RTGS_IPN'  // Egypt
  | 'GB_BACS_CHAPS_FPS' // UK
  | 'GH_GHIPSS'    // Ghana
  | 'GT_ACH'       // Guatemala
  | 'HK_HKICL_CHATS_ECG' // Hong Kong
  | 'HU_GIRO'      // Hungary
  | 'ID_SKN_RTGS'  // Indonesia
  | 'IL_ZAHAV'     // Israel
  | 'IN_NEFT_RTGS_IMPS' // India
  | 'JM_LOCAL'     // Jamaica
  | 'JO_ACH'       // Jordan
  | 'JP_ZENGIN'    // Japan
  | 'KE_KIBBS_PESALINK' // Kenya
  | 'KR_LOCAL'     // South Korea
  | 'LK_LOCAL'     // Sri Lanka
  | 'MX_SPEI'      // Mexico
  | 'MY_IBG_RENTAS' // Malaysia
  | 'NG_NIBSS_NEFT' // Nigeria
  | 'NO_NICS'      // Norway
  | 'NP_LOCAL'     // Nepal
  | 'NZ_LOCAL'     // New Zealand
  | 'PE_CCE'       // Peru
  | 'PH_INSTAPAY_PESONET' // Philippines
  | 'PK_RAAST_IBFT' // Pakistan
  | 'PL_ELIXIR_BLUE_CASH' // Poland
  | 'QA_QPS'       // Qatar
  | 'RO_RTGS'      // Romania
  | 'SA_MADA'      // Saudi Arabia
  | 'SE_BANKGIROT' // Sweden
  | 'SG_FAST_MEPS' // Singapore
  | 'SV_LOCAL'     // El Salvador
  | 'SWIFT'        // International
  | 'TH_BAHTNET_PROMPTPAY' // Thailand
  | 'TR_FAST_EFT'  // Turkey
  | 'TZ_RTGS'      // Tanzania
  | 'VN_IBPS'      // Vietnam
  | 'ZA_RTGS_EFT'; // South Africa

  export function getPaymentMethodByCurrency(currencyCode: string): PaymentMethod | undefined {
    const currencyToMethod: Record<string, PaymentMethod> = {
      USD: 'ACH',       // USA (ACH) or 'WIRE' for international USD
      EUR: 'SEPA',      // Eurozone
      AED: 'AE_UAEFTS', // UAE
      ARS: 'AR_TRANSFERS_3', // Argentina
      AUD: 'AU_BECS',   // Australia
      BDT: 'BD_BEFTN',  // Bangladesh
      BOB: 'BO_RTGS',   // Bolivia
      BRL: 'BR_TED_DOC_PIX', // Brazil
      CAD: 'CA_INTERAC', // Canada
      CLP: 'CL_TEF',    // Chile
      CNY: 'CN_CNAPS',  // China
      COP: 'CO_ACH',    // Colombia
      CRC: 'CR_SINPE',  // Costa Rica
      CZK: 'CZ_CERTIS', // Czech Republic
      DKK: 'DK_NEMKONTO_FI', // Denmark
      DOP: 'DO_ACH',    // Dominican Republic
      EGP: 'EG_RTGS_IPN', // Egypt
      GBP: 'GB_BACS_CHAPS_FPS', // UK
      GHS: 'GH_GHIPSS', // Ghana
      GTQ: 'GT_ACH',    // Guatemala
      HKD: 'HK_HKICL_CHATS_ECG', // Hong Kong
      HUF: 'HU_GIRO',   // Hungary
      IDR: 'ID_SKN_RTGS', // Indonesia
      ILS: 'IL_ZAHAV',  // Israel
      INR: 'IN_NEFT_RTGS_IMPS', // India
      JMD: 'JM_LOCAL',  // Jamaica
      JOD: 'JO_ACH',    // Jordan
      JPY: 'JP_ZENGIN', // Japan
      KES: 'KE_KIBBS_PESALINK', // Kenya
      KRW: 'KR_LOCAL',  // South Korea
      LKR: 'LK_LOCAL',  // Sri Lanka
      MXN: 'MX_SPEI',   // Mexico
      MYR: 'MY_IBG_RENTAS', // Malaysia
      NGN: 'NG_NIBSS_NEFT', // Nigeria
      NOK: 'NO_NICS',   // Norway
      NPR: 'NP_LOCAL',  // Nepal
      NZD: 'NZ_LOCAL',  // New Zealand
      PEN: 'PE_CCE',    // Peru
      PHP: 'PH_INSTAPAY_PESONET', // Philippines
      PKR: 'PK_RAAST_IBFT', // Pakistan
      PLN: 'PL_ELIXIR_BLUE_CASH', // Poland
      QAR: 'QA_QPS',    // Qatar
      RON: 'RO_RTGS',   // Romania
      SAR: 'SA_MADA',   // Saudi Arabia
      SEK: 'SE_BANKGIROT', // Sweden
      SGD: 'SG_FAST_MEPS', // Singapore
      THB: 'TH_BAHTNET_PROMPTPAY', // Thailand
      TRY: 'TR_FAST_EFT', // Turkey
      TZS: 'TZ_RTGS',   // Tanzania
      VND: 'VN_IBPS',   // Vietnam
      ZAR: 'ZA_RTGS_EFT', // South Africa
    };
  
    return currencyToMethod[currencyCode.toUpperCase()];
  }

  const countryToISOMap: Record<string, string> = {
    'Algeria': 'DZ',
    'Angola': 'AO',
    'Benin': 'BJ',
    'Botswana': 'BW',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cameroon': 'CM',
    'Cape Verde': 'CV',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Comoros': 'KM',
    'Congo-Brazzaville': 'CG',
    'Congo-Kinshasa': 'CD',
    "Côte d'Ivoire": 'CI',
    'Djibouti': 'DJ',
    'Egypt': 'EG',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Eswatini': 'SZ',
    'Ethiopia': 'ET',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Ghana': 'GH',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Kenya': 'KE',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Namibia': 'NA',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Rwanda': 'RW',
    'São Tomé and Príncipe': 'ST',
    'Senegal': 'SN',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Sudan': 'SS',
    'Sudan': 'SD',
    'Tanzania': 'TZ',
    'Togo': 'TG',
    'Tunisia': 'TN',
    'Uganda': 'UG',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW'
  };

  export const getISOByCountry = (countryName: string): string | undefined => {
    return countryToISOMap[countryName];
  };

  
  
