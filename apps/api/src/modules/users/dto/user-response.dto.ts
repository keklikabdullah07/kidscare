import type { UserRole } from '@kidscare/shared-types';

export type UserResponseDto = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};
