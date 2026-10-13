# Spec 0033: Veli İlaç Talebi & Öğretmen Doz Takibi Döngüsü Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Veli Portalı (`/portal`) üzerinden velilerin doğrudan ilaç talebi oluşturabilmesini, bu taleplerin anlık durumlarının (Onay Bekliyor, Verildi vb.) portaldan izlenebilmesini ve öğretmenlerin okulda tek tıkla "Verildi" onayı vermesini sağlamak.

**Architecture:**

- `ParentDashboardPage.tsx`: `listMedicationRecords` ve `createMedicationRecord` API'leri entegre edilir. Seçili çocuk için "+ İlaç Talebi Ekle" dokunsal butonu, talep oluşturma modalı ve canlı ilaç durumu kartları eklenir.
- `MedicationPage.tsx`: Öğretmen/Yönetici onay ve doz uygulama kontrolleri (`markMedicationGiven`) ile silme modalı teyidi doğrulanır.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Lucide React, Vitest, Testing Library.

---

### Task 1: Veli Portalı İlaç Talebi Modalı & Canlı Liste Entegrasyonu

**Files:**

- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`
- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.test.tsx`

- [x] **Step 1: Write failing test in ParentDashboardPage.test.tsx for medication request modal & list**
  - Butona tıklandığında modalın açıldığını, formun doldurulup submit edildiğinde yeni ilacın listeye düştüğünü test et.
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement medication request modal & standalone records in ParentDashboardPage.tsx**
  - `listMedicationRecords` ve `createMedicationRecord` çağrılarını bağla.
  - Dokunsal "+ İlaç Talebi Ekle" butonunu ve modal formunu yerleştir.
  - Canlı durum rozetlerini (REQUESTED, GIVEN vb.) render et.
- [x] **Step 4: Run test to verify it passes**

---

### Task 2: Öğretmen İlaç Yönetimi & Doz Doğrulama Testleri

**Files:**

- Modify: `apps/admin-web/src/features/medication/MedicationPage.test.tsx`

- [x] **Step 1: Write test verifying teacher "Verildi" administration flow in MedicationPage.test.tsx**
  - Öğretmenin veya yöneticinin ilacı "Verildi" olarak işaretlemesini ve saatin güncellenmesini doğrula.
- [x] **Step 2: Run test to verify it passes**

---

### Task 3: Kalite Kapısı, QA Matrisi & Arşivleme

- [x] **Step 1: Run complete check script (`./scripts/check.ps1`)**
- [x] **Step 2: Update `docs/qa-matrix.md` Senaryo 3.2 kontrol maddeleri ([x])**
- [x] **Step 3: Move spec to `specs/done/0033-parent-medication-request-and-dose-flow.md`**
- [x] **Step 4: Commit changes with descriptive commit message**
