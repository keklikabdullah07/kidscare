# Plan 0007 — Storybook UI Atölyesi ve Tasarım Bileşenleri Doğrulaması

- Spec: `specs/active/0007-storybook-ui-workshop.md`
- Status: Approved
- Approved by: User
- Mode: lite

---

## 1. Değişecek veya Eklenecek Dosyalar (Files to Change or Add)

### `apps/admin-web/`
- `apps/admin-web/package.json` — Storybook bağımlılıkları (`@storybook/react-vite`, `@storybook/react`, `storybook`) ve çalıştırma script'leri.
- `apps/admin-web/.storybook/main.ts` — Storybook Vite entegrasyonu, eklentiler ve hikaye dosya yolları.
- `apps/admin-web/.storybook/preview.ts` — `src/index.css` import'u, açık/koyu tema kontrolü ve viewport ayarları.
- `apps/admin-web/src/components/ui/Badge.stories.tsx` — Rozet varyantları (renkler, boyutlar, durumlar).
- `apps/admin-web/src/components/ui/StatCard.stories.tsx` — İstatistik kartları (trendler, ikonlar, yüklenme durumları).
- `apps/admin-web/src/components/ui/EmptyState.stories.tsx` — Boş liste ve arama sonucu bulunamadı durumları.
- `apps/admin-web/src/components/ui/PageHeader.stories.tsx` — Başlık ve eylem çubukları.
- `apps/admin-web/src/components/ui/PromptModal.stories.tsx` — Onay ve uyarı modal pencereleri.
- `apps/admin-web/src/components/KidsCareLogo.stories.tsx` — Logo varyantları.

### Dokploy ve Sıfır-Şişme Koruması
- `.dockerignore` — `storybook-static` ve `.storybook` önbelleklerinin Docker imajına girmesini engelleme.

---

## 2. Sıralı Uygulama Adımları (Ordered Steps)

### Aşama 1: Storybook Altyapı Kurulumu
1. **Adım 1.1:** `apps/admin-web/package.json` içine Storybook paketlerini ekleyip pnpm ile kurma.
2. **Adım 1.2:** `.storybook/main.ts` dosyasını Vite framework motoruyla yapılandırma.
3. **Adım 1.3:** `.storybook/preview.ts` dosyasında Tailwind v4 stillerini (`src/index.css`) ve tema sağlayıcısını entegre etme.

### Aşama 2: Çekirdek UI Bileşen Hikayeleri (Stories)
1. **Adım 2.1:** `Badge.stories.tsx` — Başarı, uyarı, tehlike, nötr ve kreş sarısı rozet varyantları.
2. **Adım 2.2:** `StatCard.stories.tsx` — Sayısal metrikler, artış/azalış trendleri ve etkileşimli hover durumu.
3. **Adım 2.3:** `EmptyState.stories.tsx` — Boş öğrenci listesi, boş karne ekranı ve "Öğrenci Ekle" çağrılı boş durumlar.
4. **Adım 2.4:** `PromptModal.stories.tsx` & `PageHeader.stories.tsx` — Kullanıcı teyit modalları ve başlık hiyerarşisi.
5. **Adım 2.5:** `KidsCareLogo.stories.tsx` — Renkli, beyaz, yatay ve kompakt logo varyantları.

### Aşama 3: Uç Durum (Edge Case) ve Savunmacı UI Denetimi
1. **Adım 3.1:** Aşırı uzun isimlerde `truncate` ve metin taşma senaryolarını hikayelere ekleme.
2. **Adım 3.2:** Koyu modda (`dark` class) kart yüzeyleri ve metin okunabilirlik kontrastını test etme.

### Aşama 4: Derleme, Kalite ve Doğrulama
1. **Adım 4.1:** `pnpm --filter @kidscare/admin-web build-storybook` ile statik paket derleme testi yapma.
2. **Adım 4.2:** `./scripts/check.ps1` tam doğrulama kapısını koşma.
3. **Adım 4.3:** Şartnameyi `specs/done/` içine taşıma ve yerel commit oluşturma (asla push yok!).

---

## 3. Riskler ve Savunma Stratejisi

- **Risk 1 (React 19 / Vite Uyumu):** React 19'da bazı eski Storybook sürümleri peer dependency uyarısı verebilir.
  - *Savunma:* Modern Storybook 8+ sürümü ve Vite framework entegrasyonu kullanılarak uyumluluk sağlanır.
- **Risk 2 (Dokploy VPS Şişmesi):** Storybook statik derleme dosyaları sunucuda disk kaplamamalıdır.
  - *Savunma:* `.dockerignore` içine `storybook-static` eklenir, üretim derlemesinde (`pnpm build`) Storybook derlenmez.
