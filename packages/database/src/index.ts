export { PrismaClient } from './client';
export { withTenantContext, Prisma } from './middleware/tenant.middleware';
export { createAuthLookupClient } from './client/auth-lookup-client';
export { AUTH_LOOKUP_USER_COLUMNS, AUTH_LOOKUP_TENANT_COLUMNS } from './auth-lookup-columns';
// Re-export the model types so app code can name them from
// `@kidscare/database` without deep-importing the generated client.
export type {
  Tenant,
  User,
  Student,
  DailyReport,
  TenantStatus,
  UserRole,
} from './generated/client';
