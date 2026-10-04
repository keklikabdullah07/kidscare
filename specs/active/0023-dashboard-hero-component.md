# Şartname 0023: DashboardPage Hero Header Bileşen Ekstraksiyonu

## 1. Amaç ve Kapsam

Bu şartname, [`DashboardPage.tsx`](file:///c:/Users/Partridge/Desktop/KidsCare/apps/admin-web/src/features/dashboard/DashboardPage.tsx) içindeki özel hero header bloğunun (gradient, kişiselleştirilmiş selamlama, animasyonlu ping, kişiselleştirilmiş metrik) bağımsız `<DashboardHero />` bileşenine çıkarılmasını hedefler.

`DashboardHero` yeniden kullanılabilir, tek sorumluluk ve tema tutarlı bir bileşen olmalıdır. Mevcut tasarım kasıtlı olarak korunur; yalnızca sorumluluk ayrımı yapılır.

## 2. Mevcut Durum

`DashboardPage.tsx` ~650 satır, içinde:

- Veri fetch + state yönetimi
- Hesaplamalar (oran, bekleyen işler, alerji)
- **Hero header bloğu** (60+ satır, kendi içinde çok state)
- KPI kartları grid (4 Link)
- Operasyonel eylem merkezi
- Yemek menüsü + sağlık paneli

Hero bölümü kendi içinde:

- Gradient + ambient blur'lar
- `timeGreeting` (saate göre emoji ve not)
- Kullanıcı adı + emoji (scale + rotate animasyonu)
- Anlık metrik cümlesi
- Tarih ve durum çipleri (animasyonlu ping)
- 2 CTA Link (`/attendance`, `/tracking`)

## 3. Bileşen Sözleşmesi

### 3.1. `DashboardHeroProps`

```ts
interface DashboardHeroProps {
  userName: string;
  timeGreeting: { text: string; emoji: string; note: string };
  totalStudents: number;
  presentCount: number;
  targetReportCount: number;
  filledReportsCount: number;
  todayFormatted: string;
}
```

### 3.2. Dosya Konumu

`apps/admin-web/src/features/dashboard/DashboardHero.tsx`

### 3.3. Davranış

- Tasarım birebir korunur.
- 2 CTA (`Yoklama Al`, `Günlük Takip`) `<Link>` olarak kalır (TactileButton değil; hero butonları özel stil).
- Animasyonlar (ping, scale, gradient) korunur.
- Dark mode renkleri korunur.

## 4. Kabul Kriterleri

1. `DashboardPage.tsx` ≥ 60 satır azalır (hero bloğu çıkarılır).
2. `DashboardHero` bağımsız prop setiyle render olur.
3. Mevcut görsel davranış birebir aynı kalır (regresyon yok).
4. Vitest testleri (`DashboardPage` mevcut) %100 geçer.
5. `./scripts/check.ps1` 0 hata.

## 5. Kapsam Dışı

- Hero içindeki KPI kartların dönüşümü (mevcut haliyle Korunur).
- Yemek menüsü + sağlık paneli.
- Operasyonel eylem merkezi.
