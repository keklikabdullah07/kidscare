export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export type User = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};
