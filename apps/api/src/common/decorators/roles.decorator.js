import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
/** Limits an authenticated endpoint to one or more application roles. */
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);
