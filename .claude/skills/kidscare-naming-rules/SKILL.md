---
name: kidscare-naming-rules
description: Use when naming a new file, class, variable, DTO, interface, or enum in the KidsCare codebase. Covers kebab-case files, PascalCase classes, camelCase members, naming for DTO/entity/repository/service, and the explicit list of patterns the agent must never produce.
---

# KidsCare — Naming and Forbidden Patterns

## File Names

All TypeScript files: `kebab-case.ts`. The segment before `.ts` carries enough context that the directory is optional to read.

| Construct | Pattern | Example |
|---|---|---|
| Module file | `<domain>.module.ts` | `students.module.ts` |
| Controller | `<domain>.controller.ts` | `students.controller.ts` |
| Service | `<domain>.service.ts` | `students.service.ts` |
| Repository | `<domain>.repository.ts` | `students.repository.ts` |
| DTO | `<verb>-<entity>.dto.ts` or `<entity>-response.dto.ts` | `create-student.dto.ts`, `student-response.dto.ts` |
| Entity | `<entity>.entity.ts` | `student.entity.ts` |
| Spec | colocated with subject + `.spec.ts` | `students.service.spec.ts`, `students.controller.spec.ts` |

React Native screens: `<ScreenName>Screen.tsx` (PascalCase file, PascalCase component) — Expo convention overrides the kebab-case rule for screens only.

## Class Names

PascalCase. The name says what the thing is, not what it does.

| Construct | Pattern | Example |
|---|---|---|
| Service | `<Domain>Service` | `StudentsService` |
| Controller | `<Domain>Controller` | `StudentsController` |
| Repository | `<Domain>Repository` | `StudentsRepository` |
| Interface for repository | `I<Domain>Repository` | `IStudentsRepository` |
| Interface for service (when cross-module) | `I<Domain>Service` | `IStudentsService` |
| DTO | `<Verb><Entity>Dto` or `<Entity>ResponseDto` | `CreateStudentDto`, `StudentResponseDto` |
| Entity | `<Entity>` | `Student` |
| Enum | `<PascalCase>` | `UserRole`, `TenantStatus` |
| Guard | `<Purpose>Guard` | `TenantGuard`, `RoleGuard` |
| Middleware | `<Purpose>Middleware` | `TenantContextMiddleware` |
| Interceptor | `<Purpose>Interceptor` | `LoggingInterceptor` |
| Decorator | `<Purpose>` (no suffix) | `Public`, `CurrentUser` |

DTO and entity names are nouns, not verbs. `CreateStudentDto`, not `MakeStudentDto` or `StudentCreationDto`. A name with a verb suggests the action belongs on a service method, not in a class name.

## Variables, Functions, Methods

`camelCase`. Service methods follow NestJS CRUD convention and do not deviate:

- `create`
- `findAll` (returns paginated list)
- `findOne` (returns single, throws if missing)
- `update`
- `remove` (soft delete by default, hard delete when the model has no `deletedAt`)

Custom operations are named after the domain verb, not the SQL: `enrollStudent`, `markAttendance`, `issueInvoice`. Avoid `get`, `set`, `do`, `process`, `handle` as standalone — they describe nothing.

Boolean variables and methods read as predicates: `isActive`, `canEnroll`, `hasPassed`. Never `activeFlag`, `enrollmentStatusBool`.

Constants in `SCREAMING_SNAKE_CASE`: `MAX_STUDENTS_PER_CLASS`, `DEFAULT_PAGE_SIZE`. They live at the top of the file that uses them or in a colocated `constants.ts` if shared.

## Enum Values

`SCREAMING_SNAKE_CASE`. The enum name is the noun, the values are the states:

```ts
enum TenantStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

A value named `tenantStatus.ACTIVE` reads as a sentence. A value named `tenantStatus.active` reads as a typo.

## What the Agent Must Never Produce

These are not preferences — they are review-rejection criteria. The list is explicit because guessing is expensive when the rejection happens after a 200-line diff.

### Forbidden File-Level Patterns

- `any` type. If the type is genuinely unknown, use `unknown` and narrow it at the boundary with a type guard. If `any` is unavoidable in a third-party adapter, add a `// eslint-disable-next-line` comment with a one-line reason — and the surrounding code must still be type-safe.
- `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why and when it can be removed.
- A `helpers.ts`, `utils.ts`, or `common.ts` file at module root. The function belongs in the service that uses it, or in a shared package if genuinely cross-cutting.
- Re-export of a type that exists in another file. Consolidate at the source.

### Forbidden Class-Level Patterns

- A service that imports Prisma directly. Service depends on repository interface.
- A controller that imports Prisma, a repository, or another module's service-internals.
- A repository that accepts `Request` or knows about HTTP.
- A DTO class with business logic — methods that compute, validate beyond shape, or call services. DTOs are wire format.
- An entity that depends on a framework (NestJS decorators, Prisma client, class-validator).
- A "Manager", "Handler", "Processor", "Helper", "Utility" suffix on a class. The name should describe the domain concept.

### Forbidden Method-Level Patterns

- A method named `getData`, `processData`, `doStuff`, `handleRequest`. The name must say what happens.
- A method longer than 30 lines. Refactor before merging.
- A method with more than 4 parameters. Wrap related parameters in an object.
- A boolean parameter. Replace with two methods named after the behaviour (`findActive` vs `findAll`, `softDelete` vs `hardDelete`).
- Returning `any` from a public method. Use the entity type or `void`.

### Forbidden Cross-Module Patterns

- Module A's service reaching into module B's repository. Goes through B's service.
- Module A's controller importing module B's DTOs. Each module owns its wire format; cross-module data flows through services.
- A shared type defined in two files. One definition, multiple imports.

### Forbidden Tenant Patterns

- A repository method without an explicit `tenantId` parameter. (RLS enforces the actual isolation; the parameter documents the dependency.)
- A `findMany` / `findFirst` call against a tenant-scoped table without the middleware-extended client. Bare Prisma bypasses RLS in code paths where it shouldn't.
- Importing `DATABASE_AUTH_LOOKUP_URL` from anywhere outside `apps/api/src/modules/auth/login.handler.ts`.

## What To Do When a Rule Conflicts With Reality

Sometimes a rule does not fit. When that happens:

1. Stop before writing the code
2. Tell the user which rule conflicts and why
3. Propose the deviation in one or two sentences
4. Wait for explicit approval

Silent deviations are forbidden. Stated, approved deviations become part of the next spec revision.
