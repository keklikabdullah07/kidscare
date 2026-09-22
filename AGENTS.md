# KidsCare — Evrensel Agent & Geliştirici Kuralları (AGENTS.md)

> **DİKKAT (TÜM YAPAY ZEKA MODELLERİ VE AJANLAR İÇİN KESİN KURAL):**
> Bu dosya projenin anayasasıdır. Hangi yapay zeka veya geliştirici çalışırsa çalışsın, bu dosyadaki mimari kurallardan, teknoloji sürümlerinden ve çalışma mantığından **ASLA sapamaz ve kafasına göre değiştiremez.**

---

## 1. Teknoloji Yığını ve Güncel Sürümler

- **Monorepo:** Nx / pnpm workspaces (`/apps` ve `/packages`).
- **Backend (`apps/api`):** NestJS 10 + Fastify/Express + `tsx watch` + Prisma ORM.
- **Veri Tabanı:** PostgreSQL (Docker `kidscare-postgres` port 5433) + Redis (port 6379).
- **Web Paneli (`apps/admin-web`):** React 19 + Vite 5 + TailwindCSS.
- **Ortak Paketler:**
  - `packages/shared-types`: Tüm DTO ve TypeScript modelleri tek merkezdedir.
  - `packages/shared-schemas`: Zod validasyon şemaları.
  - `packages/tenant-context`: AsyncLocalStorage bazlı tenant context.
  - `packages/database`: Prisma schema ve migration'lar.

---

## 2. Değiştirilemez Mimari ve Rol Kuralları

### Rol Kapsamı

Sistemde şu roller bulunur:

1. `SUPERADMIN` — Çoklu kreş yönetimi, sistem genel bakış.
2. `ADMIN` — Kreş kurucusu / müdürü.
3. `TEACHER` — Sınıf öğretmeni (yoklama alma, günlük karne doldurma).
4. `PARENT` — Veli (öğrencinin yoklama, karne, yemek ve gelişim takibi).

**KURAL:** Tüm roller Web (`apps/admin-web`) arayüzünde desteklenmelidir.

### Multi-Tenancy İzolasyonu

- Her tabloda `tenant_id` kolonu zorunludur (global tablolar hariç).
- Repository katmanında `withTenant` veya `runWithTenant` kullanılır.
- `@UseGuards(TenantGuard)` tenant-scoped endpoint'lerde zorunludur.

---

## 3. NestJS + `tsx` İçin Hayati Kural (Dependency Injection)

`apps/api` `tsx watch` altında çalışırken TypeScript metadata'sı (reflect-metadata) parametre tiplerini otomatik vermez. Bu nedenle:

> **ZORUNLU KURAL:** Tüm Controller, Service, Guard, Middleware ve Repository sınıflarının `constructor` parametrelerinde **açıkça `@Inject(SınıfAdı)` kullanılmalıdır.**

```ts
// DOĞRU:
constructor(
  @Inject(StudentsRepository) private readonly studentsRepository: StudentsRepository,
  @Inject(PrismaService) private readonly prisma: PrismaService,
  @Inject(Reflector) private readonly reflector: Reflector,
) {}

// YANLIŞ (Runtime'da undefined hatası verir):
constructor(private readonly prisma: PrismaService) {}
```

---

## 4. Web-Only Geliştirme Kuralı

> **ZORUNLU KURAL:** Bu proje **sadece web paneli** (`apps/admin-web`) odaklıdır. Mobil uygulama (`apps/mobile`) ile ilgili **hiçbir şekilde** çalışma yapılmayacaktır.

**Geliştirme Kapsamı:**
- ✅ Backend API geliştirme ve test
- ✅ Web paneli geliştirme (tam feature + UI + test)
- ❌ Mobil uygulama geliştirme (kesinlikle YASAK)
- ❌ Mobil uygulama testleri (kesinlikle YASAK)
- ❌ Mobil uygulama kod değişiklikleri (kesinlikle YASAK)

**Neden Web-Only?**
- Bu proje web yönetim paneli odaklıdır
- Mobil uygulama farklı bir proje olarak ele alınmalı
- Web paneli tamamlanmadan mobil'e geçilmeyecek
- Mobil uygulama ihtiyacı olduğunda ayrı proje başlatılacak

---

## 5. Test ve Geliştirme Bilgileri

Varsayılan Seed Kullanıcıları:

- **Kreş Slug:** `demo` (Demo Kreş)
- **Süper Admin:** `superadmin@demo.test` / `demo1234`
- **Admin:** `admin@demo.test` / `demo1234`
- **Öğretmen:** `teacher@demo.test` / `demo1234`
- **Veli:** `parent@demo.test` / `demo1234` (Öğrenci: Ada Yılmaz)

---

## 6. Yasaklı Hareketler

- ❌ Asla `any` tipi kullanmayın.
- ❌ Asla aynı DTO veya tipi `shared-types` dışına kopyalayıp mükerrer tanımlamayın.
- ❌ Asla Controller içinde doğrudan Prisma sorgusu yazmayın (Repository üzerinden geçilmelidir).
- ❌ Asla mobil uygulama (`apps/mobile`) üzerinde çalışmayın (Web-Only kuralı).
