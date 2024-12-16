import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { User } from '../interfaces';

export const defineAbilitiesFor = (user: User) => {
    const { can, cannot, build } = new AbilityBuilder(createPrismaAbility);

    if (user.role) {
        user.role.permissions.forEach((permission: any) => {
            can(
                permission.permission.action,
                permission.permission.subject,
            );
        });
    }

    return build();
};
