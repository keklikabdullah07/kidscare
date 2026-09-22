import { tenantContext } from './tenant-context';
export function runWithTenant(value, fn) {
    return tenantContext.run(value, fn);
}
