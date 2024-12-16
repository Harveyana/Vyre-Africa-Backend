import { Request, Response } from 'express';
import prisma from '../config/prisma.config';

export class RoleController {
    async createRole(req: Request, res: Response) {
        const role = req.body;

        try {
            const newRole = await prisma.role.create({
                data: {
                    name: role.name,
                    description: role.description,
                    permissions: {
                        create: role.permissions.map((permissionId: string) => ({
                                permission: { connect: { id: permissionId } },
                            }),
                        ),
                    },
                },
            });
            return res.status(201).json({
                msg: 'Role created successfully',
                role: newRole,
                success: true,
            });
        } catch (error) {
            return res.status(500).json({
                msg: 'Failed to create role',
                route: '/role',
                success: false,
            });
        }
    }

    async createPermission(req: Request, res: Response) {
        const { action, subject } = req.body;
        try {
            
            const permission = await prisma.permission.create({
                data: {
                    action,
                    subject
                },
            });
            return res.status(200).json({
                msg: 'Permission created successfully',
                permission,
                success: true,
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                msg: 'failed to create permission',
                route: '/role/permission',
                success: false,
            });
        }
    }

    async assignRole(req: Request, res: Response) {
        const { userId, roleId } = req.body;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            const adminRole = await prisma.role.findUnique({
                where: { id: roleId },
            });

            if (user && adminRole) {
                const userUpdate = await prisma.user.update({
                    where: { id: user.id},
                    data: {
                        roleId: adminRole.id,
                    },
                });

                return res.status(201).json({
                    msg: 'Role assigned successfully',
                    userUpdate,
                    success: true,
                });
            } else {
                return res.status(400).json({
                    msg: 'User or role not found',
                    success: false,
                });
            }
        } catch (error) {
            return res.status(500).json({
                msg: 'failed to assign role',
                route: '/role/permission',
                success: true,
            });
        }
    }

    async updateUserRoles(req: Request, res: Response) {
        const { userId, rolesToAdd, rolesToRemove } = req.body;

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    role: {
                        connect: rolesToAdd.map((roleId: string) => ({
                            id: roleId,
                        })),
                        disconnect: rolesToRemove.map((roleId: string) => ({
                            id: roleId,
                        })),
                    },
                },
                include: {
                    role: true,
                },
            });

            return res.status(200).json({
                msg: 'User role updated successfully',
                success: true,
                updatedUser,
            });
        } catch (error) {
            return res.status(500).json({
                msg: 'Failed to update user roles',
                route: '/user/update-roles',
                success: false,
            });
        }
    }

    async deleteUserRole(req: Request, res: Response) {
        const { userId, roleId } = req.body;

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    role: {
                        disconnect: { id: roleId },
                    },
                },
                include: {
                    role: true,
                },
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            return res.status(500).json({
                msg: 'Failed to delete user role',
                route: '/user/delete-role',
                success: false,
            });
        }
    }

    async findManyRoles(req: Request, res: Response) {
        try {
            const rolesWithPermissions = await prisma.role.findMany({
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });
            return res
                .status(200)
                .json({ rolesWithPermissions, success: true });
        } catch (error) {
            return res
                .status(500)
                .json({ msg: 'Cannot find roles', success: true });
        }
    }

    async getPermissions(req: Request, res: Response) {
        const permissions = await prisma.permission.findMany();
        
        return res.status(201).json({
            msg: 'permissions fetched successfully',
            success: true,
            permissions,
        });
    }

    async updateRole(req: Request, res: Response) {
        const {name, description, permissions} = req.body;
        console.log(req.body)
        const role_id = req.params.role_id;
        let permissionsToRemove:any = [];
        let permissionsToAdd = permissions;

        try {

            const role = await prisma.role.findUnique({
                where:{id : role_id},
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                },
            });

            const currentPermissions = role?.permissions.map((rolePermssion) => {
                return rolePermssion.permissionId
            })

            if(currentPermissions){
                //find permissions to disconnet
                permissionsToRemove = currentPermissions.filter((permissionId: string) => !permissions.includes(permissionId));
                
                // Find which permissions to connect
                permissionsToAdd = permissions.filter((permissionId: string) => !currentPermissions.includes(permissionId));
            }

            if(permissionsToRemove && permissionsToRemove.length){
                await prisma.role.update({
                    where: { id: role_id },
                    data: {
                        name,
                        description,
                        permissions: {
                            deleteMany: permissionsToRemove.map((permissionId: string) => ({
                                permissionId,
                            })),
                        },
                    },
                });
            }

            await prisma.role.update({
                where: { id: role_id },
                data: {
                    name: name,
                    description: description,
                    permissions: {
                        createMany: {
                            data: permissionsToAdd.map((permissionId: string) => ({
                              permissionId,
                            })),
                        },
                    },
                },
            });

            return res.status(201).json({
                msg: 'Role updated successfully',
                success: true,
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                msg: 'Failed to update role',
                route: '/admin/role',
                success: false,
            });
        }
    }
}

export default new RoleController();
