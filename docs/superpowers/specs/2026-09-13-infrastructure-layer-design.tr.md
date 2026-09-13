# KidsCare — Altyapı Katmanı Tasarımı

**Tarih:** 2026-09-13
**Durum:** Onaylandı (brainstorming tamamlandı)
**Kapsam:** KidsCare bootstrap planındaki 7 alt-projeden #1
**İlgili:** `../kres-uygulamasi-teknoloji-karar-raporu.md`, `../../CLAUDE.md`

---

## 1. Amaç

Herhangi bir feature modülü inşa edilmeden önce ihtiyaç duyulan monorepo iskeletini, veritabanı katmanını, tenant-izolasyon altyapısını ve minimal app iskeletlerini kurmak. Bu alt-proje tamamlandığında aşağıdakiler uçtan uca çalışır:

- `pnpm install` tüm workspace bağımlılıklarını çözer
- `docker compose up -d` Postgres + Redis'i lokalde başlatır
- `pnpm db:migrate` şemayı Postgres'e uygular
- `pnpm dev:api` NestJS API'sini başlatır; `GET /health` 200 döner
- `pnpm dev:admin`, `pnpm dev:marketing`, `pnpm dev:mobile` ilgili app'leri başlatır
- Bir tenant-izolasyon testi guard + RLS pipeline'ının çalıştığını kanıtlar

Feature modülleri (auth, tenants, students, payments vb.) kapsam dışıdır, ayrı planlanacak.

---

## 2. Kapsam Dışı (Non-Goals)

- Authentication akışı yok (alt-proje #2)
- İş modülleri yok (students, payments, messages, attendance — sonra)
- CI/CD pipeline'ları yok (ilk PR'da eklenecek)
- Production deployment konfigürasyonu yok
- Cloudflare R2, iyzico veya FCM entegrasyonu yok (sonra)
- Admin/marketing/mobile için UI tasarım çalışması yok (yalnızca placeholder)

---

## 3. Mimari Genel Bakış

```
                ┌──────────────────────────────────────────┐
                │              Nx Workspace               │
                │  pnpm + TypeScript strict + ESLint flat │
                └──────────────────────────────────────────┘
                                    │
        ┌───────────────────┬───────┴────────┬─────────────────────┐
        ▼                   ▼                ▼                     ▼
  apps/api (NestJS)   apps/admin-web   apps/marketing        apps/mobile
                                         (Next.js)            (Expo)
        │                   │                │                     │
        └───────────────────┴────────────────┴─────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        packages/database    packages/shared-     packages/shared-
        (Prisma şema +       types (DTO)         schemas (Zod)
         generated client)
                │
                ▼
        docker-compose: postgres:16 + redis:7
                │
                ▼
        Her tenant-scoped tabloda Postgres RLS politikaları
```

