# 0043 — Aidat, Tahsilat & Borç Takip Modülü Uygulama Planı

> **İlgili Şartname:** `specs/active/0043-tuition-and-billing-management.md`  
> **Kapsam:** Veritabanı (`packages/database`), Paylaşılan Tipler (`packages/shared-types`, `shared-schemas`), Backend API (`apps/api`), Web Paneli (`apps/admin-web`)  
> **Durum:** 📋 Onaylandı — Yeni sohbette doğrudan uygulanacak.

---

## 1. Mimari Genel Bakış

Kreşlerin ticari can damarı olan aidat ve tahsilat takibini sağlamak amacıyla, Vertical Slice Architecture (VSA) prensiplerine uygun, multi-tenant izoleli bir `FinanceModule` kurulacaktır.

```
[Prisma Modelleri] ──> [Shared Types & Schemas] ──> [API FinanceModule] ──> [Admin Web /finance]
(StudentBillingPlan)   (Zod validasyonları)         (Repository + Service)    (KPI + 3 TactileTab)
(BillingInvoice)                                    (@Inject kuralları)       (Hızlı Tahsilat Modalı)
(PaymentTransaction)                                                          (Veli Portalı Görünümü)
```

---

## 2. Adım Adım Uygulama Planı

### Adım 1: Veritabanı Modelleri (`packages/database/prisma/schema.prisma`)

1. **Enum Tanımları:**
   - `InvoiceStatus`: `PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`
   - `PaymentMethod`: `CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `OTHER`
2. **`StudentBillingPlan` Modeli:**
   - `id`, `tenantId`, `studentId`, `tuitionAmount` (Float), `serviceAmount` (Float default 0), `activityAmount` (Float default 0), `discountPercent` (Float default 0), `dueDayOfMonth` (Int default 5), `notes`, `isActive` (Boolean default true), `createdAt`, `updatedAt`
3. **`BillingInvoice` Modeli:**
   - `id`, `tenantId`, `studentId`, `period` (String, örn "2026-10"), `totalAmount` (Float), `paidAmount` (Float default 0), `dueDate` (DateTime), `status` (InvoiceStatus default PENDING), `notes`, `createdAt`, `updatedAt`
4. **`PaymentTransaction` Modeli:**
   - `id`, `tenantId`, `invoiceId`, `studentId`, `amount` (Float), `method` (PaymentMethod), `paidAt` (DateTime default now), `referenceNo` (String?), `notes` (String?), `recordedByUserId` (String), `createdAt`
5. `prisma migrate dev` çalıştırılarak şemanın PostgreSQL'e yansıtılması ve Prisma client üretimi.

---

### Adım 2: Paylaşılan Tipler ve Şemalar (`packages/shared-types`, `shared-schemas`)

1. **`shared-types`:**
   - `StudentBillingPlan`, `BillingInvoice`, `PaymentTransaction` tipleri.
   - `FinanceSummaryStats` (bu ay beklenen, tahsil edilen, geciken borç, tahsilat oranı %).
   - `CreateBillingPlanInput`, `RecordPaymentInput`, `CreateInvoiceInput`.
2. **`shared-schemas`:**
   - `billingPlanSchema`, `recordPaymentSchema`, `invoiceCreateSchema` Zod şemaları.

---

### Adım 3: Backend API Katmanı (`apps/api/src/modules/finance/`)

> **Zorunlu AGENTS.md Kuralı:** Tüm servis ve repository sınıflarının constructor'larında açıkça `@Inject(...)` kullanılmalıdır.

1. **`FinanceRepository`:**
   - `withTenant` korumasıyla faturaları, ödeme planlarını ve tahsilatları sorgulama/yazma.
   - KPI istatistik sorguları (aylık tahakkuk, tahsilat, gecikmeler).
2. **`FinanceService`:**
   - Otomatik veya manuel fatura oluşturma.
   - Tahsilat girişi yapıldığında faturanın `paidAmount` ve `status` (`PAID` veya `PARTIALLY_PAID`) değerini atomik güncelleme.
   - Geciken faturaları tespit etme (`OVERDUE`).
   - Hatırlatma bildirimi tetikleme (`NotificationsService` veya veli mesajı).
3. **`FinanceController`:**
   - `@UseGuards(TenantGuard)`
   - `GET /finance/stats`: Ayın özet KPI'ları (Admin).
   - `GET /finance/invoices`: Filtrelenebilir fatura listesi (Admin).
   - `POST /finance/payments`: Hızlı tahsilat girişi (Admin).
   - `GET /finance/plans`: Öğrenci aidat planları (Admin).
   - `POST /finance/plans`: Öğrenciye aidat planı oluşturma/güncelleme (Admin).
   - `GET /finance/my-child`: Velinin kendi çocuğuna ait faturaları görmesi (Parent).

---

### Adım 4: Frontend API İstemcisi (`apps/admin-web/src/api/finance.ts`)

- `getFinanceStats()`, `listInvoices()`, `recordPayment()`, `listBillingPlans()`, `saveBillingPlan()`, `sendPaymentReminder()`, `getMyChildBilling()`.

---

### Adım 5: Web UI Katmanı (`apps/admin-web/src/features/finance/FinancePage.tsx`)

1. **Sol Navigasyon Entegrasyonu:**
   - Admin ve Veli sol menüsüne `💰 Aidat & Finans` menü öğesi eklenmesi.
2. **Admin Görünümü (`FinancePage.tsx`):**
   - **4 Dokunsal KPI Kartı:**
     1. `Bu Ay Beklenen Toplam` (Örn: ₺320.000)
     2. `Tahsil Edilen Tutar` (Örn: ₺245.000)
     3. `Geciken Borç Tutarı` (Örn: ₺75.000 - kırmızı rozet)
     4. `Tahsilat Oranı` (%76.5)
   - **3 Dokunsal Sekme (`<TactileTabs />`):**
     1. **🚨 Geciken Ödemeler:** Vadesi geçen öğrenciler, gecikme gün sayısı ve tek tıkla `💬 Hatırlatma Gönder` butonu.
     2. **📋 Tahsilat & Fatura Listesi:** Hızlı arama, öğrenci/sınıf filtresi, durum rozetleri ve `+ Tahsilat Al` modalı.
     3. **⚙️ Öğrenci Ücret Planları:** Her öğrencinin tanımlı aylık aidatı, servis/indirim bilgisi ve düzenleme modalı.
3. **Veli Görünümü:**
   - Çocuğun güncel ay aidat durumu, kalan bakiye, ödeme geçmişi ve makbuz dökümü.

---

### Adım 6: Doğrulama ve Kalite Kapısı

1. Birim testleri (`finance.controller.spec.ts`, `finance.service.spec.ts`).
2. `./scripts/check.ps1` (%100 yeşil kalite kapısı: tsc + lint + test).
3. Yerel commit ve `origin/developer` dalına pushlama.
