# Plan 0003 — Docker İmaj ve Build Optimizasyonu

- Spec: `specs/active/0003-docker-production-optimization.md`
- Status: Approved
- Approved by: User

---

## 1. Değişecek veya Eklenecek Dosyalar

1. `.dockerignore` (Yeni dosya):
   - `node_modules`, `.pnpm-store`, `**/node_modules`, `.git`, `.nx`, `dist`, `apps/mobile`, `docs`, `specs`, `coverage`, `*.log` dışlama listesi.
2. `apps/api/Dockerfile` (Güncelleme):
   - Stage 1: `builder` (node:20-alpine, corepack, pnpm install, prisma generate, pnpm prune --prod)
   - Stage 2: `runner` (node:20-alpine, openssl, libc6-compat, pnpm, minimal copy from builder)

---

## 2. Sıralı Uygulama Adımları

1. **Adım 1:** Kök dizinde `.dockerignore` oluşturma.
2. **Adım 2:** `apps/api/Dockerfile` dosyasını multi-stage mimariye geçirme.
3. **Adım 3:** `./scripts/check.ps1` kalite kapısını çalıştırarak hiçbir testin veya tip kontrolünün kırılmadığını doğrulama.
4. **Adım 4:** Değişiklikleri git ile commit etme ve spec'i `specs/done/` dizinine taşıma.
