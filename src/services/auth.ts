import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
import prisma from '../config/prisma.config';
dotenv.config();

export const authMiddleware = async(
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction,
) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res
            .status(401)
            .json({ msg: 'Authentication token required', success: false });
    }
    const token = authorization.split(' ')[1];

    // const result = verifyAccessToken(token as string);
    const { success, data, error } = verifyAccessToken(token);
    let user;
    if (success) {
        console.log(data?.sub);      // "auth0|123456"
        console.log(data?.email);    // "user@example.com"
        
        user = await prisma.user.findUnique({
            where: {
              authId: data?.sub as string // Assuming you store Auth0 ID in fernUserId
            }
        })

    }else{
       return res.status(403).json({ error });
    }



    req.user = user;
    next();
};
