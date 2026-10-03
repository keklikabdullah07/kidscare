# Implementation Plan 0009 — Tactile 3D Buttons

Bu plan, KidsCare web arayüzündeki tüm butonların referans görseldeki 3D fiziksel basılabilir (tactile pill) standarda taşınmasını kapsar.

## Proposed Changes

### Adım 1: `apps/admin-web/src/index.css`

- `.btn-tactile-amber`, `.btn-tactile-teal`, `.btn-tactile-secondary`, `.btn-tactile-danger` ve boyut yardımcı sınıflarını ekleme.

### Adım 2: Öğrenciler Sayfası (`/students`)

- `StudentsPage.tsx` üzerindeki "Yeni Öğrenci Ekle", arama/filtreleme hapları, kart aksiyon butonlarını güncelleme.

### Adım 3: Yoklama Sayfası (`/attendance`)

- `AttendancePage.tsx` üzerindeki "Yoklamayı Kaydet", "Tümünü Geldi İşaretle" ve her öğrencinin "Geldi/Gelmedi/İzinli" butonlarını güncelleme.

### Adım 4: Günlük Takip / Karne Sayfası (`/tracking`)

- `DailyTrackingPage.tsx` üzerindeki bülten kaydetme ve ruh hali/yemek/uyku seçim butonlarını güncelleme.

### Adım 5: Yemek Menüsü (`/menus`) ve Veli Portalı (`/portal`)

- Menü sayfası ve veli paneli butonlarını güncelleme.

---

## Verification Plan

- `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
- `chrome-devtools` ile sayfalardan canlı ekran görüntüleri
- `./scripts/check.ps1` çalıştırma
