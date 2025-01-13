import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
// import { defineAbilitiesFor } from '../globals';
// import { ForbiddenError } from '@casl/ability';

export class Middleware {
    handleValidationError(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }
        next();
    }

    // checkAbilities(action: string, subject: string) {
    //     return (
    //         req: Request & Record<string, any>,
    //         res: Response,
    //         next: NextFunction,
    //     ) => {
    //         const ability = defineAbilitiesFor(req.user);

    //         try {
    //             ForbiddenError.from(ability).throwUnlessCan(action, subject);
    //             next();
    //         } catch (error) {
    //             res.status(403).json({
    //                 message: `User not authorised to ${action} ${subject}`,
    //                 success: false,
    //             });
    //         }
    //     };
    // }
}

export default new Middleware();
