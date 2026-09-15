import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';
} | null;

export const tenantContext = new AsyncLocalStorage<TenantContextValue>();
