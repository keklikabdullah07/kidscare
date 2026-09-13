# KidsCare

Çoklu kreşe satılabilir multi-tenant SaaS. Mimari kararlar: `kres-uygulamasi-teknoloji-karar-raporu.md`. Proje kuralları: `CLAUDE.md`. Sub-project #1 (altyapı) tasarımı: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`.

## Gereksinimler

- Node 20 LTS
- pnpm 9+
- Docker Desktop (Windows: WSL2 backend önerilir)

## Yerel geliştirme

```bash
pnpm install
pnpm db:up                  # Postgres + Redis ayağa kalkar
cp .env.example .env        # gerekirse düzenle
pnpm db:migrate             # tabloları ve RLS politikalarını uygular
pnpm db:seed                # demo tenant + 2 kullanıcı
pnpm dev:api                # NestJS API (port 3000)
pnpm dev:admin              # admin paneli (port 5173)
pnpm dev:marketing          # pazarlama sitesi (port 3001)
pnpm dev:mobile             # Expo (QR kod ile telefondan açılır)
```

## Test

```bash
pnpm test                   # tüm birim testleri
pnpm test:integration       # tenant izolasyon integration testi
pnpm lint                   # ESLint
```

## Mimari notlar

- Üç Postgres rolü vardır: `kidscare_migrator` (DDL), `kidscare_app` (uygulama runtime), `kidscare_auth_lookup` (yalnızca login). `DATABASE_AUTH_LOOKUP_URL`'i yalnızca auth modülünün login handler'ı okuyabilir.
- Tenant izolasyonu Postgres RLS + AsyncLocalStorage + Prisma middleware ile uygulanır. Üç katman birlikte çalışır; biri tek başına yeterli değildir.
- Migration'lar atomiktir: yeni tenant-scoped tablo, RLS politikası ve `GRANT` aynı SQL dosyasında bulunur.
