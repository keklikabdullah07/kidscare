import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
} | null;

export const tenantContext = new AsyncLocalStorage<TenantContextValue>();
