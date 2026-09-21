# KidsCare — Claude Code Kuralları (CLAUDE.md)

> **ZORUNLU KURAL:** Projenin tüm mimari anayasası, teknoloji sürümleri, Expo SDK 57 kuralları, NestJS `@Inject` zorunluluğu, multi-tenancy izolasyonu ve yasaklı kalıplar **[AGENTS.md](./AGENTS.md)** dosyasında sabitlenmiştir. Hangi AI modeli veya geliştirici olursa olsun bu kurallardan sapamaz.

## Hızlı Referans & Komutlar

- **Monorepo:** Turborepo / pnpm workspaces (`apps/*`, `packages/*`)
- **Tüm Detaylı Kurallar:** Lütfen geliştirme veya hata düzeltmesi yapmadan önce [AGENTS.md](./AGENTS.md) dosyasını okuyun.
- **Birim Testleri:** `pnpm test`
- **İzolasyon Testleri:** `pnpm test:integration`
- **Tip & Lint:** `pnpm lint`
