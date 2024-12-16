import { body } from 'express-validator';

class UserRoleValidator {
    createRole() {
        return [
            body('name').notEmpty().withMessage('Role name is required'),
            body('description')
                .notEmpty()
                .withMessage('Role description is required'),
            body('permissions').isArray().notEmpty(),
        ];
    }
    createPermission() {
        return [
            body('action').notEmpty().withMessage('Action is required'),
            body('subject').notEmpty().withMessage('Subject is required'),
        ];
    }
    assignRole() {
        return [
            body('userId')
                .notEmpty()
                .withMessage('userId required to assign role'),
            body('roleId')
                .notEmpty()
                .withMessage('roleId is required to assign role'),
        ];
    }
    updateUserRole() {
        return [body('userId').notEmpty().withMessage('userId is missing')];
    }
    deleteRole() {
        return [
            body('userId').notEmpty().withMessage('userId is missing'),
            body('roleId').notEmpty().withMessage('roleId is missing.'),
        ];
    }

    updateAdminRole() {
        return [
            body('name').notEmpty().withMessage('Role name is required'),
            body('description')
                .notEmpty()
                .withMessage('Role description is required'),
            body('permissions').isArray().notEmpty(),
        ];
    }
}

export default new UserRoleValidator();
