# Plan: Spec 0035 — Negatif Validasyon ve Savunmacı UI Güçlendirmesi

> **Bağlantılı Şartname:** [specs/active/0035-negative-validation-and-defensive-ui-hardening.md](../active/0035-negative-validation-and-defensive-ui-hardening.md)  
> **Mod:** lite  
> **Kapsam:** `packages/shared-schemas`, `apps/admin-web/src/features/students`, `apps/admin-web/src/features/medication`, `apps/admin-web/src/features/pickup`

---

## 1. Mimari Tasarım ve Değişiklik Özeti

### Adım 1: Paylaşılan Zod Şeması Sertleştirmesi (`packages/shared-schemas`)

- `studentCreateSchema` ve `studentUpdateSchema` içinde `dateOfBirth` alanına refine eklenerek bugünden ileri bir tarih girilmesi engellenir (`dateOfBirth <= today`).
- İlgili birim testleri (`student.schema.spec.ts`) güncellenir ve sınır durumlar (bugün, geçmiş, yarın) doğrulanır.

### Adım 2: Öğrenci Formu ve Pasaport Modal Savunması (`apps/admin-web/src/features/students`)

- `StudentFormModal`:
  - `dateOfBirth` input alanına `max={new Date().toISOString().slice(0, 10)}` eklenir.
  - Form submit kontrolünde eğer gelecek tarih varsa form error basılır ve engellenir.
  - Submit butonunda `saving` anında `disabled` ve `isPending` kalkanı doğrulanır.
- `StudentPassportModal`:
  - Acil kişi eklerken telefon alanı için minimum format ve zorunlu alan kontrolü yapılır.
  - Uzun notlar ve alerji metinlerinde taşma koruması sağlanır.
- `StudentsPage`:
  - Fotoğraf veya avatar gösterimlerinde `onError` handler'ı ile kırık linklerde varsayılan KidsCare baş harf avatarına düşmesi güvenceye alınır.

### Adım 3: İlaç ve Teslimat Modalları Double Submit Koruması

- `MedicationRequestModal` & `MedicationPage`:
  - İlaç ekleme / onaylama sırasında çift tıklama engeli (`saving` durumunda buton disabled).
- `PickupContactModal` & `PickupPage`:
  - Yeni teslim yetkilisi eklerken isim ve telefon validasyonunun anlık kontrolü.
  - Submit işlemi sırasında buton kilitleme (`disabled={submitting}`).

### Adım 4: Toast Hata Entegrasyonu & 403 Koruması

- API çağrılarında yakalanan `ApiError` veya ağ hatalarında kullanıcıya kırmızı `showToast('...', 'error')` fırlatılır.

---

## 2. Test Stratejisi

- `packages/shared-schemas/src/student.schema.spec.ts`: Gelecek tarihli doğum tarihi reddi testi.
- `apps/admin-web/src/features/students/StudentsPage.test.tsx`: Gelecek doğum tarihi girdiğinde hata mesajı ve submit engelleme testi.
- `apps/admin-web/src/features/pickup/PickupPage.test.tsx`: Form validasyonu ve çift tıklama kilidi testi.

---

## 3. Doğrulama ve Çıkış Kriterleri

- `./scripts/check.ps1` hatasız yeşil tamamlanması.
- `docs/qa-matrix.md` Bölüm 4'ün teyit edilmesi.
- Spec dosyasının `specs/done/` dizinine taşınması.
