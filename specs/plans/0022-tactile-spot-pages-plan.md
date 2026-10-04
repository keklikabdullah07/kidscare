# Uygulama Planı 0022: Spot Dokunsal Harmonizasyon (Pickup / Gallery / Dashboard / Attendance)

Bu plan, dört sayfada spot harmonizasyon uygular. Her sayfa bağımsız commit ile yayınlanır.

## Adımlar

### Adım 1 — `apps/admin-web/src/features/pickup/PickupPage.tsx`

- Header bloğu → `<PageHeader icon={ShieldCheck} title="Güvenlik & Teslimat Kontrolü" description="…" actions={…} />`.
- "Öğrenciyi Teslim Et" (header) → `<TactileButton variant="teal" size="md">`.
- "Yeni Yetkili Ekle" → `<TactileButton variant="secondary" size="md">`.
- Yenile butonu → `<TactileButton variant="secondary" size="sm">` (icon-only).
- Kart içi "Onayla" / "Reddet" / "Öğrenciyi Teslim Et" → `<TactileButton>`.
- Modal "İptal" / "Teslimatı Onayla" / "Yetkiliyi Kaydet" → `<TactileButton>`.
- `RotateCw` import'u kullanılmıyorsa kaldırılır.

### Adım 2 — `apps/admin-web/src/features/activities/ActivityGalleryPage.tsx`

- Header bloğu → `<PageHeader>`.
- Ana butonlar (Yükle, Albüm Oluştur, vb.) → `<TactileButton>`.

### Adım 3 — `apps/admin-web/src/features/dashboard/DashboardPage.tsx`

- **Atlandı.** Sayfanın başındaki hero header (gradient + kişiselleştirilmiş selamlama + animasyonlu ping) özel tasarım kasıtlıdır; `<PageHeader>` standardına uymadığı için bilinçli olarak dönüştürülmedi.

### Adım 4 — `apps/admin-web/src/features/attendance/AttendancePage.tsx`

- Header bloğu → `<PageHeader>`.
- Ana butonlar (Yoklama Al, vb.) → `<TactileButton>`.

### Adım 5 — `apps/admin-web/src/features/daily-reports/DailyTrackingPage.tsx`

- Header bloğu → `<PageHeader icon={Sparkles} title="Günlük Yaşam & Aktivite Takibi" actions={…} />`.
- Tarih gezici gezgini ve "Bugün" → `<TactileButton>` (icon-only `secondary` `size="sm"`).

## Doğrulama (her adımda)

```powershell
pnpm exec eslint <değişen-dosya>
pnpm --filter @kidscare/admin-web test <ilgili-test-dosyası>
pwsh -File ./scripts/check.ps1
```

## Commitler

- 1 commit her sayfa için (`feat(<h>): spot tactile harmonization`).
- **DashboardPage** `DashboardHero` bileşenine çıkarıldı (0023).
- 4 commit (pickup, gallery, attendance, daily-tracking) uygulandı / uygulanacak.
