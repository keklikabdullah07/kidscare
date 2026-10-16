# 🗺️ KidsCare Ürün ve Mühendislik Yol Haritası (Product Roadmap)

Bu belge, KidsCare platformunun geçmiş, mevcut ve geleceğe yönelik geliştirme fazlarını, mimari kararlarını ve öncelik sıralamasını tanımlar.

---

## 🧭 Ana Strateji: Önce Web (%100 Ticari & Operasyonel Yetkinlik), Sonra Mobil

Tek kişilik geliştirici disiplininde iki cephede birden (Web + Mobil) değişen API sözleşmeleriyle boğuşmamak için **"Önce Web + API tam olgunluğa ulaştırılır, canlıya çıkabilir ve kreşlere satılabilir hale getirilir; ardından Mobil uygulama bu stabil API'lerin üzerine inşa edilir"** stratejisi benimsenmiştir.

---

## 📍 Faz Genel Bakışı

```
[Faz 1: Web MVP & Çekirdek API] ✅ TAMAMLANDI
        ↓
[Faz 2: Web V1 Stabilizasyonu, Dokunsal Tasarım & Docker Optimizasyonu] ✅ TAMAMLANDI (Spec 0001 - 0039)
        ↓
[Faz 3: Gezi/İzin Merkezi & Öğrenci/Sınıf Senkronizasyonu] ✅ TAMAMLANDI (Spec 0040 - 0042)
        ↓
[Faz 3.5: Web Ticari & Operasyonel Tamamlama] 🎯 AKTİF ÇALIŞILAN FAZ
   ├── 💰 Spec 0043: Aidat, Tahsilat & Borç Takip Modülü (/finance) ✅ TAMAMLANDI
   ├── 📄 Spec 0044: PDF Belge Motoru (Dönem Sonu Karnesi & MEB Yoklama Çizelgesi) ✅ TAMAMLANDI
   ├── ☁️ Spec 0045: Gerçek Bulut Depolama (Cloudflare R2 / AWS S3 Sürücüsü) ⏳ SIRADAKİ
   ├── 🔑 Spec 0046: Şifremi Unuttum & E-posta Servisi (Resend / SMTP)
   └── 🌐 Spec 0047: Landing Page Demo Formunun Canlıya Bağlanması
        ↓
[Faz 4: Mobil Uygulama (Expo SDK 57) Eşitleme & Canlı Bildirimler] 📱 GELECEK
   ├── 🔔 expo-notifications & Gerçek APNS/FCM Push Token Kaydı
   ├── 📅 Veli Dijital Mazeret Bildirimi & Gezi Onay Formları (Mobilde Eşitleme)
   ├── 👑 Yönetici (Admin) Mobil Dashboard Deneyimi
   └── 🧪 Mobil Test Altyapısı (Vitest + React Native Testing Library)
        ↓
[Faz 5: İleri Kreş Operasyonları & AI Destekli Özellikler] 🚀 V2
   ├── 🚌 Servis & Güzergah / Hostes Takip Modülü
   ├── 🤖 AI Destekli Pedagojik Karne Özeti & Hikayeleştirme
   ├── ⏰ Personel Nöbet & Vardiya Çizelgesi
   └── 💬 Gerçek Zamanlı Mesajlaşma (WebSocket / SSE)
```

---

## 📌 Tamamlanan Fazlar

### ✅ Faz 1: Çekirdek Altyapı ve Web MVP

- Monorepo mimarisi (Nx + pnpm workspaces).
- Backend API: NestJS 10, Fastify/Express, Prisma ORM, PostgreSQL + Redis.
- Multi-tenancy: `AsyncLocalStorage` tabanlı tenant izolasyonu (`tenant-context`).
- Web Yönetim Paneli: React 19 + Vite 5 ile temel yönetim sayfaları.
- Canlı Dağıtım: Ubuntu VPS + Dokploy + Cloudflare Full SSL.

### ✅ Faz 2: Web V1 Stabilizasyonu & Dokunsal Tasarım (Spec 0001 - 0039)

