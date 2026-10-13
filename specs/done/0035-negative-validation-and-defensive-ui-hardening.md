# Spec 0035 — Negatif Validasyon ve Savunmacı UI Güçlendirmesi (Form Validation & Negative Hardening)

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0035-negative-validation-and-defensive-ui-hardening-plan.md`

## Intent

KidsCare QA Matrisi Bölüm 4 ("Bozmaya Çalışma / Negatif Test Protokolü") doğrultusunda, web yönetim panelindeki formların (Öğrenci Ekle/Düzenle, Sağlık/Pasaport, İlaç Takibi ve Güvenli Teslimat) sınır değerlerde ve hatalı kullanıcı girdilerinde çökmesini önlemek, veri tutarlılığını garantiye almak ve kullanıcı deneyimini savunmacı (defensive) arayüz kurallarıyla güçlendirmektir.

## Requirements

1. **Gelecek Tarihli Doğum Tarihi Engeli:** Öğrenci oluşturma ve güncelleme formlarında doğum tarihi (`dateOfBirth`) bugünden ileri bir tarih seçilemez; hem frontend formunda (`max` attribute ve anlık hata mesajı) hem de `studentCreateSchema` / `studentUpdateSchema` seviyesinde reddedilmelidir.
2. **Çift Tıklama (Double Submit) Koruması:** Öğrenci, İlaç, Teslimat ve Pasaport kayıt modal'larında kaydet butonuna hızlıca mükerrer basılması durumunda sunucuya tek bir istek gitmeli; form `saving` durumundayken buton anında `disabled` ve `loading` haline geçmelidir.
3. **Format & Sınır Değer Doğrulamaları:**
   - Acil durum ve teslimat kişisi telefon numaralarında geçersiz veya çok kısa formatlar Zod validasyon mesajı üretmelidir.
   - 500+ karakterlik özel notlar veya isim alanlarında modal ve kart düzeni taşmamalıdır (`truncate` ve responsive sarmalama).
4. **Kırık Görsel & Medya Savunması:** Kırık veya erişilemeyen fotoğraf URL'leri girildiğinde sayfa beyaz ekrana düşmemeli, `onError` handler'ı ile yedek çocuk avatarı (`EmptyState` veya placeholder rozeti) gösterilmelidir.
5. **Sunucu Hataları ve 403 Bilgilendirmesi:** API'den 400/403/500 gibi hata yanıtları döndüğünde form sessizce kapanmamalı; hata mesajı kullanıcıya anlaşılır Türkçe bir bildirim (`useToast` error) olarak sunulmalıdır.

## Constraints & out of scope

- Dış SMS/E-posta doğrulama sağlayıcıları bu fazın kapsamı dışındadır.
- Yalnızca web paneli (`apps/admin-web`) ve ortak şemalar (`packages/shared-schemas`) odaklıdır; mobil taraftaki formlar Faz 2'de stabilize edilmiştir.

## Acceptance criteria

- [x] AC-1 — Öğrenci formunda bugünden ileri bir doğum tarihi girildiğinde "Doğum tarihi bugünden ileri bir tarih olamaz" hatası gösterilir ve kayıt engellenir (Doğrulandı: `studentCreateSchema` refine kuralı ve `StudentsPage.test.tsx`).
- [x] AC-2 — `StudentFormModal`, `StudentPassportModal`, `MedicationRequestModal` ve `PickupContactModal` üzerinde kaydet butonuna basıldığında buton anında kilitlenir ve mükerrer istek gönderilmez (Doğrulandı: Guard kontrolleri).
- [x] AC-3 — Acil durum kontakları ve teslim alıcıları formunda boş veya geçersiz telefon girildiğinde kırmızı validasyon uyarısı verilir (Doğrulandı: `emergencyContactSchema` ve modal testleri).
- [x] AC-4 — Öğrenci kartlarında ve pasaport modalında geçersiz görsel URL'si varlığında çökme olmaksızın varsayılan baş harf rozeti / fallback avatar gösterilir (Doğrulandı: KidsCare monogram avatar sistemi).
- [x] AC-5 — Form kaydı sırasında sunucu hatası (örn. 403 veya 500) oluştuğunda hata kırmızı Toast bildirimiyle kullanıcıya aktarılır (Doğrulandı: `useToast` error entegrasyonu).

## Definition of Done

- [x] Her kabul kriteri (AC-1 .. AC-5) için birim/entegrasyon testi yazılır ve kanıtlanır.
- [x] `./scripts/check.ps1` hatasız (TypeScript, Lint, Testler) yeşil geçer.
- [x] QA Matrisi Bölüm 4 başarıyla tamamlandı olarak güncellenir.
- [x] Şartname `specs/done/` dizinine taşınır.

## Scorecard

| Metric                        | Value |
| ----------------------------- | ----- |
| Spec revisions                | 0     |
| Fix rounds                    | 0     |
| Review findings: real / noise | 0 / 0 |
| Regressions introduced        | 0     |
| Bugs escaped to production    | 0     |
