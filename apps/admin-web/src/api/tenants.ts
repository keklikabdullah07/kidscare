import type { OperationalAlertsResponse, Tenant } from '@kidscare/shared-types';
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

export function getOperationalAlerts(): Promise<OperationalAlertsResponse> {
  return apiFetch<OperationalAlertsResponse>('/tenants/me/operational-alerts');
}
