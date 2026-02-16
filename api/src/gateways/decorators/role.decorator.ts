import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
