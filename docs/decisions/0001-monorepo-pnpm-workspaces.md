# ADR 0001: Monorepo ve pnpm Workspaces Tercihi

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-09-15
- **Karar Vericiler:** Mimari Ekip

---

## Bağlam (Context)

KidsCare projesi hem bir backend API (`apps/api`), hem web yönetim paneli (`apps/admin-web`), hem de mobil uygulama (`apps/mobile`) içerir. Bu uygulamalar arasında DTO'lar, veri tabanı modelleri, Zod validasyon şemaları ve kiracı bağlamı paylaşılmak zorundadır. Ayrı repolar (polyrepo) açmak tip uyumsuzluklarına, senkronizasyon hatalarına ve çifte efora yol açacaktır.

## Karar (Decision)

Tüm sistemin tek bir monorepo altında, **Nx ve pnpm workspaces** kullanılarak yönetilmesine karar verilmiştir. Ortak mantık `packages/` altında 4 pakete bölünmüştür:

1. `packages/shared-types`
2. `packages/shared-schemas`
3. `packages/tenant-context`
4. `packages/database`

## Sonuçlar (Consequences)

- **Olumlu:** Tiplerde tek bir doğruluk kaynağı (Single Source of Truth) sağlandı. Bir DTO değiştiğinde hem backend hem web hem mobil anında TypeScript tarafından kontrol edilir.
- **Olumsuz:** Kök dizinde bağımlılık yönetimi dikkat gerektirir; pnpm workspace protokolü (`workspace:*`) kullanılmalıdır.
