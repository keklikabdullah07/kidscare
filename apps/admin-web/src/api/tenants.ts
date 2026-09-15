import type { Tenant } from '@kidscare/shared-types';
import { apiFetch } from './client';

export function getTenantMe(): Promise<Tenant> {
  return apiFetch<Tenant>('/tenants/me');
}

export function updateTenantMe(name: string): Promise<Tenant> {
  return apiFetch<Tenant>('/tenants/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
