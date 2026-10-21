# Spec 0064 — Veli Talepleri Sayfası KPI Kartı Temizliği ve UX Sadeleştirmesi

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0064-plan.md`
- Shipped: 2026-10-21

## Intent

`ParentRequestsPage.tsx` sayfasında şu an iki ayrı bileşen grubu **birebir aynı filtreleme ve sayaç görevini** yapmaktadır:

1. **Üstteki 4 adet StatCard:** "TOPLAM TALEP (2)", "BEKLEYENLER (0)", "ONAYLANANLAR (2)", "REDDEDİLENLER (0)". Tıklandığında `setActiveTab(...)` çağırmaktadır.
2. **Alttaki TactileTabs (Sekmeler):** `[ Tüm Talepler 2 ]`, `[ Bekleyenler 0 ]`, `[ Onaylananlar 2 ]`, `[ Reddedilenler 0 ]`. Tıklandığında `setActiveTab(...)` çağırmaktadır.

Bu durum arayüzde ciddi bir **UX israfı, bilişsel yük ve dikey ekran alanı kaybına (~150px)** yol açmaktadır. `TactileTabs` dokunsal butonları aktif durumu (örn. kırmızı "Reddedilenler 0" butonu) çok daha şık, belirgin ve konsol kartıyla bütünleşik göstermektedir.

Bu şartname:

1. `ParentRequestsPage.tsx` üzerindeki gereksiz 4 adet `StatCard` bileşenini ve kullanılmayan importları (`StatCard`, `Inbox`, `Clock`, `CheckCircle2`, `XCircle`) kaldırır.
2. Kullanıcının doğrudan talepler listesine odaklanmasını sağlayarak sayfa yüksekliğini ve görsel hiyerarşiyi optimize eder.
3. İlgili tüm testlerin ve tip denetimlerinin yeşil kalmasını sağlar.

---

## Requirements

### 1. KPI Kartlarının Kaldırılması (`ParentRequestsPage.tsx`)

- `PageHeader` bileşeninin hemen altındaki `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">...</div>` bloğu tamamen kaldırılır.
- `StatCard` import'u ve yalnızca bu kartlarda kullanılan ikon importları temizlenir.
- `PageHeader` doğrudan Bütünleşik Konsol Kartı'na bağlanır.

---

## Acceptance Criteria

- [x] AC-1: `ParentRequestsPage` üzerinde mükerrer çalışan 4 adet `StatCard` kartı bulunmaz; durum filtrelemesi ve sayaç gösterimi yalnızca `TactileTabs` üzerinden yürütülür.
- [x] AC-2: Sayfadaki kullanılmayan importlar (`StatCard`, `Inbox` vb.) temizlenir ve sıfır lint uyarısı sağlanır.
- [x] AC-3: `ParentRequestsPage.adaptive.test.tsx` ve diğer ilgili vitest testleri ile `tsc --noEmit` hatasız geçer.

## Proof

- **Commit:** `c1f2600` — `refactor(web): remove redundant StatCards in ParentRequestsPage in favor of TactileTabs`
- **tsc:** clean (no output)
- **vitest:** `src/features/messages/ParentRequestsPage.adaptive.test.tsx` → 2/2 pass
- **Diff:** 1 file changed, 57 deletions(-)
