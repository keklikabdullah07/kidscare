export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'SERVICE_STAFF';

export type User = {
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

export type UserProfileUpdateInput = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
};
