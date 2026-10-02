# Spec 0003 — Docker İmaj ve Build Optimizasyonu (mini)

- Status: Approved
- Mode: lite
- Plan: `specs/plans/0003-docker-production-optimization-plan.md`
- Source: USER-REQUEST-20261002-DOCKER-DISK-BLOAT

## Intent

KidsCare monoreposunun VPS sunucusunda (Dokploy) derlenmesi ve çalıştırılması sırasında oluşan 1.43 GB'lık dev Docker imajı ve her derlemede diski şişiren derleme artıkları kökten çözülecektir. Proje köküne kapsamlı `.dockerignore` eklenecek ve `apps/api/Dockerfile` multi-stage (çok aşamalı) mimariye geçirilerek nihai imaj boyutu ~1.43 GB'tan ~200 MB seviyesine indirilecektir.

## Changed behavior

- [x] CB-1 — Proje köküne `.dockerignore` eklenmeli; `.git`, `.nx`, `.pnpm-store`, `node_modules`, `apps/mobile`, test ve log dosyaları Docker derleme kapsamından (context) çıkarılmalıdır.
- [x] CB-2 — `apps/api/Dockerfile` multi-stage mimariye kavuşturulmalı; derleme aşamasında (builder) devDependencies ve pnpm store budanmalı (`pnpm prune --prod`), runner aşamasına sadece üretim çalışma zamanı aktarılmalıdır.
- [x] CB-3 — Docker imajı içinde Prisma client ve database rollerinin (`db:ensure-roles`, `migrate deploy`) sorunsuz çalışması korunmalıdır.

## Preserved behavior

- [x] PB-1 — `scripts/check.ps1` kalite kapısı (TypeScript + Lint + 55 Test Suite) %100 yeşil kalmalıdır.
- [x] PB-2 — API servisinin çalışma zamanı (`CMD`) komutu ve portu (3000) mevcut davranışını eksiksiz sürdürmelidir.

## Out of scope

- VPS üzerinde harici cron ayarı veya sunucu root erişimi bu değişikliğin dışındadır; çözüm tamamen depo içi Docker optimizasyonu ile sağlanacaktır.

## Definition of Done

- [x] `.dockerignore` oluşturuldu
- [x] `apps/api/Dockerfile` multi-stage olarak optimize edildi
- [x] `scripts/check.ps1` yeşil (55 test suite %100 yeşil)
- [x] Değişiklik commit edilip spec `specs/done/` klasörüne taşındı
