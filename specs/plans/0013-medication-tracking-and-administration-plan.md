# Uygulama Planı 0013: İlaç Takibi ve Uygulama Yönetimi (Medication Tracking & Administration)

## 1. Mimari ve Değişiklik Özeti

`apps/admin-web/src/features/medication` dikey diliminde `MedicationPage.tsx` sayfasını KidsCare Dokunsal Tasarım Sistemine (Claymorphic / Tactile) tam uyumlu, filtrelemeli, KPI özet sayaçlı ve zenginleştirilmiş uygulama modalı yapısına kavuşturuyoruz.

## 2. Yapılacak Adımlar

### Adım 1: Frontend API İnceleme ve Güçlendirme (`apps/admin-web/src/api/medication.ts`)

- `markMedicationGiven` fonksiyonunun `opts` parametresi tipinin `exactOptionalPropertyTypes` uyumluluğunu kontrol etmek ve `note`, `givenAt` parametrelerini tam desteklediğinden emin olmak.

### Adım 2: `MedicationPage.tsx` Yeniden Tasarımı ve Bileşenleri

- **KPI Sayaçları:**
  - Bekleyen Talepler (`REQUESTED`)
  - Günün Planlanan İlaçları (`APPROVED` & `SCHEDULED`)
  - Bugün Verilenler (`GIVEN`)
  - Atlanan / Reddedilenler (`SKIPPED` & `REJECTED`)
- **Filtreleme & Arama Araç Çubuğu:**
  - Sekmeler: Tümü | Onay Bekleyenler | Günün Planları | Verilenler | Atlanan & Reddedilenler
  - Arama Çubuğu: İlaç veya Öğrenci adına göre anlık filtreleme
  - Öğrenci Dropdown Filtresi
- **Dokunsal Kartlar & Altın Kural Uyumu:**
  - Kartlar sabit, butonlar dokunsal 3D efektli (`TactileButton` / `.btn-tactile-*`).
  - İlaç ismi, doz, saat, öğrenci etiketi, kullanım talimatı kutusu, durum rozetleri.
- **Modallar:**
  - `CreateMedicationModal`: Yeni talep oluşturma (öğrenci, ilaç, dozaj, planlanan saat, talimat).
  - `AdministerMedicationModal`: İlaç verme modalı (verildiği saat, uygulama notu / hemşire notu).
  - `PromptModal`: Ret ve Atlama gerekçesi girişi.

### Adım 3: Testler & Doğrulama

- `apps/admin-web/src/features/medication/MedicationPage.test.tsx` testlerini yeni filtreleme ve modal yapılarını kapsayacak şekilde güncellemek.
- `pnpm --filter admin-web exec vitest run src/features/medication/MedicationPage.test.tsx` ile birim testleri çalıştırmak.
- `./scripts/check.ps1` ile monorepo doğrulamasını (TypeScript, ESLint, 31 test paketi) gerçekleştirmek.

### Adım 4: Kullanıcı Test Raporu Hazırlama

- Kullanıcıya adım adım tarayıcı test yönergelerini içeren detaylı rapor sunmak.
