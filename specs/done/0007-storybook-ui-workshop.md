# Spec 0007 — Storybook UI Atölyesi ve Tasarım Bileşenleri Doğrulaması

- Status: Done
- Mode: lite
- Plan: `specs/plans/0007-storybook-ui-workshop-plan.md`

## Intent

KidsCare yönetim panelinin (`apps/admin-web`) kullanıcı arayüzü kalitesini, tasarım sistemi tutarlılığını ve uç durum (edge case) güvenilirliğini garanti altına almak amacıyla izole bir UI bileşen geliştirme ve test atölyesi (Storybook) kurulacaktır. Bu atölye sayesinde butonlar, rozetler, modal pencereler, boş durum ekranları (`EmptyState`), istatistik kartları ve öğrenci sağlık pasaportu bileşenleri; backend'den bağımsız olarak açık/koyu modlarda, farklı cihaz ekran genişliklerinde ve aşırı uzun metin/kırık veri durumlarında görsel olarak denetlenecek, projenin canlı ve interaktif tasarım kütüphanesi oluşturulacaktır.

## Requirements

1. **Vite & React 19 Uyumlu Storybook Entegrasyonu:**
   - `apps/admin-web` projesine Storybook React-Vite mimarisi (`@storybook/react-vite`) kurulmalıdır.
   - TailwindCSS ve KidsCare Impeccable Design System tema sınıfları Storybook preview ortamında eksiksiz yüklenmelidir.
   - Açık (Light) ve Koyu (Dark) mod geçiş düğmesi Storybook araç çubuğuna entegre edilmelidir.
2. **Çekirdek UI Bileşen Hikayeleri (Core Stories):**
   - **`Badge`:** Farklı renk varyantları (`success`, `warning`, `danger`, `info`, `primary`, `neutral`), boyutlar ve ikonlu durumlar.
   - **`StatCard`:** Başlık, sayısal değer, trend yüzdesi (pozitif/negatif) ve hover animasyonu varyantları.
   - **`EmptyState`:** İkonlu, açıklama metinli ve eylem çağrılı (CTA) boş liste durumları.
   - **`PageHeader`:** Başlık, alt başlık, eylem butonları ve breadcrumb durumları.
   - **`PromptModal`:** Onay, tehlikeli silme ve form giriş pencereleri.
   - **`KidsCareLogo`:** Yatay, dikey, kompakt ve renkli/monokrom varyantlar.
3. **Savunmacı UI ve Uç Durum (Edge Case) Testleri:**
   - Çok uzun öğrenci adlarında `truncate` ve taşma (overflow) kontrolleri.
   - Boş veri, yüklenme (skeleton/loading) ve hata durumları.
4. **Zero-Bloat ve Performans Güvencesi:**
   - Storybook geliştirme ortamı bağımsız bir script (`pnpm --filter @kidscare/admin-web storybook`) ile çalışmalı; üretim (`build`) Docker imajlarına hiçbir ek yük getirmemelidir.

## Constraints & out of scope

- **Kapsam İçi:** Storybook konfigürasyonu (`.storybook/main.ts`, `.storybook/preview.ts`), çekirdek UI bileşen hikayeleri (`*.stories.tsx`), açık/koyu tema simülatörü, statik Storybook derlemesi (`build-storybook`).
- **Kapsam Dışı:** Harici ücretli Chromatic bulut testi (ücretsiz yerel Storybook motoru kullanılacaktır).

## Acceptance criteria

- [x] AC-1 — Storybook Altyapısı: `apps/admin-web/.storybook/` konfigürasyonu Vite ve TailwindCSS v4 ile tam uyumlu olarak çalışmalıdır.
- [x] AC-2 — Çekirdek UI Hikayeleri: `Badge`, `StatCard`, `EmptyState`, `PageHeader`, `PromptModal` ve `KidsCareLogo` için `.stories.tsx` dosyaları oluşturulmalıdır.
- [x] AC-3 — Açık/Koyu Mod Denetimi: Storybook ortamında koyu mod sınıfı (`dark`) aktif edildiğinde kart yüzeyleri ve metin kontrastları KidsCare renk standartlarına uymalıdır.
- [x] AC-4 — Uç Durum Hikayeleri: Uzun metinler, çoklu etiketler ve boş durumlar için senaryolar belgelenmelidir.
- [x] AC-5 — Storybook Derleme Testi: `pnpm --filter @kidscare/admin-web build-storybook` komutu hatasız statik paket üretmelidir.
- [x] AC-6 — Monorepo Kalite Kapısı: `./scripts/check.ps1` %100 yeşil kalmalı, mevcut testler veya derlemeler bozulmamalıdır.

## Definition of Done

- [x] Tüm 6 kabul kriteri Storybook derlemesi ve hikaye testleriyle doğrulanmış olmalı
- [x] `scripts/check.ps1` (Types + Lint + Test) %100 yeşil olmalı
- [x] Tasarım bileşenleri KidsCare Impeccable Design System kurallarına uygun olmalı
- [x] Şartname `specs/done/` klasörüne taşınmalı

## Scorecard (fill at ship)

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 0     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
