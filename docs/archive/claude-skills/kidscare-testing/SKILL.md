---
name: kidscare-testing
description: Use when writing tests, reviewing test coverage, adding a new endpoint, or checking whether a feature is testable. Covers Jest setup for backend, Vitest for web, the tenant-isolation integration test, and the per-method test minimum.
---

# KidsCare — Testing Conventions

## Test Layout

### Backend (Jest, NestJS default)

- `*.spec.ts` files colocated with the file they test
- Unit tests: `students.service.spec.ts`, `students.repository.spec.ts`, `tenant.guard.spec.ts`
- Integration tests: `apps/api/test/<feature>.spec.ts` (one level up from `src/`)
- E2E tests: `apps/api/test/e2e/<flow>.e2e-spec.ts`

A test file at the same path as the code it covers is the convention. Reading the directory should reveal the test surface without a separate `__tests__` walk.

### Frontend (Vitest, Vite-native)

- `*.test.ts` or `*.test.tsx` colocated with the component
- One test file per component or hook, named after it
- Test setup at `apps/admin-web/src/test-setup.ts`

### Mobile (Jest, Expo preset)

- `*.test.tsx` colocated
- Expo's Jest preset handles the React Native environment

## Per-Method Test Minimum

For every public service method:

- **One happy path** — typical inputs, expected output, no error
- **One failure path** — invalid input, missing data, or downstream error. Assert both the thrown error type and the message when the message is part of the contract

For every repository method:

- **One happy path** — round-trip insert + read returns the row
- **One not-found path** — `findById` on a missing id returns `null` (not throws)

For every controller method:

- **One happy path** through the HTTP boundary: 200 with response DTO
- **One validation failure** — missing required field, wrong type: 400
- **One auth/tenant failure** — missing context, wrong tenant: 403

If a method's contract is "this never throws," the test asserts the return value and nothing else — do not invent artificial failure paths.

## The Tenant-Isolation Integration Test

`apps/api/test/tenant-isolation.spec.ts` is mandatory. It boots a test Postgres, applies the migrations, runs the seed with two tenants, and proves that RLS + AsyncLocalStorage + Prisma middleware work together. The test runs on every CI build.

The test covers, at minimum:

1. **Setup** — create tenants A and B, each with one admin user
2. **Within-tenant read** — tenant A user reads its own users → sees only tenant A's rows
3. **Cross-tenant read** — tenant A user reads users → tenant B's rows are absent (empty list, not an error)
4. **Cross-tenant write** — tenant A user attempts to insert a row with `tenantId = B` → rejected (RLS policy violation)
5. **Login bypass** — using `kidscare_auth_lookup` connection, look up a user by email across tenants → succeeds (the login flow's only legitimate cross-tenant query)
6. **Login bypass negative** — `kidscare_auth_lookup` attempting `INSERT INTO users` → rejected by GRANT

The test connects as `kidscare_app` for the application-flow assertions and as `kidscare_auth_lookup` only for assertion #5. It never connects as `kidscare_migrator` except for setup/teardown.

## Test Database Lifecycle

- A dedicated test database (`kidscare_test`) lives in the same Postgres instance
- Migrations apply at suite startup; data truncates between tests (not between transactions — between tests, with the order randomised)
- The test suite does not run against the dev database. Cross-contamination is the most expensive class of test bug.

## Mocks

- **Repositories** in service tests: implement the interface with an in-memory store or a hand-rolled spy. No `jest.mock('prisma')` calls in service tests — the repository abstraction is what we are testing through.
- **External SDKs** (iyzico, Cloudflare R2, FCM): wrap behind the project's own interface (`IPaymentGateway`, `IFileStorage`) and mock the interface in service tests. Adapter tests verify the SDK integration separately.
- **Time**: use `@sinonjs/fake-timers` or Jest's `useFakeTimers()`. Tests that depend on "now" must not depend on wall-clock time.

## Coverage

Sub-project #1 ships without a coverage threshold (baseline report enabled). The threshold is set after the first feature module lands. Tentative targets once enforced:

- Lines: 80%
- Branches: 75%
- Critical modules (auth, payments, tenant guard): 90%

Coverage is a tripwire, not a goal. A test that raises coverage without asserting behaviour is a useless test.

## What This Skill Does Not Cover

- Module template, service layer shape → `kidscare-solid-modules`
- Database setup, migrations → `kidscare-prisma-database`
- Tenant guard, RLS, role separation → `kidscare-multi-tenancy`
- File naming → `kidscare-naming-rules`
