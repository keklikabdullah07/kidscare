# Spec 0010 — admin-web-tactile-pages-finalization (mini)

- Status: Draft
- Mode: lite
- Plan: `specs/plans/0010-admin-web-tactile-pages-finalization-plan.md`
- Source: USER-REQUEST-20261003-TACTILE-PAGES-FINALIZATION

## Intent

KidsCare Web Yönetim Paneli'nde (`apps/admin-web`) onaylanan **İskandinav Dokunsal (Nordic Tactile Claymorphism)** tasarım dilini (`docs/design-system.md`) kalan tüm sayfalara (Yoklama, Günlük Menü, Veli Portalı) ve modal pencerelerine (`CheckOutModal`, `StudentPassportModal`, `DailyReportEditorModal`, `PromptModal`) tam olarak entegre etmek. Bu sayede web panelindeki tüm etkileşimli yüzeyler, butonlar ve formlar tutarlı bir fiziksel derinliğe, 3D basılma hissine ve sıcak keten/obsidyen zemin harmonisine kavuşacaktır.

## Changed behavior

- [ ] CB-1 — **Yoklama Sayfası (`/attendance`)**:
  - Üst KPI filtre istatistik butonları 3D ekstrüzyon gölgesi (`shadow-[0_4px_0_0_#D5CBB9...]` / dark: `shadow-[0_4px_0_0_#1E293B...]`) ve basılma efektine (`active:translate-y-[3px] active:shadow-none`) kavuşturulur.
  - Tablo ve kart görünümündeki öğrenci durum butonları (Geldi, Çıkış, İzinli, Gelmedi) dokunsal 3D pill (`btn-tactile-*`) formatına çekilir.
  - "Tek Etkileşimli Varlık İlkesi" gereğince kart gövdesi sabit tutulur, sadece içindeki butonlar yükselir ve basılır.
  - Tarih seçici ve arama çubuğu parlamayan keten/obsidyen zemin (`#FCFAF7` / `#0F172A`) ve sıcak sınırlara (`#DDD4C4`) taşınır.
- [ ] CB-2 — **Günlük Menü Sayfası (`/menus`)**:
  - Ön tanımlı alerjen seçim hapları (`toggleAllergen`) basıldığında fiziksel olarak çöken 3D dokunsal pill haline getirilir.
  - Öğün kartları (Kahvaltı, Öğle, İkindi) ve alerji uyarı panosu sıcak keten/obsidyen zemin tokenlarına ve `#DDD4C4` sınırlarına uyarlanır.
  - Menü kaydetme ve silme butonları `.btn-tactile-teal` ve `.btn-tactile-danger` olarak standardize edilir.
- [ ] CB-3 — **Veli Portalı (`/portal`)**:
  - Çoklu çocuk geçiş sekmeleri (Tabs) `.btn-tactile-teal` (aktif) ve `.btn-tactile-secondary` (pasif) olarak güncellenir.
  - Günlük karne özet kartları, ruh hali, beslenme ve uyku panelleri sıcak dokunsal kart mimarisine geçirilir.
- [ ] CB-4 — **Modallar (`CheckOutModal`, `StudentPassportModal`, `DailyReportEditorModal`, `PromptModal`)**:
  - Tüm modal çerçeveleri standart `rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-2xl overflow-hidden` kabuğuna kavuşturulur.
  - Form inputları ve metin kutuları `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs` standardına çekilir.
  - Modal içi durum seçim çipleri (Ruh Hali / Mood, Yemek Porsiyonu, Uyku Kalitesi, Tuvalet, Alerjiler) 3D basılabilir dokunsal pill'ler haline getirilir.
  - Modal aksiyon butonları `.btn-tactile-secondary` ve `.btn-tactile-teal` / `.btn-tactile-danger` olarak netleştirilir.

## Preserved behavior

- [ ] PB-1 — Tüm API istekleri, state yönetimi, form gönderimleri, alerjen eşleştirme algoritmaları ve yoklama hesaplamaları eksiksiz çalışmaya devam eder.
- [ ] PB-2 — Karanlık mod (`dark:`) kontrastları, erişilebilirlik (`WCAG AA`) ve mobil uyumluluk (`responsive design`) korunur.

## Out of scope

- Backend (`apps/api`) veya mobil uygulama (`apps/mobile`) kodlarında değişiklik yapılmaz; değişiklikler yalnızca `apps/admin-web` stil ve bileşen katmanıyla sınırlıdır.

## Definition of Done

- [ ] Yoklama, Günlük Menü, Veli Portalı ve 4 modal penceresi KidsCare dokunsal tasarım standartlarına kavuşturulur.
- [ ] TypeScript kontrolleri (`tsc --noEmit`) hatasız geçer.
- [ ] `./scripts/check.ps1` yeşil tamamlanır.
