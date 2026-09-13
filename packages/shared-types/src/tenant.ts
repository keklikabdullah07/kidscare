export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
};

export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>;
