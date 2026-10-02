# 🗺️ KidsCare Ürün ve Mühendislik Yol Haritası (Product Roadmap)

Bu belge, KidsCare platformunun geçmiş, mevcut ve geleceğe yönelik geliştirme fazlarını, mimari hedeflerini ve öncelik sıralamasını tanımlar.

---

## 📍 Faz Genel Bakışı

```
[Faz 1: Web MVP & API] ✅ TAMAMLANDI
        ↓
[Faz 2: Mobil Uygulama & Web V1 Stabilizasyonu & Docker Optimizasyonu] ✅ TAMAMLANDI
        ↓
[Faz 3: Anlık Bildirimler (Push), Medya/Fotoğraf Depolama & Pazarlama Web] 🎯 AKTİF SIRADAKİ FAZ
        ↓
[Faz 4: AI Destekli Pedagojik Karne, Storybook & İleri Analitik] 🚀 GELECEK
```

---

## 📌 Faz 1: Çekirdek Altyapı ve Web MVP (Tamamlandı ✅)

- [x] Monorepo mimarisi (Nx + pnpm workspaces)
- [x] Backend API: NestJS 10, Fastify/Express, Prisma ORM, otomatik testler
- [x] Multi-tenancy: AsyncLocalStorage tabanlı tenant izolasyonu (`tenant-context`)
- [x] Web Yönetim Paneli: React 19 + Vite 5 ile 14 temel yönetim sayfası
- [x] Canlı Dağıtım: Ubuntu VPS + Dokploy + Cloudflare Full SSL + Nginx

---

## 📌 Faz 2: Mobil Uygulama & Web V1 Stabilizasyonu (Tamamlandı ✅)

- [x] Expo SDK 57 + React Native 0.86 mobil altyapısı ve standalone derleme uyumu
- [x] ANEW (AI Native Engineering Workspace) disiplini ve kalite kapıları (`scripts/check.ps1`)
- [x] **Web V1 Kalite Denetimi (`specs/done/0001-web-v1-stabilization-and-audit.md`):**
  - 14 web sayfasının tümünde rol bazlı (Admin, Öğretmen, Veli) akış doğrulaması
  - Boş veri durumlarında beyaz ekrana düşmeyi önleyen savunmacı `<EmptyState>` arayüzleri
  - Modal erişilebilirliği (<kbd>Escape</kbd>, backdrop dismiss, `role="dialog"`)
  - Vite SPA / API Proxy çakışmasının HTML bypass ile çözülmesi
- [x] **Docker & DevOps İmaj Optimizasyonu (`specs/done/0003-docker-production-optimization.md`):**
  - Kök dizine `.dockerignore` eklenmesi (context ve build cache şişmesinin önlenmesi)
  - `apps/api/Dockerfile` multi-stage ve pnpm prune mimarisi (İmaj 1.43 GB'tan ~180 MB'a düşürüldü)
- [x] **Mobil Veli & Öğretmen Temel Akışları (`specs/done/0002-mobile-core-features.md`):**
  - Öğretmen yoklama alma (`check-in`) ve anlık API senkronizasyonu
  - Günlük karne (yemek, uyku, tuvalet, ruh hali) kaydı
  - Velinin çocuğuna ait güncel karne ve menüyü anında okuması (`/parent/children`)
  - KidsCare Impeccable Design renk paleti ve `ErrorBoundary` entegrasyonu

---

## 📌 Faz 3: Anlık Bildirimler, Medya Depolama & Pazarlama (Aktif Sıradaki Faz 🎯)

> **Hedef:** Kullanıcı bağlılığını (engagement) zirveye taşımak, velilere gerçek zamanlı bildirimler sunmak ve kreşlerin sisteme katılımını sağlayacak vitrini oluşturmak.

### 1. 🔔 Anlık Bildirimler (Push Notifications — Expo & FCM)

- [ ] **Token Yönetimi:** Kullanıcı cihaz token'larının veritabanında saklanması (`user_push_tokens` tablosu ve API endpoint'i).
- [ ] **Yoklama Bildirimi:** Öğrenci kreşe geldiğinde veya teslim alındığında veliye anlık bildirim (_"Ada kreşe giriş yaptı ⏰"_ / _"Ada Mehmet Bey tarafından teslim alındı 🚗"_).
- [ ] **Günlük Karne Bildirimi:** Öğretmen karne kaydını tamamladığında veliye uyarı (_"Ada'nın bugünkü karnesi paylaşıldı 🌟"_).
- [ ] **İlaç & Acil Durum:** İlaç saati geldiğinde öğretmene, verildiğinde veliye anlık teyit bildirimi (_"Saat 14:00 antibiyotiği verildi ✓"_).

### 2. 📸 Fotoğraf & Medya Depolama (Cloudflare R2 / S3 / Yerel VPS Depolama)

- [ ] **Medya Yükleme Servisi:** Güvenli, presigned URL veya multipart upload destekli NestJS dosya yükleme modülü.
- [ ] **Görsel Optimizasyonu:** Fotoğrafların web ve mobil için hafif thumbnail (küçük resim) ve optimize WebP formatına dönüştürülmesi.
- [ ] **Aktivite Fotoğraf Akışı:** Öğretmenin mobil kamerayla çektiği günün etkinlik fotoğraflarını anında veli galerisine yükleyebilmesi.

### 3. 🚀 Pazarlama & Karşılama Sitesi (`apps/marketing`)

- [ ] **Modern Landing Page:** Kreş kurucuları ve veliler için KidsCare'in özelliklerini, güvenlik standartlarını ve mobil ekranlarını tanıtan vitrin.
- [ ] **Demo Talep Formu:** Potansiyel kreşlerin tek tıkla demo talep edebileceği veya 14 gün ücretsiz deneme hesabı oluşturabileceği lead toplama altyapısı.
- [ ] **Fiyatlandırma & Paketler:** Öğrenci kapasitesine göre şeffaf fiyatlandırma tablosu.

---

## 📌 Faz 4: AI Pedagojik Asistan, Storybook & İleri Analitik (Gelecek 🚀)

- [ ] **AI Destekli Günlük Karne Hikayeleştirme:** Öğretmenin girdiği kısa notları veliye sıcak, samimi ve pedagojik bir günlük özet paragrafa dönüştüren yerleşik AI asistanı.
- [ ] **Gelişim Portfolyosu & Analitik:** Çocuğun motor, sosyal ve bilişsel gelişim grafiklerinin aylık raporlanması.
- [ ] **Storybook UI Bileşen Atölyesi (`@storybook/react-vite`):** Tüm atom ve molekül bileşenlerin izole görsel test atölyesi.
- [ ] **Admin Erken Uyarı Merkezi:** Devamsızlık riski taşıyan öğrenciler, yaklaşan aşı takvimleri ve aidat ödeme hatırlatıcıları.
