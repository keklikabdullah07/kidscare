# Şartname 0022: Spot Dokunsal Harmonizasyon — Pickup, Gallery, Dashboard, Attendance

## 1. Amaç ve Kapsam

Bu şartname, KidsCare Yönetim Paneli'ndeki `PickupPage`, `ActivityGalleryPage`, `DashboardPage`, `AttendancePage` sayfalarının projenin dokunsal (claymorphic) tasarım sistemine **spot harmonizasyon** ile uyumlu hale getirilmesini hedefler.

**Spot harmonizasyon** = sayfanın büyük çoğunluğu zaten elle yazılmış tactile class'lar içeriyor; yalnızca **header bloğu**, **ana eylem butonları** ve **boş/hata state** standart bileşenlere (`PageHeader`, `TactileButton`) taşınır. Tam refactor yapılmaz.

## 2. Hedeflenen Sayfalar

| Route         | Sayfa                     | Spec   | Durum                                          |
| ------------- | ------------------------- | ------ | ---------------------------------------------- |
| `/pickup`     | `PickupPage.tsx`          | 0022.1 | ✅ Uygulandı                                   |
| `/gallery`    | `ActivityGalleryPage.tsx` | 0022.2 | ✅ Uygulandı                                   |
| `/dashboard`  | `DashboardPage.tsx`       | 0022.3 | ✅ `DashboardHero` bileşenine çıkarıldı (0023) |
| `/attendance` | `AttendancePage.tsx`      | 0022.4 | ✅ Uygulandı                                   |
| `/tracking`   | `DailyTrackingPage.tsx`   | 0022.5 | ⏳ Uygulanacak                                 |

**DashboardPage istisnası:** Sayfanın başında özel hero header (gradient + kişiselleştirilmiş selamlama + animasyonlu ping) mevcut. `<PageHeader>` standardı bu hero tasarımına uymadığı için bilinçli olarak dönüşüm uygulanmadı. Mevcut haliyle korunur. İleride ayrı bir spec ile hero header'ın standartlaştırılması değerlendirilebilir.

## 3. Spot Harmonizasyon Kuralları

- **Header bloğu:** Manuel `<div>` → `<PageHeader icon={…} title={…} description={…} actions={…} />`.
- **Ana butonlar:** `btn-tactile-*` düz `<button>` → `<TactileButton variant="…" size="…">`.
- **StatCard / TACTILE_CARD_CLASSES:** mevcut hâli korunur; tam refactor kapsam dışı.
- **Modallar:** mevcut hâli korunur; sadece action butonları bileşene dönüşür.
- **Mevcut testler** korunur; yeni test zorunlu değil.

## 4. Kabul Kriterleri (Her Sayfa İçin)

1. Header bileşeni `<PageHeader>` standardına uyar.
2. Ana eylem butonları `<TactileButton>` standardına uyar.
3. Mevcut işlevsellik ve testler korunur.
4. Vitest PASS.
5. `./scripts/check.ps1` 0 hata.
