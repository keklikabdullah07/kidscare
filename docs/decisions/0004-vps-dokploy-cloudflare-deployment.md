# ADR 0004: VPS Dokploy ve Cloudflare ile Canlı Dağıtım Mimarisi

- **Durum:** Kabul Edildi (Accepted)
- **Tarih:** 2026-09-28
- **Karar Vericiler:** Mimari & DevOps Ekibi

---

## Bağlam (Context)

KidsCare web paneli ve API servislerinin bağımsız bir bulut sunucusunda (VPS), düşük maliyetle, yüksek performansla ve otomatik dağıtım (CI/CD) yetenekleriyle barındırılması gerekiyordu.

## Karar (Decision)

1. **VPS:** Linux Ubuntu VPS (`212.87.221.101`) üzerinde **Dokploy** PaaS yönetim paneli kuruldu.
2. **Konteynerler:** PostgreSQL (`port 5433:5432`), Redis (`port 6379`), API (`port 3000`) ve Admin Web Nginx konteynerleri çalıştırıldı.
3. **Domain & SSL:** `kidscare.abdullahkeklik.com` alan adı Cloudflare üzerine yönlendirildi; Full (Strict) SSL aktif edildi.
4. **Nginx Yönlendirmesi:** `/` rotası web SPA uygulamasını, `/api/` rotası ise NestJS API Gateway'i karşılayacak şekilde ters vekil (reverse proxy) yapılandırıldı.

## Sonuçlar (Consequences)

- **Olumlu:** Canlı web ve API tek bir güvenli HTTPS alan adı altında sorunsuz çalışır hale getirildi.
- **Olumsuz:** Veritabanı ve Redis yedeklemelerinin Dokploy veya harici cron ile düzenli alınması gerekmektedir.
