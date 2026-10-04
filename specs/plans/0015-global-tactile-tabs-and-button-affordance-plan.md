# Uygulama Planı 0015: Küresel Dokunsal Sekme ve Buton Tıklanabilirlik Standardı (Global Tactile Tabs & Button Affordance)

## 1. Mimari ve Değişiklik Özeti

Proje genelinde sekmelerin ve pasif butonların tıklanabilirlik algısını (affordance) mükemmelleştirmek amacıyla:

1. `apps/admin-web/src/index.css` dosyasına `.tactile-tab-track`, `.tactile-tab-btn-inactive`, `.tactile-tab-btn-active` sınıfları eklenir.
2. `apps/admin-web/src/components/ui/TactileTabs.tsx` bileşeni oluşturulur ve `ui/index.ts` üzerinden export edilir.
3. `IncidentsPage.tsx`, `MedicationPage.tsx` ve `PickupPage.tsx` sayfaları bu yeni bileşenle donatılır.

## 2. Yapılacak Adımlar

### Adım 1: Global CSS Sınıfları (`index.css`)

- `.tactile-tab-track`: İçe gömülü alt ray kutusu.
- `.tactile-tab-btn-inactive`: 2px border, açık zemin, 3D alt dudak gölgesi, hover/active basılma animasyonu.
- `.tactile-tab-btn-active`: Renkli 3D ekstrüzyon gölgesi.

### Adım 2: `TactileTabs.tsx` Bileşeni

- Tab nesnesi: `{ id: T, label: string, count?: number, icon?: ComponentType, variant?: 'teal' | 'amber' | 'rose' | 'sky' | 'purple', badgeVariant?: string }`.
- Desteklenen props: `tabs`, `activeId`, `onChange`, `className`.

### Adım 3: Sayfaların Güncellenmesi

- `IncidentsPage.tsx`: Sekmeler `<TactileTabs />` ile güncellenir.
- `MedicationPage.tsx`: Sekmeler `<TactileTabs />` ile güncellenir.
- `PickupPage.tsx`: Sekmeler `<TactileTabs />` ile güncellenir.

### Adım 4: Testler & Doğrulama

- `Primitives.test.tsx` veya `TactileTabs.test.tsx` birim testleri eklenir.
- `./scripts/check.ps1` ile monorepo genel doğrulamasını yürütmek.
