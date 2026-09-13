import { tenantContext, type TenantContextValue } from './tenant-context';

export function runWithTenant<T>(value: TenantContextValue, fn: () => T): T {
  return tenantContext.run(value, fn);
}
