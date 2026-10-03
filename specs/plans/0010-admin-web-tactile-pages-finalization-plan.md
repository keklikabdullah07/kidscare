# Implementation Plan 0010 — admin-web-tactile-pages-finalization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KidsCare Web Yönetim Paneli'nde kalan sayfaları (Yoklama, Günlük Menü, Veli Portalı) ve tüm modal pencerelerini (`CheckOutModal`, `StudentPassportModal`, `DailyReportEditorModal`, `PromptModal`) KidsCare Dokunsal Tasarım Sistemi (Nordic Tactile Claymorphism) standartlarına tam olarak kavuşturmak.

**Architecture:** Vertical Slice mimarisi gereği her özellik dilimindeki UI bileşenleri ve modal kabukları güncellenir. Zeminler `#FAF9F6`/`#FCFAF7` (koyu modda `#090D16`/`#131B2E`), sınırlar `#DDD4C4` (koyu modda `border-slate-800`), etkileşimli butonlar `.btn-tactile-*`, form alanları squircle derinlik ve `rounded-2xl` ile normalize edilir. "Tek Etkileşimli Varlık İlkesi" sıkı şekilde korunur.

**Tech Stack:** React 19, TypeScript, TailwindCSS v4, Lucide React, Vitest.

## Global Constraints

- Hiçbir backend/API endpoint'i, prisma şeması veya veri modeli değiştirilmez.
- Mevcut iş mantığı, form state'leri, alerjen kontrolleri ve yoklama durum algoritmaları birebir korunur.
- Tek Etkileşimli Varlık İlkesi: Kart içinde buton varsa kart sabittir (`shadow-2xs` / `shadow-sm`), buton dokunsaldır. Kartın içinde buton yoksa kartın kendisi dokunsaldır.
- TypeScript kontrolleri (`tsc --noEmit`) ve `./scripts/check.ps1` doğrulaması yeşil olmak zorundadır.

---

### Task 1: Modalların Dokunsal Dönüşümü (CheckOutModal, StudentPassportModal, DailyReportEditorModal, PromptModal)

**Files:**

- Modify: `apps/admin-web/src/features/attendance/CheckOutModal.tsx`
- Modify: `apps/admin-web/src/features/students/StudentPassportModal.tsx`
- Modify: `apps/admin-web/src/features/daily-reports/DailyReportEditorModal.tsx`
- Modify: `apps/admin-web/src/components/ui/PromptModal.tsx`

**Interfaces:**

- Consumes: `tactile.css` (`.btn-tactile-*`, `.tactile-card`), `docs/design-system.md` renk tokenları (`#DDD4C4`, `#FCFAF7`, `#131B2E`)
- Produces: Tutarlı dokunsal modal çerçeveleri ve form kontrolleri

- [ ] **Step 1: PromptModal dokunsal kabuğunu güncelle**
  - Modal container: `rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-2xl`
  - Input/Textarea: `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl`
  - Butonlar: `btn-tactile-secondary` ve `styles.btn`

- [ ] **Step 2: CheckOutModal dokunsal kabuğunu ve teslim alıcı seçimini güncelle**
  - Modal container ve başlık: Sıcak keten/obsidyen zemin ve `#DDD4C4` sınırları
  - Yetkili teslim alıcı kartları: Dokunsal radio kutuları, aktifken `border-teal-700 bg-teal-50/60 dark:bg-teal-950/40`
  - Özel teslimat form inputları: `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl`
  - Aksiyon butonları: `btn-tactile-secondary` ve `btn-tactile-teal`

- [ ] **Step 3: StudentPassportModal dokunsal kabuğunu ve etiket çiplerini güncelle**
  - Modal çerçevesi: `rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E]`
  - Alerji & Diyet hapları (chips): Dokunsal basılabilir seçim hapları (`active:translate-y-[2px]`)
  - Form inputları, acil durum kişi kartları: Sıcak keten zeminler ve `#DDD4C4` sınırları
  - Kaydet / İptal butonları: `.btn-tactile-teal` ve `.btn-tactile-secondary`

- [ ] **Step 4: DailyReportEditorModal dokunsal kabuğunu ve karne çiplerini güncelle**
  - Modal çerçevesi: `rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E]`
  - Ruh hali (Mood) butonları: 3D ekstrüzyon gölgesi ve basılma efekti
  - Yemek porsiyon (ALL/HALF/LITTLE/NONE) butonları: Dokunsal hap formatı
  - Uyku ve aktivite seçimleri: Dokunsal haplar
  - İlaç listesi ve özel not inputları: `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4]`