- Dokunsal (claymorphic) tasarım sistemi ve 3D buton standardı (`<TactileButton />`, `<TactileTabs />`).
- 14 web sayfasının tümünde rol bazlı (Admin, Öğretmen, Veli) yetkilendirme.
- Savunmacı UI ve `<EmptyState>` arayüzleri.
- Akıllı alerjen eşleştirici (`AllergenMatcher`) ve reaktif karne uyarıları.
- Docker imaj optimizasyonu (Multi-stage build ile imaj boyutu ~180 MB'a düşürüldü).
- Google E-Tablo QA entegrasyonu (28 test maddesinin tamamı çözüldü).

### ✅ Faz 3: Etkinlikler, İzinler & Sınıf Yönetimi (Spec 0040 - 0042)

- **Spec 0040:** Veli dijital mazeret bildirimi (`AttendanceExcuse`) & etkinlik izinleri (`EventConsent`).
- **Spec 0041:** 3 rol için kapsamlı `/events` yönetim merkezi (Dış Geziler, Okul İçi Etkinlikler, Genel İzinler).
- **Spec 0042:** Sınıf açılışında sorumlu öğretmen ataması ve öğrenci-sınıf anlık reaktif senkronizasyonu.
- Google E-Tablo'ya 29. satır olarak yeni özellik kaydı işlendi.

---

## 📌 Faz 3.5: Web Ticari & Operasyonel Tamamlama (Aktif Yol Haritası 🎯)

> **Amaç:** Web panelini bir kreş kurucusuna sunulduğunda _"Bu yazılım kreşimin tüm operasyonunu ve paramı yönetir"_ dedirtecek eksiksiz ticari seviyeye getirmek.

### 1. 💰 Spec 0043: Aidat, Tahsilat & Borç Takip Modülü (`/finance`)

- **Öğrenci Ücret Planı:** Aylık eğitim aidatı, servis/yemek ek ücretleri, kardeş indirimi, ödeme günü (vade).
- **Aylık Otomatik Tahakkuk:** Her ay başında öğrenciye borç kaydı oluşturulması.
- **Hızlı Tahsilat Girişi:** Nakit, Havale/EFT veya Kredi Kartı ile tek tıkla tahsilat ve durumun `PAID` olması.
- **Gecikenler & Hatırlatma Paneli:** Vadesi geçmiş aidatların kırmızı rozetle listelenmesi, veliye tek tıkla nazik hatırlatma bildirimi gönderilmesi.
- **Veli Portalı:** Velinin kendi çocuğunun aidat ve ödeme geçmişini şeffaf görmesi.

### 2. 📄 Spec 0044: PDF Belge Motoru & Resmi Çıktılar

- **Dönem Sonu Pedagojik Karnesi:** Fotoğraflı, boy/kilo ve gelişim grafikli, öğretmen notlu A4 renkli karne PDF çıktısı.
- **MEB Aylık Yoklama Çizelgesi:** Müfettiş teftişine hazır resmi sınıf yoklama listesi dökümü.
- **Sağlık & Acil Durum Kapı Kartı:** Sınıf kapısına veya gezi dosyasına asılacak acil iletişim/alerji kartı.

### 3. ☁️ Spec 0045: Gerçek Bulut Depolama (Cloudflare R2 / AWS S3)

- `s3-storage.driver.ts` sahte (stub) sürücüsünün `@aws-sdk/client-s3` ile gerçek Cloudflare R2'ye bağlanması.
- Galeri ve portfolyo fotoğraflarının sunucu diskini şişirmesinin kesin olarak engellenmesi (VPS "İyi Misafir Protokolü").

### 4. 🔑 Spec 0046: Şifremi Unuttum & E-posta Servisi (Resend / SMTP)

- Web giriş ekranına _"Şifremi Unuttum"_ akışı.
- Tek kullanımlık güvenli token ile e-posta üzerinden şifre sıfırlama.

### 5. 🌐 Spec 0047: Landing Page Demo Formunun Canlıya Bağlanması

- `apps/marketing` altındaki demo talep formunun simülasyondan çıkarılıp veritabanına ve yöneticiye bildirim gönderecek gerçek API'ye bağlanması.

---

## 📌 Faz 4: Mobil Eşitleme & Sektörel Kreş Modülleri (Saha Gücü 📱)

> Web altyapısı tamamlandıktan sonra hem mobil eşitleme hem de sahada fark yaratacak kritik kreş operasyonları devreye alınacaktır.  
> 🔗 Detaylı sektör analizi ve gerekçeler için: [`docs/SECTOR_BENCHMARK_AND_GAP_ANALYSIS.md`](./SECTOR_BENCHMARK_AND_GAP_ANALYSIS.md)

- [ ] **Push Bildirim Altyapısı:** `expo-notifications` kurulumu, APNS/FCM cihaz token kaydı ve arka plan dinleyicisi.
- [ ] **Spec 0048 (İhtiyaç & Sarf Bildirimi):** Bez, ıslak mendil, yedek kıyafet azaldı/bitti tek tıkla veli bilgilendirme motoru.
- [ ] **Spec 0049 (Nöbetçi Öğretmen / Karşılama Modu):** Sabah 07:30 - 09:00 kapı karşılama ve akşam geç teslimat için sınıf kilitsiz personel modu.
- [ ] **Spec 0050 (Dijital Sözleşme & KVKK Açık Rıza):** Kayıt sözleşmesi, KVKK ve fotoğraf izinlerinin veli portalından dijital onayı.
- [ ] **Veli Mobil Mazeret & İzin Ekranları:** Spec 0040 ve 0041 özelliklerinin mobile taşınması (Sabah _"Gelemeyeceğimizi Bildir"_ butonu, gezi onayları).
- [ ] **Yönetici (Admin) Mobil Ekranı:** Müdürün mobilden girdiğinde kreş KPI'larını ve aidat özetini göreceği özel arayüz.

---

## 📌 Faz 5: İleri Seviye Operasyonlar (V2 Gelecek 🚀)

- [ ] **Spec 0051 (Servis & Güvenli Taşıma Takibi):** Şoför/hostes için tek tıkla bindi/indi/teslim edildi butonları ve veli anlık anksiyete önleyici bildirimler.
- [ ] **Aşı Takvimi & Doktor Muayene Raporu:** İl Sağlık ve MEB denetimine hazır sağlık arşivi.
- [ ] **AI Destekli Günlük Karne Özeti:** Öğretmenin notlarını sıcak ve samimi pedagojik paragrafa dönüştüren yerleşik AI asistanı.
- [ ] **Gerçek Zamanlı Sohbet:** Mesajlaşmanın HTTP polling'den WebSocket / SSE mimarisine taşınması.
