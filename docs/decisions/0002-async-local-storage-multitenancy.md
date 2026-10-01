# ADR 0002: AsyncLocalStorage ile Multi-Tenancy İzolasyonu

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-09-18
- **Karar Vericiler:** Mimari Ekip

---

## Bağlam (Context)

SaaS kreş yönetiminde farklı kreşlerin verilerinin birbirine karışması kabul edilemez bir felakettir. Her fonksiyona elle `tenant_id` parametresi geçmek insan hatasına açıktır.

## Karar (Decision)

Node.js'in yerleşik `AsyncLocalStorage` yeteneğini kullanarak `packages/tenant-context` paketi oluşturulmuştur.

1. HTTP isteği geldiğinde `TenantGuard` kiracıyı tespit eder ve bağlamı başlatır.
2. Repository katmanında `withTenant` fonksiyonu, veritabanı sorgularına otomatik olarak o anki `tenant_id` filtresini ekler.
3. Parametre taşımaya gerek kalmadan iş parçacığı boyunca kiracı kimliği korunur.

## Sonuçlar (Consequences)

- **Olumlu:** Veri tabanı sorgularında `tenant_id` unutma riski ortadan kaldırıldı.
- **Olumsuz:** Arka plan işlerinde (cron/queue) istek bağlamı bulunmadığında `runWithTenant` ile manuel bağlam açılması gerekir.
