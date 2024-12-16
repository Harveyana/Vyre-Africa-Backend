import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
dotenv.config();

export const authMiddleware = (
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

    const result = verifyAccessToken(token as string);

    if (!result.success) {
        return res.status(403).json({ error: result.error });
    }

    req.user = result.data;
    next();
};
