# Uygulama Planı 0014: Olay Kayıtları ve Revir Takibi (Incidents & Health Safety Records)

## 1. Mimari ve Değişiklik Özeti

`apps/admin-web/src/features/incidents` dikey diliminde `IncidentsPage.tsx` sayfasını KidsCare Dokunsal Tasarım Sistemine (Claymorphic / Tactile) tam uyumlu, KPI özet sayaçlı, sekme filtreli, arama çubuğu olan ve açılır modal form yapısına kavuşturuyoruz.

## 2. Yapılacak Adımlar

### Adım 1: Frontend API İnceleme (`apps/admin-web/src/api/incidents.ts`)

- `updateIncident` ve `createIncident` metodlarının `exactOptionalPropertyTypes` uyumluluğunu kontrol etmek ve doğrulamak.

### Adım 2: `IncidentsPage.tsx` Yeniden Tasarımı

- **Başlık & Aksiyon Alanı:**
  - Olay Kayıtları ve Revir Takibi başlığı, rozet, dokunsal "Yenile" ve "Yeni Tutanak Oluştur" butonları.
- **4'lü Dokunsal KPI Sayaçları (`StatCard`):**
  - Toplam Olay Tutanağı
  - Bildirim Bekleyenler (Acil inceleme - amber)
  - Düşme & Yaralanma (Fiziksel olaylar - rose)
  - Veliye Bildirildi (Tamamlananlar - emerald)
- **Kategori & Durum Sekmeleri:**
  - _Tümü_ | _Bildirim Bekleyenler_ | _Düşme & Yaralanma_ | _Hastalık & Revir_ | _Davranış & Diğer_
- **Arama & Filtreleme Çubuğu:**
  - Açıklama, ilk yardım veya öğrenci adına göre arama girişi.
  - Öğrenci seçim dropdown'ı.
- **Dokunsal Kart Tasarımı (Altın Kural):**
  - Kart sabit derinlikte; "Veliye Bildirildi Olarak İşaretle" butonu 3D dokunsal derinlikte (`TactileButton`).
  - Kategori renk rozeti, öğrenci adı, ilk yardım kutusu, tarih/saat damgası.
- **Yeni Tutanak Modalı:**
  - Açılır modal (öğrenci, kategori, tarih/saat, açıklama, ilk yardım, veli bilgisi onay kutusu).

### Adım 3: Testler & Doğrulama

- `apps/admin-web/src/features/incidents/IncidentsPage.test.tsx` testlerini zenginleştirerek KPI kartları, arama ve filtreleme kontrollerini eklemek.
- `pnpm --filter admin-web exec vitest run src/features/incidents/IncidentsPage.test.tsx` ile test etmek.
- `./scripts/check.ps1` ile monorepo genel doğrulamasını yürütmek.

### Adım 4: Kullanıcı Test Raporu

- Adım adım tarayıcı test yönergelerini içeren detaylı rapor hazırlamak.
