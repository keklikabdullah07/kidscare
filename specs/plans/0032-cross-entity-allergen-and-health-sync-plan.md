# Spec 0032: Çapraz Varlık Alerji & Sağlık Güvenliği Senkronizasyonu Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Öğrenciye ait alerji ve sağlık pasaportu verilerini (`passport.allergies`, `passport.bloodType`), yoklama ekranı (tablo ve grid), ilaç yönetim formu/kartları ve veli portalı çocuk profilinde görsel uyarı kalkanlarıyla kesintisiz senkronize etmek.

**Architecture:**

- `AttendancePage.tsx`: Tablo ve Grid modlarında öğrenci alerji rozetine hover tooltip (`title`) ve kart rozetleri eklenir.
- `MedicationPage.tsx`: Modalda öğrenci seçildiğinde anlık alerjen uyarı kutusu (`AlertTriangle`) ve ilaç kartlarında alerji rozeti gösterilir.
- `ParentDashboardPage.tsx`: Seçili çocuk kartında kan grubu ve alerjileri gösteren dokunsal Sağlık & Alerji Kartı (`HealthPassportCard`) sunulur.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Lucide React, Vitest, Testing Library.

---

### Task 1: Yoklama Ekranı Alerji Bilgilendirmesi (`AttendancePage.tsx`)

**Files:**

- Modify: `apps/admin-web/src/features/attendance/AttendancePage.tsx`
- Modify: `apps/admin-web/src/features/attendance/AttendancePage.test.tsx`

- [x] **Step 1: Write the failing test for AttendancePage allergy display**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement allergy enhancements in AttendancePage.tsx**
- [x] **Step 4: Run test to verify it passes**

---

### Task 2: İlaç Ekranı Alerji Uyarı Kalkanı (`MedicationPage.tsx`)

**Files:**

- Modify: `apps/admin-web/src/features/medication/MedicationPage.tsx`
- Modify: `apps/admin-web/src/features/medication/MedicationPage.test.tsx`

- [x] **Step 1: Write failing test in MedicationPage.test.tsx for allergy warning box**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement allergen alert box and card badge in MedicationPage.tsx**
- [x] **Step 4: Run test to verify it passes**

---

### Task 3: Veli Portalı Sağlık & Alerji Kartı (`ParentDashboardPage.tsx`)

**Files:**

- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`
- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.test.tsx`

- [x] **Step 1: Write failing test in ParentDashboardPage.test.tsx for health passport display**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement Health Passport Card in ParentDashboardPage.tsx**
- [x] **Step 4: Run test to verify it passes**

---

### Task 4: Doğrulama, QA Matrisi & Handoff

- [x] **Step 1: Run complete check script (`./scripts/check.ps1`)**
- [x] **Step 2: Update `docs/qa-matrix.md` Senaryo 3.1 maddeleri ([x])**
- [x] **Step 3: Move spec to `specs/done/0032-cross-entity-allergen-and-health-sync.md`**
- [x] **Step 4: Commit changes with descriptive commit message**
