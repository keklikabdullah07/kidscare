import type { UserRole } from './user';

export type JwtClaims = {
  sub: string; // user id
  tenantId: string;
  role: UserRole;
};

export type LoginRequest = {
  tenantSlug: string;
  email: string;
  password: string;
};

export type SignupRequest = {
  tenantSlug: string;
  tenantName: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};
