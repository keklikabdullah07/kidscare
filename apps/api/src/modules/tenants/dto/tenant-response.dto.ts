import type { Tenant } from '@kidscare/shared-types';

/**
 * Response shape for the Tenants endpoints. The shared `Tenant` type
 * (from `@kidscare/shared-types`) IS the wire format — NestJS serializes
 * the `Tenant` entity class instance to JSON with the same field names,
 * so no separate mapping class is needed.
 *
 * If response-only fields are added later (pagination wrapper, hypermedia
 * links, computed values) they belong in a dedicated response class that
 * extends or composes `Tenant`.
 */
export type TenantResponse = Tenant;
