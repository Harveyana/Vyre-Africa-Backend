import dotenv from 'dotenv';
import { UserInfoClient } from 'auth0';
import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils';
import prisma from '../config/prisma.config';
dotenv.config();

const userInfoClient = new UserInfoClient({
    domain: 'auth.vyre.africa', // Your Auth0 domain
});
  

export const authMiddleware = async(
    req: Request & Record<string, any>,
    res: Response,
    next: NextFunction,
) => {

    console.log(req.headers)

    const { authorization } = req.headers;
    if (!authorization) {
        return res
            .status(401)
            .json({ msg: 'Authentication token required', success: false });
    }
    const token = authorization.split(' ')[1];

    console.log(token)

    // const result = verifyAccessToken(token as string);
    const { success, data, error } = await verifyAccessToken(token);
    console.log(success)
    let user;

    if (success) {
        console.log(data?.sub);      // "auth0|123456"
        // console.log(data?.email);    // "user@example.com"


        try{
            const userDetails = await userInfoClient.getUserInfo(token);
            console.log('userDetails',userDetails.data)
            user = await prisma.user.findUnique({
                where: {
                  authId: userDetails.data?.sub as string, // Assuming you store Auth0 ID in fernUserId,
                  email: userDetails.data?.email
                },
                select:{
                    id:true,
                    authId:true,
                    firstName:true,
                    lastName:true,
                    email:true
                }
            })
            // create new user if not exist
            if(!user){
                const result = await prisma.$transaction(async (prisma) => {
    
                    const newUser = await prisma.user.create({
                        data: {
                            firstName: userDetails.data?.given_name as string,
                            lastName: userDetails.data?.family_name as string,
                            authId: userDetails.data?.sub,
                            email: userDetails.data?.email,
                            emailVerified: userDetails.data?.email_verified,
                            photoUrl: userDetails.data?.picture,
                            phoneNumber: userDetails.data?.phone_number
                        }
                    });
    
                    console.log('newUser',newUser)
    
                    return {
                      user: newUser
                    };
    
                });

                return res.status(201).json({
                    msg: 'User Registered Successfully',
                    success: true,
                    newUser: true,
                    user: result.user
                });
            }

        } catch (error) {
            console.error('user retrieval error:', error)
            return res.status(401).json({ msg: 'User not found', success: false });
        }


    }else{
       return res.status(403).json({ error });
    }


    req.user = user;

    next();
};
