import { UserStatus } from '@prisma/client';

export interface Permission {
    action: string;
    subject: string;
}

export type Permissions = Array<Permission>;
export interface Role {
    id: string;
    name: string;
    permissions: Array<Record<string, any>>;
}

 interface userRole {
    id: string;
    name: string;
    description: string;
    permissions: Array<any>
 }

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    userStatus?: UserStatus;
    organisationId: string | null;
    type: string;
    photoUrl: string | null;
    email: string;
    phoneNumber: string;
    createdAt: Date;
    role: userRole | null;
}
