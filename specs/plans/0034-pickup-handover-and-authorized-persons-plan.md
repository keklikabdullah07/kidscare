# Spec 0034: Güvenli Teslimat (Pickup Handover) & Yetkili Alıcı Yönetimi Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Veli portalında yetkili teslim alıcı ekleme/yönetme, öğretmen teslimat ekranında yetkili kişileri gösterme ve tanımsız kişi geldiğinde anlık yetkisiz kişi güvenlik uyarısı vererek güvenli teslimat sağlama.

**Architecture:**

- `ParentDashboardPage.tsx`: `listPickupAuthorizations`, `createPickupContact` ve `createPickupAuthorization` entegrasyonu; yetkili teslim alıcı kartı ve modal formu.
- `PickupPage.tsx`: Öğrencinin onaylı teslim alıcılarını teslimat modalında hızlı seçim listesi olarak sunma ve listede olmayan kişi girildiğinde anlık yetkisiz kişi uyarı kalkanı (`data-testid="unauthorized-pickup-warning"`).

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, Lucide React, Vitest, Testing Library.

---

### Task 1: Veli Portalı Yetkili Teslim Alıcı Yönetimi

**Files:**

- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.tsx`
- Modify: `apps/admin-web/src/features/parent/ParentDashboardPage.test.tsx`

- [x] **Step 1: Write failing test in ParentDashboardPage.test.tsx for authorized pickup contact modal & list**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement authorized pickup contact card & modal in ParentDashboardPage.tsx**
- [x] **Step 4: Run test to verify it passes**

---

### Task 2: Öğretmen Teslimat Modalı Yetkisiz Kişi Uyarı Kalkanı & Kütük Doğrulaması

**Files:**

- Modify: `apps/admin-web/src/features/pickup/PickupPage.tsx`
- Modify: `apps/admin-web/src/features/pickup/PickupPage.test.tsx`

- [x] **Step 1: Write failing test in PickupPage.test.tsx for unauthorized pickup person warning and quick selection**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement quick select & unauthorized person warning banner in PickupPage.tsx**
- [x] **Step 4: Run test to verify it passes**

---

### Task 3: Kalite Kapısı, QA Matrisi & Arşivleme

- [x] **Step 1: Run complete check script (`./scripts/check.ps1`)**
- [x] **Step 2: Update `docs/qa-matrix.md` Senaryo 3.3 kontrol maddeleri ([x])**
- [x] **Step 3: Move spec to `specs/done/0034-pickup-handover-and-authorized-persons.md`**
- [x] **Step 4: Commit changes with descriptive commit message**
