import type { UserRole } from '@kidscare/shared-types';

export type UserResponseDto = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

