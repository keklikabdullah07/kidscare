# 🗺️ KidsCare Ürün ve Mühendislik Yol Haritası (Product Roadmap)

Bu belge, KidsCare platformunun geçmiş, mevcut ve geleceğe yönelik geliştirme fazlarını, mimari hedeflerini ve öncelik sıralamasını tanımlar.

---

## 📍 Faz Genel Bakışı

```
[Faz 1: Web MVP & API] ✅ TAMAMLANDI
        ↓
[Faz 2: Mobil APK & Web V1 Stabilizasyonu] ⏳ AKTİF AŞAMA
        ↓
[Faz 3: Impeccable Design System & Storybook UI Atölyesi] 🎯 PLANLANDI
        ↓
[Faz 4: Gelişmiş Özellikler, Push Bildirimleri & AI Analitik] 🚀 GELECEK
```

---

## 📌 Faz 1: Çekirdek Altyapı ve Web MVP (Tamamlandı ✅)

- [x] Monorepo mimarisi (Nx + pnpm workspaces)
- [x] Backend API: NestJS 10, Fastify/Express, Prisma ORM, 166 otomatik test
- [x] Multi-tenancy: AsyncLocalStorage tabanlı tenant izolasyonu (`tenant-context`)
- [x] Web Yönetim Paneli: React 19 + Vite 5 ile 14 temel yönetim sayfası
- [x] Canlı Dağıtım: Ubuntu VPS + Dokploy + Cloudflare Full SSL + Nginx

---

## 📌 Faz 2: Mobil Uygulama & Web V1 Stabilizasyonu (Aktif Faz ⏳)

- [x] Expo SDK 57 + React Native 0.86 mobil altyapısı
- [x] Standalone Android APK derlemesi (EAS Build) ve canlı API bağlantısı
- [x] ANEW (AI Native Engineering Workspace) disiplini ve kalite kapıları (`scripts/check.ps1`)
- [ ] **Web V1 Kalite Denetimi (`specs/active/0001-web-v1-stabilization-and-audit.md`):**
  - 14 web sayfasının tümünde rol bazlı (Admin, Öğretmen, Veli) akış doğrulaması
  - Boş veri durumlarında beyaz ekrana düşmeyi önleyen hata yakalama
  - Form ve modal validasyonlarının tamir edilmesi
- [ ] Mobil Veli & Öğretmen günlük karne ve yoklama ekranlarının tamamlanması

---

## 📌 Faz 3: Impeccable Design System & Storybook UI Atölyesi (Planlandı 🎨)

> **Hedef:** Kullanıcı arayüzünü dünya standartlarında ödüllü bir görsel seviyeye çıkarmak ve bileşenleri izole bir atölyede test edilebilir hale getirmek.

### 1. Impeccable Design System (Kusursuz Tasarım Standardizasyonu)

- [ ] **Renk & Tema Armonisi:** İskandinav Adaçayı (`bg-teal-700`), Bal Kehribarı (`bg-amber-500`) ve Obsidyen Koyu Mod (`#090D16` / `#131B2E`) renklerinin tüm bileşenlere eksiksiz uygulanması.
- [ ] **Savunmacı UI (Hardening):**
  - Tüm öğrenci/veli isimlerinde `min-w-0 flex-1 truncate` + `title="..."`.
  - Kırık profil fotoğraflarında `onError` fallback ve şık baş harf avatarı.
  - Tablo ve listelerde veri yokken standart temalı `<EmptyState>` rozetleri.
- [ ] **Mikro Etkileşimler:** Tıklanabilir butonlarda `active:scale-95`, kartlarda `hover:-translate-y-1` mikro animasyonları.

### 2. Storybook UI Bileşen Atölyesi Entegrasyonu (`@storybook/react-vite`)

- [ ] Web projesine Storybook kurulumu (`npx storybook@latest init`).
- [ ] **Atom Bileşen Hikayeleri:** `<Button>`, `<Badge>`, `<Avatar>`, `<Input>`, `<EmptyState>`.
- [ ] **Molekül & Kart Hikayeleri:** `<DailyReportCard>`, `<StudentPassportCard>`, `<AttendanceRow>`, `<MedicationAlertModal>`.
- [ ] **Uç Durum (Edge Case) Testleri:**
  - 60 harfli isimlerle taşma testi.
  - Alerji uyarısı yanan kırmızı rozet varyasyonu.
  - Karanlık mod (Dark Mode) canlı geçiş testi.
- [ ] Tasarımcılar ve paydaşlar için **Canlı Bileşen Kataloğu** yayını.

---

## 📌 Faz 4: Gelişmiş Özellikler ve İleri Otomasyon (Gelecek 🚀)

- [ ] **Anlık Bildirimler (Push Notifications):** Expo Push Notifications ve FCM entegrasyonu ile veliye anlık teslimat ve ilaç bildirimleri.
- [ ] **Gelişim Portfolyosu:** Çocuğun aylık pedagojik gelişim grafikleri ve fotoğraf albümü.
- [ ] **AI Destekli Günlük Karne Özeti:** Öğretmenin girdiği notları veliye sıcak, samimi bir pedagojik paragrafa dönüştüren yerleşik AI asistanı.
- [ ] **Admin Erken Uyarı Merkezi:** Devamsızlık riski olan öğrenciler, geciken ödemeler ve aşı/ilaç takvim uyarıları.
