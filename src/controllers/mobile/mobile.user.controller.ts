import { Request, Response } from 'express';
import prisma from '../../config/prisma.config';
import paystackService from '../../services/paystack.service';
import { compareHashedData } from '../../utils';


class MobileUserController{
    async verifyCard(req: Request & Record<string, any>, res: Response){
        const {cardNumber} = req.body

        const verifyCard = await paystackService.resolveCard(cardNumber as number)

        if (!verifyCard?.status) {
            return res.status(400).json({
                msg: 'wrong card number',
                success: false,
            });
        }

        return res.status(201).json({
            msg: 'Card verified successfully',
            success: true,
            data: {
                brand: verifyCard.data?.brand,
                card_type: verifyCard.data?.card_type,
                bank: verifyCard.data?.bank,
            },
        });
    }

    async addCard(req: Request & Record<string, any>, res: Response){
        const { cardHolderName, cardNumber, expiryDate, cvv, brand, cardType, transactionId } = req.body
        const user = req.user
        
        try {

            //check card does not already exist
            const checkCard = await prisma.card.findFirst({
                where: {
                    cardNumber
                }
            })

            if(checkCard){
                return res.status(400).json({
                    msg: 'card already exists',
                    success: false,
                });
            }

            //verify transaction
            const verify = await paystackService.verifyTransaction(transactionId);

            if (!verify?.status) {
                return res.status(400).json({
                    msg: 'Error verifying transaction',
                    success: false,
                });
            }

            const card = await prisma.card.create({
                data: {
                    userId: user.id,
                    cardHolderName,
                    cardNumber,
                    expiryDate,
                    cvv,
                    brand,
                    cardType,
                    authorizationCode: verify.data?.authorization.authorization_code ?? ''
                }
            })

            return res.status(201).json({
                msg: 'card added successfully',
                success: true,
                card
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }

    async getCards(req: Request & Record<string, any>, res: Response){
        const user = req.user

        try {

            const cards = await prisma.card.findMany({
                where: {userId: user.id}
            })

            return res.status(201).json({
                msg: 'cards fetched successfully',
                success: true,
                cards
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }

    async setCardAsPreferred(req: Request & Record<string, any>, res: Response){
        const user = req.user
        const cardId = req.params.card_id
        
        try {

            //check that card exists
            const card = await prisma.card.findUnique({
                where: {
                    id: cardId
                }
            })

            if(!card){
                return res.status(400).json({
                    msg: 'card does not exist',
                    success: false,
                });
            }

            const updatedCard = await prisma.card.update({
                where: {
                    id: cardId
                },
                data: {
                    isPreferred: true
                }
            })

            return res.status(201).json({
                msg: 'card updated successfully',
                success: true,
                card: updatedCard
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }

    async unSetCardAsPreferred(req: Request & Record<string, any>, res: Response){
        const user = req.user
        const cardId = req.params.card_id
        
        try {

            //check that card exists
            const card = await prisma.card.findUnique({
                where: {
                    id: cardId
                }
            })

            if(!card){
                return res.status(400).json({
                    msg: 'card does not exist',
                    success: false,
                });
            }

            const updatedCard = await prisma.card.update({
                where: {
                    id: cardId
                },
                data: {
                    isPreferred: false
                }
            })

            return res.status(201).json({
                msg: 'card updated successfully',
                success: true,
                card: updatedCard
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }

    async deleteCard(req: Request & Record<string, any>, res: Response){
        const user = req.user
        const cardId = req.params.card_id
        
        try {

            //check that card exists
            const card = await prisma.card.findUnique({
                where: {
                    id: cardId
                }
            })

            if(!card){
                return res.status(400).json({
                    msg: 'card does not exist',
                    success: false,
                });
            }

            await prisma.card.delete({
                where: {
                    id: cardId
                }
            })

            return res.status(201).json({
                msg: 'card deleted successfully',
                success: true,
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }

    async deleteAccount(req: Request & Record<string, any>, res: Response){
        const user = req.user
        const { password, reason } = req.body
        
        try {

            //check that password is correct
            const getUser = await prisma.user.findFirst({
                where: {
                    id: user.id
                }
            })

            if(getUser && getUser.password){
                if(! await compareHashedData(password, getUser.password)){
                    return res.status(400).json({
                        msg: 'password is incorrect',
                        success: false,
                    });
                }
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isDeactivated: true,
                    deactivationReason: reason
                }
            })

            return res.status(201).json({
                msg: 'account deleted successfully',
                success: true,
            });
            
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json({ msg: 'Internal Server Error', success: false, error });
        }
    }
}

export default new MobileUserController();