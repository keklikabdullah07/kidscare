---
name: kidscare-shared-packages
description: Use when defining a new DTO, interface, Zod schema, or any type that needs to be shared between backend and frontend/mobile. Covers packages/shared-types, packages/shared-schemas, the dependency direction, and the rule against re-defining the same type in two places.
---

# KidsCare — Shared Packages Discipline

## Why This Exists

The same `Student` flows through the API response, the admin-web form, and the mobile offline cache. Defining it three times means three places to change when a field is renamed, three places where a field can drift, and three places where validation can disagree with the server. The discipline is: one definition, many consumers.

## The Two Packages

### `packages/shared-types/`

TypeScript types and interfaces. Pure types — no runtime code, no decorators, no class definitions. The package compiles to `dist/` for external consumption but is also importable from source via the workspace path alias.

```
packages/shared-types/src/
├── tenant.ts
├── user.ts
├── student.ts
├── payment.ts
├── index.ts          (barrel — re-exports everything)
└── ...
```

Exports are pure types:

```ts
// tenant.ts
export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string; // ISO 8601, always
  updatedAt: string;
};

export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>;
```

No `class`, no `enum`, no decorators. Types cross the wire as JSON; classes don't survive the boundary.

### `packages/shared-schemas/`

Zod schemas for runtime validation. The schema is the source of truth for shape; the TypeScript type is inferred from it.

```ts
// tenant.schema.ts
import { z } from 'zod';

export const tenantSchema = z.object({
  id: z.string().cuid(),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(128),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']),
});

export type Tenant = z.infer<typeof tenantSchema>;
```

The backend uses these schemas to validate inbound requests (via `nestjs-zod` or a custom pipe). The frontend uses them to validate form input and to typecheck API responses. Mobile uses them to validate cached data on rehydration.

When a type and its schema diverge, the schema wins — schemas validate at runtime, types are erased.

## Dependency Direction

```
apps/api        ─┐
apps/admin-web  ─┼──►  shared-schemas  ──►  shared-types
apps/mobile     ─┤
apps/marketing  ─┘
```

`shared-schemas` depends on `shared-types`. The reverse is forbidden. Apps depend on both packages; they do not depend on each other.

When `apps/api` needs a type, it imports from `shared-types`. When it needs to validate input shape, it imports the Zod schema from `shared-schemas`. When the API response shape is defined in the controller's response DTO, the DTO type comes from `shared-types` (or is inferred from the schema) — never redefined.

## Forbidden Re-Definition

The same type, defined twice, is a defect. Specifically forbidden:

```ts
// ❌ Defined in apps/api/src/modules/students/dto/student.dto.ts
export class StudentDto {
  id: string;
  firstName: string;
  ...
}

// ❌ Also defined in apps/admin-web/src/types/student.ts
export type Student = {
  id: string;
  firstName: string;
  ...
};
```

The fix is: define `Student` in `packages/shared-types/src/student.ts`, import in both places. The controller's response DTO either re-exports the shared type or extends it with HTTP-specific fields (pagination wrapper, hypermedia links, etc.).

The check `grep -r "export type Student" packages/ apps/` should return exactly one match. CI runs this grep; a second match is a build failure.

## Zod Schemas vs class-validator DTOs

NestJS's default DTO system uses `class-validator`. Two options:

- **Option A (default):** Backend uses Zod via `nestjs-zod` or a custom validation pipe. The `dto/` directory in each module contains Zod schemas re-exported from `shared-schemas` plus module-specific extensions. A single source of truth, frontend and backend share.
- **Option B:** Backend uses `class-validator` DTOs in `dto/` for HTTP validation; `shared-schemas` exists only for frontend/mobile. Two parallel definitions, drift risk.

The project uses **Option A**. When sub-project #2 (auth) lands, the `dto/` directory contains Zod schema re-exports, not `class-validator` classes.

## When a Type Is Module-Internal

Not every type belongs in `shared-types`. A type that exists only inside one service, only inside one repository, or only inside one component stays local. Promote to `shared-types` when:

- The type crosses the HTTP boundary (request body, response body, query params)
- The type is consumed by frontend or mobile
- The type encodes a contract that more than one module depends on

A type that exists only inside one service and is never returned to a controller is module-internal. Do not promote prematurely.

## Versioning

Shared packages have no published versions in MVP — they live in the workspace and are consumed via path aliases. When the project eventually publishes packages (if it ever does), the rules become conventional semver. For now: changes to a shared package can break consumers in the same workspace. Run all consumers' tests after changing a shared type.

## What This Skill Does Not Cover

- Module template, controller/service shape → `kidscare-solid-modules`
- Tenant isolation rules → `kidscare-multi-tenancy`
- File naming → `kidscare-naming-rules`
