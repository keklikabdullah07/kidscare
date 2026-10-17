import { AsyncLocalStorage } from 'node:async_hooks';
import type { UserRole } from '@kidscare/shared-types';

export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: UserRole;
} | null;

export const tenantContext = new AsyncLocalStorage<TenantContextValue>();
