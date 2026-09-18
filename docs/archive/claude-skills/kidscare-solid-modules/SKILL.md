---
name: kidscare-solid-modules
description: Use when creating a new domain module in apps/api, when a service file is approaching 200 lines, when adding a controller, or when the agent is about to write a Prisma query outside a repository. Enforces the project module template and SOLID principles concretely.
---

# KidsCare — Module Template and SOLID Application

## The Module Template

Every domain module in `apps/api/src/modules/<domain>/` has this exact layout. No exceptions, no omissions, no extra files at the module root.

```
modules/<domain>/
├── <domain>.module.ts              (NestJS wiring)
├── controllers/
│   └── <domain>.controller.ts
├── services/
│   └── <domain>.service.ts
├── repositories/
│   └── <domain>.repository.ts
├── dto/
│   ├── create-<entity>.dto.ts
│   ├── update-<entity>.dto.ts
│   └── <entity>-response.dto.ts
├── entities/
│   └── <entity>.entity.ts
└── <domain>.spec.ts                (top-level integration / smoke test)
```

If you find yourself adding `helpers/`, `utils/`, `validators/`, or any other top-level directory inside a module, the responsibility belongs in another module or in a service method. Discuss with the user before creating new module subdirectories.

## The Four Layers and What Each Owns

### Controller

- Parses HTTP, validates input shape via DTOs (NestJS `ValidationPipe` with class-validator)
- Calls exactly one service method per endpoint
- Maps service result to response DTO
- Throws or lets service exceptions bubble — no catch-and-rewrite that loses information
- **Never** imports Prisma, a repository directly, or any class from another module's `repositories/`

A controller method longer than ~25 lines is a signal that business logic leaked in. Refactor before merging.

### Service

- Owns domain logic: orchestration, state transitions, cross-entity rules
- Calls repositories (own module's) and other modules' services via injected interfaces
- Does not know HTTP exists — no `Response`, no `Request`, no `@Req()`, no `@Res()`
- Does not know Prisma exists — works against `I<Domain>Repository` interfaces
- If the file is approaching 200 lines, the service is doing too much. Split by responsibility (e.g. `StudentsService` becomes `StudentEnrollmentService` + `StudentProfileService`). The user wants to be told when this happens; do not silently grow the file.

### Repository

- The only place that imports `PrismaClient` or constructs queries against the database
- Exposes methods named after the operations, not the SQL: `findById`, `findManyByTenant`, `insert`, `update`, `softDelete`
- Returns plain Prisma model objects (or entities — see below); the service decides whether to map to a DTO
- Accepts `tenantId` explicitly as the first argument of every method that touches a tenant-scoped table. RLS is the source of truth, but explicit parameter makes the dependency visible in the signature

### DTO / Entity

- **DTO** (`dto/`): wire format — what crosses the HTTP boundary. Uses class-validator decorators. Lives behind the controller.
- **Entity** (`entities/`): domain object — what the service works with. Plain TypeScript class, no decorators, no Prisma annotations. May include computed fields, invariants, factory methods.

A DTO can extend or compose an entity but never the other way around. The dependency direction is HTTP → DTO → Entity → Repository.

## SOLID — Applied Concrete

### Single Responsibility

A service file over 200 lines means two responsibilities. Split by what changes for different reasons: a method that creates a student is not the same responsibility as a method that calculates attendance statistics, even if both read student data.

If you grow a service beyond 200 lines, **stop, tell the user, propose a split**. Do not silently exceed the limit.

### Open/Closed

Adding a new notification channel (email, SMS, push) does not modify `NotificationService`. Add a new handler implementing `INotificationHandler`, register it in the module, and the existing service dispatches polymorphically. The same pattern applies to payment gateways, file storage backends, and any other strategy-shaped concern.

### Liskov Substitution

Anywhere a service receives a repository, it receives the interface, not the implementation. Test doubles implement the same interface. A test that needs to bypass RLS uses a `RawPrismaRepository` that connects with the `kidscare_migrator` role; it satisfies the same interface and is substitutable where RLS is irrelevant (e.g. setup code).

### Interface Segregation

Repositories expose narrow interfaces per use case when the surface area is large. A `StudentsRepository` with 30 methods is a sign to split: `StudentProfileRepository`, `StudentEnrollmentRepository`, `StudentPassportRepository`. Each service depends only on the interface it needs.

### Dependency Inversion

Services depend on `IStudentsRepository`, not on `StudentsRepository`. The concrete class is wired in the module file via NestJS DI tokens. This makes the service unit-testable with an in-memory double and makes it possible to swap the implementation (e.g. for a read replica, a cache layer, or a different storage backend) without touching the service.

For external integrations (payment gateway, file storage, push notifications), the inversion is mandatory — the service depends on the interface, the infrastructure adapter implements it. Mocking an external SDK at the service boundary is not acceptable.

## Module Wiring Example

```ts
// students.module.ts
@Module({
  controllers: [StudentsController],
  providers: [StudentsService, { provide: 'IStudentsRepository', useClass: StudentsRepository }],
})
export class StudentsModule {}
```

```ts
// students.service.ts
@Injectable()
export class StudentsService {
  constructor(@Inject('IStudentsRepository') private readonly repo: IStudentsRepository) {}

  async findOne(tenantId: string, id: string): Promise<Student> {
    const student = await this.repo.findById(tenantId, id);
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }
}
```

The service never imports `StudentsRepository` directly. Tests inject a fake `IStudentsRepository` and assert behaviour without touching the database.

## Cross-Module Communication

`StudentsService` may need data from `EnrollmentsService`. The dependency:

- Is injected via NestJS DI in `StudentsModule`'s `imports`
- Flows through the other module's service, never its repository
- Is declared against an interface (`IEnrollmentsService`) when the consumer needs testability

A module that imports another module's repository has a layering bug. The repositories are not part of any module's public surface.

## What This Skill Does Not Cover

- Tenant guard, RLS, role separation → `kidscare-multi-tenancy`
- Database schema and migrations → `kidscare-prisma-database`
- File naming conventions → `kidscare-naming-rules`
- Test structure → `kidscare-testing`
- Shared types and Zod schemas → `kidscare-shared-packages`
