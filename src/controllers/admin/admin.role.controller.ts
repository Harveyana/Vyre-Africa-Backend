import { Request, Response } from 'express';
import prisma from '../../config/prisma.config';

class AdminRoleController{
    async updateRole(req: Request, res: Response) {
        const {name, description, permissions} = req.body;
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
                        name: name,
                        description: description,
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

    async getSingleRole(req: Request, res: Response){
        const role_id = req.params.role_id;

        try {
            const role = await prisma.role.findUnique({
                where:{id : role_id},
                include: {
                    permissions: {
                        include: {
                            permission: true,
                        },
                    },
                    users: true
                },
            });
            return res.status(201).json({
                msg: 'Role fetched successfully',
                role,
                success: true,
            });
        } catch (error) {
            return res.status(500).json({
                msg: 'Failed to update role',
                route: '/admin/role',
                success: false,
            });
        }
    }
}

export default new AdminRoleController()