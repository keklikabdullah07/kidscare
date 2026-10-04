# Uygulama Planı 0023: DashboardHero Bileşen Ekstraksiyonu

Bu plan, `DashboardPage.tsx` içindeki hero header bloğunu bağımsız `<DashboardHero />` bileşenine çıkarır.

## Kullanıcı İncelemesi Gerektiren Önemli Noktalar

- **Kapsam:** Yalnızca hero header bloğu (60 satır) çıkarılır; KPI kartlar, operasyonel merkez, yemek+sağlık paneli olduğu gibi kalır.
- **CTA'lar:** 2 Link butonu (`Yoklama Al`, `Günlük Takip`) özel hero stili olduğu için `<TactileButton>`'a dönüştürülmez; `<Link>` korunur.
- **ESLint kuralı:** Monorepo standartlarına uygun olarak `// eslint-disable-next-line react-hooks/exhaustive-deps` KULLANILMAYACAKTIR.

---

## Önerilen Değişiklikler

### 1. Yeni: `apps/admin-web/src/features/dashboard/DashboardHero.tsx`

- Bileşen tanımı (`DashboardHeroProps` interface + fonksiyon).
- Mevcut hero section JSX'i (gradient, ambient blur'lar, greeting, metrik cümlesi, çipler, 2 Link) birebir taşınır.
- `import { Link } from 'react-router-dom';` ve gerekli Lucide ikonları.

### 2. `apps/admin-web/src/features/dashboard/DashboardPage.tsx`

- `Link` import'u kaldırılır (artık kullanılmıyor; KPI kartlarda da Link var — geri eklenebilir; kontrol gerekir).
- Hero bloğu `<DashboardHero ...props />` ile değiştirilir.
- `timeGreeting` hesabı hero'ya prop olarak geçirilebilir veya hero içinde hesaplanabilir (state yok, basit). **Hero içinde hesaplanır** (yeniden kullanılabilirlik için).

### 3. Testler

- Mevcut `DashboardPage.test.tsx` (varsa) yeşil olmalı; hero render doğrulanır.
- Yeni `DashboardHero.test.tsx`: minimal render testi + prop varyasyonları (greeting metni, metrik cümlesi, çip değerleri).

---

## Doğrulama Planı

```powershell
pnpm --filter @kidscare/admin-web test src/features/dashboard/
pnpm exec eslint apps/admin-web/src/features/dashboard/DashboardPage.tsx apps/admin-web/src/features/dashboard/DashboardHero.tsx
pwsh -File ./scripts/check.ps1
```
