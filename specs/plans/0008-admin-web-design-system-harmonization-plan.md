# Implementation Plan 0008 — Admin Web Tasarım Harmonizasyonu

Bu plan, Ana Panel'de (`/dashboard`) başarıyla uygulanan Apple "Warm Paper & Frosted Glass" mimarisinin (`#F6F3EC` tuval, `#DDD4C4` sınır, çok katmanlı ortam gölgeleri, `rounded-3xl` squircle kartlar) diğer tüm aktif admin-web sayfalarına yayılmasını kapsar.

## User Review Required

> [!NOTE]
> Bu plan yalnızca `apps/admin-web` stil ve kart hiyerarşisini günceller; hiçbir iş mantığını veya veri modelini bozmaz. Her sayfa adımında canlı önizleme ve tarayıcı doğrulama kanıtı alınacaktır.

---

## Proposed Changes

### Adım 1: Öğrenciler Sayfası (`/students`) [TAMAMLANDI]

- `apps/admin-web/src/features/students/StudentsPage.tsx`
  - Filtre & arama üst bloğu `rounded-3xl border border-[#DDD4C4] shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08)]` yapısına getirildi.
  - `StudentCard` ızgara kartları `rounded-3xl border border-[#DDD4C4] shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08)] hover:shadow-[0_16px_36px_-4px_rgba(20,32,54,0.14)]` ile güçlendirildi.
  - Tablo görünümü (`table view`) aynı squircle çerçeveye alındı.

### Adım 2: Yoklama Sayfası (`/attendance`) [TAMAMLANDI]

- `apps/admin-web/src/features/attendance/AttendancePage.tsx`
  - Sınıf seçici ve üst istatistik kartları güncel `StatCard` standardına eşitlendi.
  - Öğrenci yoklama satırları/kartları belirgin sınır ve mikro-etkileşimli butonlarla (`Geldi`, `Gelmedi`, `İzinli`) zenginleştirildi.

### Adım 3: Günlük Takip / Karne Sayfası (`/tracking`) [TAMAMLANDI]

- `apps/admin-web/src/features/daily-reports/DailyTrackingPage.tsx`
  - Günlük karne doldurma alanları, duygu durumu (mood), yemek ve uyku seçim kapsülleri modern Apple squircle butonlarına dönüştürüldü.

### Adım 4: Yemek Menüsü Sayfası (`/menus`) [TAMAMLANDI]

- `apps/admin-web/src/features/daily-menus/DailyMenuPage.tsx`
  - Haftalık/günlük menü kartları sıcak keten zemin üzerinde belirgin seramik plaketler haline getirildi.

### Adım 5: Veli Portalı (`/portal`) [TAMAMLANDI]

- `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`
  - Veli arayüzündeki günlük karne özeti, yemek listesi ve bildirim kartları aynı sıcak lüks standarda ulaştırıldı.

---

## Verification Plan

### Automated Tests [BAŞARILI]

- `./scripts/check.ps1` çalıştırıldı:
  - TypeScript tip denetimi: BAŞARILI
  - ESLint kontrolleri: BAŞARILI
  - Test paketleri: 31 passed, 149 passed: BAŞARILI

### Manual / Browser Verification [BAŞARILI]

- `browser_subagent` ile her sayfanın (`/students`, `/attendance`, `/tracking`, `/menus`, `/portal`) canlı ekran görüntüleri alındı ve doğrulandı.