**İstek akışı (alt-proje #1 gösterimi):**

1. `GET /health` NestJS'e gelir
2. `TenantContextMiddleware` JWT'yi okur (placeholder — /health için boş), AsyncLocalStorage context'i set eder
3. `TenantGuard` context'i kontrol eder; `/health` için kısa devre yapar
4. Controller `{ status: 'ok' }` döner
5. (Feature modülleri geldiğinde) Repository Prisma'yı çağırır, middleware `SET LOCAL app.tenant_id = '<ctx>'` çalıştırır, RLS politikaları uygular

---

## 4. Dizin Yapısı

```
kidscare/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── health/
│   │   │   │   ├── health.module.ts
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.controller.spec.ts
│   │   │   └── common/
│   │   │       ├── context/
│   │   │       │   ├── tenant-context.service.ts
│   │   │       │   ├── tenant-context.middleware.ts
│   │   │       │   └── tenant-context.module.ts
│   │   │       └── guards/
│   │   │           └── tenant.guard.ts
│   │   ├── project.json (Nx)
│   │   └── tsconfig.json
│   ├── admin-web/
│   │   ├── src/main.tsx
│   │   ├── src/App.tsx
│   │   ├── project.json
│   │   └── tsconfig.json
│   ├── marketing/
│   │   ├── app/page.tsx
│   │   ├── project.json
│   │   └── tsconfig.json
│   └── mobile/
│       ├── app.json (Expo)
│       ├── App.tsx
│       ├── package.json (Expo)
│       └── tsconfig.json
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/      (generated)
│   │   ├── src/
│   │   │   ├── client.ts         (generated client'ı re-export eder)
│   │   │   ├── middleware/
│   │   │   │   └── tenant.middleware.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   ├── tenant-context/           (bu alt-projede yeni — bkz. §7.1)
│   │   ├── src/
│   │   │   ├── tenant-context.ts
│   │   │   ├── run-with-tenant.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── tenant.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   └── shared-schemas/
│       ├── src/
│       │   ├── tenant.schema.ts
│       │   ├── user.schema.ts
│       │   └── index.ts
│       ├── project.json
│       └── package.json
├── docker-compose.yml
├── nx.json
├── package.json (workspace root)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .editorconfig
├── .eslintrc.cjs (veya flat için eslint.config.mjs)
├── .prettierrc
├── .husky/
│   └── pre-commit
└── .lintstagedrc.json
```

---

## 5. Teknoloji Seçimleri (Kararlaştırıldı)

| Konu | Seçim | Neden |
|---|---|---|
| Monorepo aracı | **Nx** | Kullanıcı kararı; Turborepo'dan daha güçlü dependency graph |
| Package manager | **pnpm** | Disk-efficient, native workspace desteği |
| Backend framework | NestJS 10 | CLAUDE.md'de zaten var; modülerlik zorunlu kılınmış |
| Admin panel | React 18 + Vite | CLAUDE.md'de zaten var |
| Marketing | Next.js 14 (app router) | Karar raporunda zaten var |
| Mobil | Expo SDK 51 | Karar raporunda zaten var |
| ORM | Prisma | Karar raporunda zaten var |
| Veritabanı | Postgres 16 | RLS desteği, Öğrenci Pasaportu için JSONB (sonra) |
| Tenant izolasyon | **Postgres RLS + AsyncLocalStorage** | Savunma derinliği |
| Backend testleri | Jest | NestJS default |
| Frontend testleri | Vitest | Native Vite entegrasyonu |
| Lint | ESLint flat config | Nx default + özel kurallar |
| Format | Prettier | Nx default |
| Git hooks | Husky + lint-staged | Pre-commit lint+format |

---

## 6. Veritabanı Şeması (Alt-proje #1)

`packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN          // tenant admin
  TEACHER
  PARENT
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

model Tenant {
  id        String       @id @default(cuid())
  slug      String       @unique
  name      String
  status    TenantStatus @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  users     User[]

  @@map("tenants")
}

model User {
  id           String    @id @default(cuid())
  tenantId     String
  email        String
  passwordHash String
  role         UserRole
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])   // email tenant başına unique
  @@index([tenantId])
  @@map("users")
}
```

**RLS politikaları** (migration SQL ile uygulanır):

```sql
-- tenants: yalnızca session tenant_id ile eşleşen satır görünür
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.tenant_id', true));

-- users: session'daki tenant_id ile kapsanır
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users
  USING ("tenantId" = current_setting('app.tenant_id', true));
```

`FORCE ROW LEVEL SECURITY` zorunludur — RLS'nin tablo sahibine de uygulanmasını sağlar. Yoksa migrator rolü tüm politikaları bypass eder ve yanlış yapılandırılmış bir bağlantı veri sızdırır.

**Postgres rol ayrımı** (`docker-compose.yml` init script `init/01-roles.sql` ile uygulanır):

Üç rol, her biri minimum yetkiyle:

- `kidscare_migrator` — şemanın sahibi; **yalnızca** `prisma migrate` ve `prisma db push` tarafından kullanılır. DDL yapabilir, tüm satırlarda CRUD yapabilir. `DATABASE_URL` ile bağlanır.
- `kidscare_app` — normal uygulama rolü. Tüm tenant-scoped tablolarda `SELECT/INSERT/UPDATE/DELETE` yetkisi verilir. `FORCE RLS`'e tabidir. `DATABASE_APP_URL` ile bağlanır.
- `kidscare_auth_lookup` — yalnızca login rolü. `users` ve `tenants` tablolarının **yalnızca belirli sütunlarında** `SELECT` yetkisi (bkz. §7.5). `FORCE RLS`'e tabidir. `DATABASE_AUTH_LOOKUP_URL` ile bağlanır.

Runtime uygulama `DATABASE_APP_URL` ile bağlanır. Migration araçları `DATABASE_URL` ile. Login yalnızca `DATABASE_AUTH_LOOKUP_URL` kullanır. Hiçbir role `BYPASSRLS` verilmez.

Not: `tenants` tablosunun kendisinin tenant-scoped olması alışılmadık ama burada uygun — bir tenant'ın kendi satırı admin'lerine görünür, diğer tenant'lar görünmez. Slug ile tenant global araması (login için) özel `kidscare_auth_lookup` rolü üzerinden yapılır (§7.5).

**Seed verisi** (`packages/database/prisma/seed.ts`):

- 1 demo tenant: `slug=demo`, `name=Demo Kreş`
- 1 admin kullanıcı: `email=admin@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=ADMIN`
- 1 teacher kullanıcı: `email=teacher@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=TEACHER`

---

## 7. Tenant Guard Altyapısı

### 7.1 AsyncLocalStorage context

`packages/database` NestJS'e bağımlı olamaz, bu yüzden AsyncLocalStorage primitive'i `apps/api/src/common/context/tenant-context.service.ts` içinde değil, **`packages/tenant-context`** paketinde yaşar; hem middleware hem Prisma middleware'i buradan tüketir.

İki seçenek değerlendirildi:

- **Seçenek A (tercih edilen):** `@kidscare/tenant-context` paketi tanımla, `TenantContext` (AsyncLocalStorage wrapper) export et. `apps/api` ve `packages/database` ikisi de buna bağımlı olur. Hafif, framework-agnostic.
- **Seçenek B:** AsyncLocalStorage'ı `packages/database` içinde tanımla, `apps/api` oradan import etsin. DB paketini API kalıplarına bağlar.

**Seçenek A** seçildi — temiz katmanlama için.

```
packages/tenant-context/        (yeni paket, minimal)
├── src/
│   ├── tenant-context.ts        (AsyncLocalStorage<TenantContextValue>)
│   ├── run-with-tenant.ts       (callback'u sarmalayan helper)
│   └── index.ts
├── project.json
├── package.json
└── tsconfig.json
```

`TenantContextValue`:
```ts
export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
} | null;
```

### 7.2 NestJS middleware

`apps/api/src/common/context/tenant-context.middleware.ts`:

- `Authorization: Bearer <jwt>` başlığını okur (alt-proje #1 için placeholder — dev'de `x-tenant-id` + `x-user-id` başlıklarına izin var, `NODE_ENV !== 'production'` ile gated)
- `{ tenantId, userId, role }` parse eder
- `tenantContext.run(value, () => next())` çağırır

`apps/api/src/common/guards/tenant.guard.ts`:

- Tenant-scoped controller'larda `@UseGuards(TenantGuard)` ile kullanılır (CLAUDE.md §5 uyarınca zorunlu)
- Context yoksa `ForbiddenException` fırlatır
- `@Public()` decorator varsa atlar (`/health` için kullanılır)

### 7.3 Prisma middleware

`packages/database/src/middleware/tenant.middleware.ts`:

- `withTenantContext(prisma, ctx)` export eder — bir Prisma client'ı sarar; her sorgu önce `SET LOCAL app.tenant_id = '<ctx.tenantId>'` çalıştıran bir transaction içinde yürür
- Prisma'nın `$extends` API'sini kullanır (Prisma 4.16+) — tip güvenliği için
- Base `prisma` export'u raw client olarak kalır — yalnızca migration araçları ve seed script'leri için. Runtime bu client'ı kullanmaz (uzantılı kullanır). Login bu client'tan geçmez; `DATABASE_AUTH_LOOKUP_URL`'e bağlı kendi özel `PrismaClient`'ını inşa eder (§7.5).

### 7.4 İstek yaşam döngüsü

```
HTTP isteği
   │
   ▼
TenantContextMiddleware
   │  başlıkları parse → ctx
   │  tenantContext.run(ctx, () => next())
   ▼
TenantGuard (tenant-scoped route'larda)
   │  ctx var mı? devam : 403
   ▼
Controller
   │  PrismaService inject edilir
   │  prisma.$extends(withTenantContext(ctx))
   ▼
Prisma sorgusu
   │  middleware tx açar, SET LOCAL app.tenant_id, sorguyu çalıştırır
   ▼
Postgres
   │  RLS policy current_setting('app.tenant_id') ile değerlendirir
   │  policy eşleşen satırları döner
   ▼
Yanıt
```

### 7.5 Auth Lookup Bağlantısı

Login, tenantlar arası email ile kullanıcı araması gerektirir (istek henüz tenant id taşımaz). Bu arama `kidscare_app` üzerinden yapılamaz çünkü `kidscare_app` `SET LOCAL app.tenant_id` ile tek bir tenant'a kapsanır ve denese bile cross-tenant satır bulamaz. `kidscare_migrator` üzerinden de yapılamaz çünkü tam DDL erişimi var ve yalnızca migration'lar için tasarlandı.

Bunun yerine login üçüncü bir rol kullanır: `kidscare_auth_lookup`.

**Rol tanımı** (`init/01-roles.sql` içinde):

```sql
CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD :'AUTH_LOOKUP_PASSWORD';
GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
GRANT USAGE ON SCHEMA public TO kidscare_auth_lookup;

-- login için gereken minimum üzerinde sütun-düzeyinde SELECT
GRANT SELECT (id, "tenantId", email, "passwordHash") ON TABLE users TO kidscare_auth_lookup;
GRANT SELECT (id, slug) ON TABLE tenants TO kidscare_auth_lookup;

-- açıkça INSERT/UPDATE/DELETE/REFERENCES/TRUNCATE yok
-- açıkça TRIGGER, RULE, sahiplik yok
```

**Bağlantı string'i** (`DATABASE_AUTH_LOOKUP_URL`) yalnızca `process.env` üzerinden açılır ve **münhasıran** `apps/api/src/modules/auth/login.handler.ts` içinde okunur (alt-proje #2 bu dosyayı oluşturacak). Başka hiçbir modül tarafından import edilmez.

**CLAUDE.md kuralı** (alt-proje #2'nin spec'inde eklenecek, birinci günden itibaren uygulanır):

> `DATABASE_AUTH_LOOKUP_URL` yalnızca auth modülünün login handler'ı içinde `process.env`'den okunabilir. Bunun dışındaki herhangi bir import, referans veya kullanım — auth modülü dışındaki testler dahil — güvenlik ihlalidir ve code review'da reddedilmelidir.

**Login akışı** (önizleme — tam tasarım alt-proje #2'de):

```
POST /auth/login { email, password }
   │
   ▼
login.handler DATABASE_AUTH_LOOKUP_URL okur
   │  o URL'ye bağlı özel bir PrismaClient açar
   │  SELECT id, "tenantId", email, "passwordHash" FROM users WHERE email = $1
   │  password hash doğrula (bcrypt) — constant-time karşılaştırma, fail-fast
   │  başarı: JWT_SECRET ile imzalı, tenantId'ye kapsamlı JWT üret
   │  başarısızlık: generic 401 (user enumeration yok)
   ▼
Yanıt: { token, tenantId, role }
```

Özel `PrismaClient` handler içinde inşa edilir, tek sorgu için kullanılır ve hemen kapatılır. Ana uygulama client'ıyla bağlantı havuzunu paylaşmaz.

**Neden `BYPASSRLS` değil?** `BYPASSRLS` rolü her şeyi okuyabilir. `kidscare_auth_lookup` belirli tabloların belirli sütunlarına kilitlidir — ele geçirilse bile tüm kullanıcıları enumerate edemez, başka tablolara pivot yapamaz.

---

## 8. App İskeletleri

### apps/api (NestJS)

- `AppModule` importları: `ConfigModule`, `HealthModule`, `TenantContextModule`, `PrismaModule`
- `PrismaModule` (global) `PrismaClient`'ı extend eden `PrismaService` sağlar. Runtime'ın migrator rolüyle bağlanmaması için `DATABASE_APP_URL` (değil `DATABASE_URL`) okuyacak şekilde yapılandırılır.
- `HealthModule` `@Public()` decorator'lı `HealthController` export eder
- `main.ts`: middleware'i global olarak kaydetmek için `app.use(...)`, `process.env.PORT ?? 3000` üzerinde dinle
- CORS: `http://localhost:5173` (admin-web) ve marketing portu için yapılandırılır

### apps/admin-web (Vite + React)

- Vite scaffold (template yok — bare React + TS)
- Route'lar: `/` → landing placeholder, gelecek route'lar burada
- TanStack Query provider bağlı
- Tema: alt-proje #1 için yalnızca light; design token'lar sonra

### apps/marketing (Next.js)

- App Router scaffold
- `/` → `<h1>KidsCare</h1>` ve bir paragraf içeren placeholder landing

### apps/mobile (Expo)

- `expo-template-blank-typescript` tabanı
- `<Text>KidsCare</Text>` içeren tek ekran
- TypeScript yapılandırılmış

---

## 9. Tooling Konfigürasyonu

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@kidscare/shared-types": ["packages/shared-types/src"],
      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
      "@kidscare/database": ["packages/database/src"],
      "@kidscare/tenant-context": ["packages/tenant-context/src"]
    }
  }
}
```

### ESLint

- `@nx/eslint-plugin`
- `@typescript-eslint/recommended-type-checked`
- Özel kural: `no-explicit-any: error`
- Test dosyaları: `no-explicit-any` `warn`'a gevşetilir

### Prettier

- Nx default'ları; `.prisma` dosyaları için override (string default'larda tırnak yok)

### Husky + lint-staged

- Pre-commit: `pnpm exec nx format:write --files=<staged>` + `pnpm exec nx lint --files=<staged>`

---

## 10. Test Stratejisi

### Backend (Jest)

- **Unit:** Her service, repository, middleware, guard'a yan yana `.spec.ts`
- **Integration:** `apps/api/test/tenant-isolation.spec.ts` test Postgres'ini ayağa kaldırır, iki tenant seed'ler ve kanıtlar:
  - Tenant A kullanıcısı `users` sorguladığında yalnızca Tenant A'nın user'larını görür
  - Tenant B kullanıcısı `users` sorguladığında yalnızca Tenant B'nın user'larını görür
  - Cross-tenant sorgu boş döner
- Testler ayrı bir `DATABASE_URL` (özel schema) karşısında çalışır; her test öncesi tablolar truncate edilir

### Frontend (Vitest)

- `apps/admin-web` içinde Vitest scaffold
- İlk test: `App.test.tsx` — hatasız render

### E2E (ertelendi)

- Bu alt-projede yok; ilk E2E auth ile gelecek

### Coverage

- Alt-proje #1'de minimum eşik yok; baseline coverage raporu CI'da sonra etkinleştirilecek

---

## 11. Ortam ve Secret'lar

`.env.example` (commit edilir):

```
# Migration rolü — şema sahibi, yalnızca prisma migrate / db push kullanır
DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public

# Normal uygulama rolü — NestJS runtime'ı kullanır
DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public

# Yalnızca login rolü — auth modülünün login handler'ı okur (bkz. §7.5)
DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public

REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-me
NODE_ENV=development
PORT=3000
```

Yukarıdaki rol şifreleri lokal dev için placeholder. Gerçek şifreler `docker-compose.yml`'in init script'inden (`init/01-roles.sql`) gelir — Compose-only `secrets` dosyasından okunur, `.env`'den değil.

**Prisma, `DATABASE_URL` kullanır** (migrator rolü) — `prisma migrate` ve `prisma generate` için. NestJS runtime'ı `DATABASE_APP_URL` okur (`PrismaModule` konfigürasyonu için bkz. §8).

`.env` (gitignore, yalnızca dev) — init script ile eşleşen gerçek lokal değerlerle `.env.example`'ın kopyası.

Bu alt-projede production secret yok.

---

## 12. Kabul Kriterleri

Alt-proje, aşağıdakilerin **tümü** doğru olduğunda tamamlanmış sayılır:

1. `pnpm install` hatasız tamamlanır
2. `docker compose up -d` Postgres + Redis'i başlatır; `docker compose ps` her ikisini de healthy gösterir
3. `pnpm db:migrate` RLS politikaları dahil ilk migration'ı uygular
4. `pnpm db:seed` demo tenant ve iki kullanıcı oluşturur
5. `pnpm dev:api` NestJS'i başlatır; `curl http://localhost:3000/health` `{"status":"ok"}` döner
6. `pnpm dev:admin` `http://localhost:5173`'te admin landing placeholder'ını render eder
7. `pnpm dev:marketing` marketing landing'i render eder
8. `pnpm dev:mobile` Expo'yu başlatır ve placeholder ekranı Expo Go'da görüntüler
9. `pnpm test` tüm backend + frontend testlerini yeşil çalıştırır
10. `pnpm test:integration` tenant-izolasyon integration testini yeşil çalıştırır
11. `pnpm lint` hatasız geçer
12. CLAUDE.md modül şablonu eklenen modül-şekilli kodda korunur (prematüre modül yok)

---

## 13. Riskler ve Açık Sorular

| # | Risk / Soru | Önlem |
|---|---|---|
| 1 | Windows'ta Docker Desktop çalışmıyor | README'de fallback dokümante edilir; Docker yoksa kullanıcı native `pg_ctl` kullanabilir |
| 2 | Nx + Expo interop tuhaflıkları | `apps/mobile` için Expo'nun standalone `package.json`'ı kullanılır (Nx project.json değil); Nx yalnızca dependency graph'ı sahiplenir, build'i değil |
| 3 | Paketler arası Prisma client generation | `output` deterministik bir path'e pinlenir; generated dosyalar için `.gitignore` kuralı **kullanılmaz** — build reproducibility için generated client commit edilir |
| 4 | Login akışı cross-tenant aramaya ihtiyaç duyar | Login, `DATABASE_AUTH_LOOKUP_URL`'e bağlı kendine özel `PrismaClient` inşa eder (bkz. §7.5); `kidscare_auth_lookup` rolü `users` ve `tenants` üzerinde sütun-düzeyinde `SELECT` ile sınırlandırılmıştır — `BYPASSRLS` yok, başka tabloya erişim yok |
| 5 | Windows'ta Husky | Windows desteği olan Husky 9 kullanılır; `corepack enable` gereksinimi dokümante edilir |

---

## 14. Kapsam Dışı (Onaylandı)

- Auth akışı (login, register, JWT üretimi, refresh) — alt-proje #2
- Tenant CRUD endpoint'leri — alt-proje #3
- Students / Öğrenci Pasaportu — alt-proje #4
- Admin panel gerçek ekranları — alt-proje #5
- Mobil gerçek ekranlar — alt-proje #6
- Marketing site gerçek içeriği — alt-proje #7
- CI/CD, observability, deployment — gelecek

---

## 15. Referanslar

- `CLAUDE.md` — modül şablonu, isimlendirme, SOLID, tenant kuralları
- `kres-uygulamasi-teknoloji-karar-raporu.md` — stack kararları
- Prisma `$extends` docs (RLS kalıbı)
- NestJS `AsyncLocalStorage` middleware entegrasyonu
- Postgres RLS docs