- [ ] **Step 5: TypeScript kontrolü ve Commit**
  - Run: `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
  - Git commit: `refactor(admin-web): harmonize all modals with tactile claymorphism design system`

---

### Task 2: Yoklama Sayfası (`/attendance`) Dokunsal Finalizasyonu

**Files:**

- Modify: `apps/admin-web/src/features/attendance/AttendancePage.tsx`

**Interfaces:**

- Consumes: `StatCard` gölge tokenları (`shadow-[0_4px_0_0_#D5CBB9...]`), `btn-tactile-teal`, `btn-tactile-secondary`, `btn-tactile-amber`, `btn-tactile-danger`
- Produces: Dokunsal yoklama deneyimi

- [ ] **Step 1: Tarih seçici ve üst araç çubuğunu güncelle**
  - Tarih seçici barı: `bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 rounded-2xl`
  - "Tüm Sınıfı Geldi İşaretle" butonu: `.btn-tactile-teal`

- [ ] **Step 2: KPI filtre kartlarını dokunsal 3D ekstrüzyon standardına taşı**
  - Toplam, Mevcut, Teslim Edildi, İzinli, Gelmedi kartları: `rounded-3xl border-2 border-[#DCD4C6] dark:border-slate-800/90 shadow-[0_4px_0_0_#D5CBB9...] hover:-translate-y-1 active:translate-y-[3px] active:shadow-none`

- [ ] **Step 3: Arama kutusu ve görünüm değiştirme araç çubuğunu güncelle**
  - Arama alanı: `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl`
  - Tablo / Izgara görünüm butonları: Dokunsal hap geçişi

- [ ] **Step 4: Öğrenci kartları ve tablo içi durum butonlarını dokunsal haplara çevir**
  - Öğrenci kartları sabit kalır (`border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] shadow-2xs`)
  - "Geldi", "Çıkış / Teslim", "İzinli", "Gelmedi" butonları 3D basılabilir dokunsal pill (`btn-tactile-*` varyasyonları) haline getirilir

- [ ] **Step 5: TypeScript kontrolü ve Commit**
  - Run: `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
  - Git commit: `refactor(admin-web): finalize attendance page with tactile 3d components`

---

### Task 3: Günlük Yemek Menüsü Sayfası (`/menus`) Dokunsal Finalizasyonu

**Files:**

- Modify: `apps/admin-web/src/features/daily-menus/DailyMenuPage.tsx`

**Interfaces:**

- Consumes: `.btn-tactile-teal`, `.btn-tactile-danger`, `.btn-tactile-secondary`, `#DDD4C4`, `#FCFAF7`
- Produces: Dokunsal menü ve alerjen yönetim arayüzü

- [ ] **Step 1: Tarih seçici ve üst başlığı dokunsal palete uyarla**
  - Tarih seçici konteyneri ve butonları

- [ ] **Step 2: Öğün kartlarını ve metin giriş alanlarını güncelle**
  - Kahvaltı, Öğle, İkindi kartları: `#DDD4C4` sınır, `bg-white dark:bg-[#131B2E]`
  - Textarea alanları: `bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl`

- [ ] **Step 3: Alerjen seçim çiplerini 3D dokunsal seçim haplarına dönüştür**
  - `COMMON_ALLERGENS` butonları basıldığında çöken dokunsal haplar (`active:translate-y-[2px] active:shadow-none`)
  - Alerjen ekleme butonu ve input alanı: `btn-tactile-secondary`

- [ ] **Step 4: Sayfa altı kaydetme ve silme butonlarını dokunsal pill'e uyarla**
  - "Kreş Menüsünü Sil" (`btn-tactile-danger`), "Günün Menüsünü Kaydet" (`btn-tactile-teal`)

- [ ] **Step 5: TypeScript kontrolü ve Commit**
  - Run: `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
  - Git commit: `refactor(admin-web): finalize daily menu page with tactile design system`

---

### Task 4: Veli Portalı (`/portal`) Dokunsal Finalizasyonu

**Files:**

- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`

**Interfaces:**

- Consumes: `.btn-tactile-teal`, `.btn-tactile-secondary`, `#DDD4C4`, `#FCFAF7`
- Produces: Veliye özel dokunsal karne ve bilgilendirme deneyimi

- [ ] **Step 1: Çoklu çocuk sekmelerini ve tarih araç çubuğunu dokunsal yap**
  - Aktif çocuk: `btn-tactile-teal`
  - Pasif çocuk: `btn-tactile-secondary`
  - Tarih seçici: `bg-[#FCFAF7] border-[#DDD4C4]`

- [ ] **Step 2: Hero durum kartını ve alerji uyarı bandını uyarla**
  - Hero kartı: Yükseltilmiş derinlik ve dokunsal rozetler
  - Alerji uyarı kutusu: Sıcak amber dokunsal kart

- [ ] **Step 3: Günlük karne, yemek takibi ve uyku panellerini güncelle**
  - Karne kartı ve yemek porsiyon kutuları: `#DDD4C4` sınırları ve keten zeminler

- [ ] **Step 4: TypeScript kontrolü ve Commit**
  - Run: `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
  - Git commit: `refactor(admin-web): finalize parent dashboard with tactile claymorphism style`

---

### Task 5: Doğrulama, Testler ve Kalite Kontrolü

**Files:**

- Test: `apps/admin-web/src/features/attendance/AttendancePage.test.tsx`
- Test: `apps/admin-web/src/features/daily-menus/DailyMenuPage.test.tsx`
- Test: `apps/admin-web/src/features/parent/ParentDashboardPage.test.tsx`
- Check: `./scripts/check.ps1`

- [ ] **Step 1: Admin Web unit testlerini çalıştır**
  - Run: `pnpm --filter @kidscare/admin-web test:run`
  - Expected: Tüm testler yeşil geçer

- [ ] **Step 2: Monorepo tam doğrulama scriptini çalıştır**
  - Run: `./scripts/check.ps1`
  - Expected: Format, Lint, Typecheck ve Test adımları hatasız tamamlanır

- [ ] **Step 3: Şartnameyi done dizinine taşı ve son commit**
  - Move: `specs/active/0010-admin-web-tactile-pages-finalization.md` -> `specs/done/`
  - Git commit: `chore(specs): complete spec 0010 admin web tactile pages finalization`
