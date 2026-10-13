# Spec 0033 — Veli İlaç Verme Talebi & Öğretmen Doz Takibi Döngüsü (mini)

- Status: In progress
- Mode: lite
- Plan: `specs/plans/0033-parent-medication-request-and-dose-flow-plan.md`
- Source: `docs/qa-matrix.md` (Senaryo 3.2: İlaç Verme Talebi & Doz Takibi)
- Supersedes: None

## Intent

Veli, çocuğu için kreşe gitmeden önce veya gün içinde doğrudan Veli Portalı (`/portal`) üzerinden hızlıca ilaç teslim/kullanım talebi (örn. _Augmentin 200mg - Öğle yemeğinden sonra 1 ölçek_) oluşturabilmelidir. Öğretmen ve yöneticiler, İlaç Yönetimi (`/medication`) ekranında bu talebi anlık sarı rozetle görüp ilacı verdiklerinde tek tıkla onaylamalı ve veli portalındaki ilaç kartında durum anında yeşil _“✓ Verildi (Saat)”_ olarak güncellenmelidir.

## Changed behavior

- [ ] CB-1 — **Veli Portalı Hızlı İlaç Talebi Butonu & Modalı (`/portal`):** Veli portalında seçili çocuğun ilaç takip alanına dokunsal `+ İlaç Talebi Ekle` butonu eklenir; tıklandığında çocuğun adı önceden seçili gelen modal açılır ve `createMedicationRecord` API'sine istek atılarak talep kaydedilir.
- [ ] CB-2 — **Veli Portalı Bağımsız İlaç Kütüğü Görünürlüğü (`/portal`):** Veli portalında yalnızca günlük karneye bağlı ilaçlar değil, velinin açtığı anlık ilaç talepleri (`listMedicationRecords`) de gerçek zamanlı durumlarıyla (Sarı: _Onay Bekliyor_, Yeşil: _Verildi_, vb.) listelenir.
- [ ] CB-3 — **Öğretmen / Yönetici Doz Uygulama Onayı (`/medication`):** Öğretmen veya yönetici bekleyen ya da onaylanan ilacı verdiğinde "Verildi" işlemiyle `givenAt` saati kaydedilir ve durum yeşil _GIVEN_ statüsüne geçer.
- [ ] CB-4 — **Çift Onaylı Silme Güvenliği (Spec 0029 Uyumu):** İlaç kaydı silinmek istendiğinde teyitsiz silme engellenir; `DeleteConfirmationModal` ile açık onay alınır.

## Preserved behavior

- [ ] PB-1 — `/medication` sayfasındaki mevcut filtreleme, sekmeler (`TactileTabs`), alerji kalkanı (Spec 0032) ve yönetici onay akışları korunmalıdır.
- [ ] PB-2 — Veli portalındaki canlı yoklama, beslenme, uyku ve gelişim pasaportu kartları gerileme olmaksızın çalışmalıdır.

## Out of scope

- Mobil uygulama (`apps/mobile`) kodları kapsam dışıdır.
- Backend veritabanında yeni bir tablo eklenmeyecektir (mevcut `medication_records` API uçları kullanılacaktır).

## Definition of Done

- [ ] `specs/plans/0033-parent-medication-request-and-dose-flow-plan.md` adımları TDD ile tamamlandı.
- [ ] `./scripts/check.ps1` %100 yeşil (TypeScript, ESLint, Unit Testler).
- [ ] `docs/qa-matrix.md` içerisindeki Senaryo 3.2 kontrol maddeleri ([x]) olarak işaretlendi.
- [ ] Şartname `specs/done/0033-parent-medication-request-and-dose-flow.md` dizinine taşındı.
