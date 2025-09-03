import dotenv from 'dotenv';
import { UserInfoClient } from 'auth0';
import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
import prisma from '../config/prisma.config';

dotenv.config();


export const authMiddleware = async (
  req: Request & { user?: any, isNewUser?:boolean },
  res: Response,
  next: NextFunction
) => {
  // 1. Extract Token
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ 
      success: false,
      error: 'Missing authorization token' 
    });
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Malformed authorization header'
    });
  }

  try {
    // 2. Validate Token (choose ONE approach)
    
    // OPTION A: Local verification (recommended)
    const { success, data } = verifyAccessToken(token);
    if (!success || !data?.userId) {
      console.log('token data',data)
        
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // OPTION B: Remote verification (if you need fresh claims)
    // const userInfo = await userInfoClient.getUserInfo(token);
    // if (!userInfo.data?.sub) {
    //   return res.status(403).json(...);
    // }
    // const authId = userInfo.data.sub;

    // 3. Find/Create User
    let user = await prisma.user.findUnique({
      where: { id: data?.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    // 4. Create new user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: data.userId,
          email: data.email as string,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          emailVerified: data.emailVerified || false,
          photoUrl: data.photoUrl
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      // Optionally return 201 for new users
      req.isNewUser = true;
    }

    // 5. Attach user and proceed
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
