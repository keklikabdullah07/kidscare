# Spec 0048 — Veli Günlük Takip / Karne Bilgi Sadakati ve Detay Zenginleştirmesi (mini)

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0048-plan.md`
- Source: USER_REQUEST_20261017_DAILY_REPORT_PARENT_FIDELITY

## Intent

Öğretmenin girdiği günlük karne bilgilerinin (uyku durumu, uyku notu, bez/tuvalet saatleri ve türleri, beslenme özel notları) veli ekranında sansürlenmeden ve eksiksiz olarak gösterilmesini sağlamak. "Uyumadı" seçeneğinin "Belirtilmedi" ile karıştırılmasını önlemek, bez/tuvalet ve beslenme detaylarını veliye şeffaf şekilde aktarmak.

## Changed behavior

- [x] CB-1 — **Açık ve Kesin Uyku Durumu:**
  - `naps.quality === 'NONE'` durumunda açıkça "Uyumadı" rozeti gösterilir ("Uyumadı / Belirtilmedi" belirsizliği kaldırılır).
  - `naps.quality === 'INTERRUPTED'` durumunda "Bölünmüş / Huzursuz Uyku" rozeti gösterilir.
  - `naps.quality === 'GOOD'` veya saat aralığı (`startTime - endTime`) olan durumlarda uyku süresi ve kalitesi net verilir.
  - Varsa öğretmenin girdiği `naps.notes` (uyku açıklaması) uyku kartı altında gösterilir.
  - Hiçbir uyku verisi girilmemişse "Henüz girilmedi" (nötr) gösterilir.
- [x] CB-2 — **Ayrıntılı Tuvalet & Bez Zaman Çizelgesi:**
  - Sadece "X kayıt" yazısı yerine saat ve tür içeren çipler gösterilir (`10:30 💧 Çişli Bez`, `13:45 💩 Kaka`, `15:00 🚽 Tuvalet`, `⚠️ Kaçırdı`).
  - Varsa tuvalet notları gösterilir.
- [x] CB-3 — **Beslenme Notu (`meals.notes`):**
  - Öğün porsiyonlarının altında öğretmenin yazdığı özel beslenme notu veliye kart olarak sunulur.
- [x] CB-4 — **Web & Mobil Paritesi:**
  - Aynı zengin gösterim hem Web veli panelinde (`ParentDashboardPage.tsx`) hem de Mobil ana ekranında (`ParentHomeScreen.tsx`) eksiksiz uygulanır.

## Preserved behavior

- [x] PB-1 — Öğretmen ve admin günlük takip giriş ekranları (`DailyTrackingPage.tsx`, `DailyReportEditorModal.tsx`) ve veri modelleri geriye dönük tam uyumlu kalır.
- [x] PB-2 — Genel öğretmen notu (`teacherNote`), duygu durumu (`mood`), porsiyonlar ve günün aktiviteleri mevcut görsel düzenini korur.

## Out of scope

- Öğretmen karne giriş formundaki veri yapısını değiştirmek (Zaten Prisma şeması ve `DailyReport` tipi tüm bu alanları desteklemektedir).
- Yeni karne alanı icat etmek.

## Definition of Done

- [x] `scripts/check.ps1` %100 yeşil (TypeScript, ESLint, Unit Tests).
- [x] Web ve Mobil testleri güncellenir ve geçer.
- [x] Şartname `specs/done/` dizinine taşınır.
