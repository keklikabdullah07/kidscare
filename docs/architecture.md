# KidsCare Mimari Mimarisi (Architecture)

Bu belge, KidsCare kurumsal kreş ve anaokulu yönetim platformunun çok katmanlı, çok kiracılı (multi-tenant) sistem mimarisini ve bileşenler arası ilişkileri tanımlar.

---

## 1. Sistem Genel Bakışı (Monorepo Mimarisi)

KidsCare, **Nx / pnpm workspaces** tabanlı modern bir monorepo yapısı üzerinde çalışır.

```
KidsCare/
├── apps/
│   ├── api/             # Backend: NestJS 10 + Fastify/Express + Prisma ORM
│   ├── admin-web/       # Web Paneli: React 19 + Vite 5 + TailwindCSS
│   └── mobile/          # Mobil Uygulama: Expo SDK 57 + React Native 0.86
├── packages/
│   ├── shared-types/    # Ortak TypeScript DTO'ları ve modeller
│   ├── shared-schemas/  # Ortak Zod validasyon şemaları
│   ├── tenant-context/  # AsyncLocalStorage tabanlı tenant izolasyon motoru
│   └── database/        # Prisma şeması, PostgreSQL migration'ları ve seed verileri
├── docs/                # Sistem mimarisi, kurallar ve ADR kayıtları
├── specs/               # Aktif, planlanan ve tamamlanan özellik şartnameleri
└── workflows/           # ANEW süreç omurgası (Feature, BugFix, Review, Verify)
```

---

## 2. Katmanlar ve Teknolojiler

### Backend Katmanı (`apps/api`)

- **Framework:** NestJS 10
- **Veri Tabanı Erişimi:** Prisma ORM (PostgreSQL 16)
- **Çalışma Modu:** `tsx watch` ile anlık derleme ve sıcak yeniden başlatma (hot-reload)
- **Kritik Kural:** `tsx watch` altında reflection metadata kaybı yaşandığından, tüm Controller/Service/Repository constructor parametrelerinde **açıkça `@Inject(SınıfAdı)` kullanılır.**

### Web Yönetim Paneli (`apps/admin-web`)

- **Framework:** React 19 + Vite 5 (SPA)
- **Stil & Tasarım:** TailwindCSS v3 + KidsCare Impeccable Design System (İskandinav Adaçayı `#0f766e`, Bal Kehribarı `#f59e0b`, Obsidyen koyu mod `#090D16` / `#131B2E`)
- **İletişim:** Axios tabanlı merkezi API istemcisi, JWT kimlik doğrulama başlığı (`Authorization: Bearer <token>`)

### Mobil Uygulama Katmanı (`apps/mobile`)

- **Framework:** React Native 0.86 + Expo SDK 57
- **Derleme:** EAS Build (Android Standalone APK + iOS IPA)
- **Ağ Yapısı:** `fetch` tabanlı hafif istemci, Android `cleartextTraffic` ve HTTPS desteği

### Ortak Paketler (`packages/`)

- `packages/shared-types`: API, Web ve Mobil arasında tip tutarlılığını sağlar. Asla mükerrer tip tanımlanmaz.
- `packages/shared-schemas`: Form ve API girdi doğrulamaları tek merkezden Zod ile yönetilir.
- `packages/tenant-context`: Her gelen HTTP isteğinde `tenant_id` bilgisini Node.js `AsyncLocalStorage` içine hapseder.
- `packages/database`: Prisma Client üretimi ve migration'lar.

---

## 3. Canlı Altyapı ve Dağıtım (Production Infrastructure)

- **Sunucu:** Dokploy VPS (`212.87.221.101`)
- **Veritabanı:** Docker üzerinde PostgreSQL (Dış port: `5433`, İç port: `5432`) + Redis (`6379`)
- **Alan Adı & Güvenlik:** Cloudflare DNS + Full SSL (`https://kidscare.abdullahkeklik.com`)
- **Ters Vekil (Reverse Proxy):** Nginx
  - Web UI: `https://kidscare.abdullahkeklik.com/` (SPA statik dosyaları)
  - API Gateway: `https://kidscare.abdullahkeklik.com/api/` (NestJS port 3000'e yönlendirilir)

---

## 4. Multi-Tenancy İzolasyon Modeli

KidsCare, SaaS (Software as a Service) mimarisinde **Paylaşımlı Veritabanı, Ayrı Satırlar (Shared Database, Tenant-ID Isolation)** desenini kullanır:

1. Her istekte URL veya JWT üzerinden `tenant_id` çözülür.
2. `TenantGuard` isteği doğrular ve `TenantContext` nesnesini başlatır.
3. Tüm veri tabanı sorguları Repository katmanında `withTenant` ile sarmalanır; `tenant_id` filtresi otomatik enjekte edilir.
4. Bir kreşin kullanıcısı asla başka bir kreşin öğrencisini veya verisini göremez.
