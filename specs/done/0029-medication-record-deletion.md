# Şartname 0029: İlaç Kaydı Silme Özelliği (Medication Record Deletion)

## 1. Amaç ve Kapsam

KidsCare sisteminde veliler veya yöneticiler tarafından eklenen ilaç kullanım taleplerinin/kayıtlarının gerektiğinde (hatalı giriş, doktor reçete iptali, veli vazgeçmesi vb.) güvenli bir şekilde silinebilmesini sağlamak.

## 2. Roller ve Yetkilendirme Kuralları

- **SUPER_ADMIN & ADMIN**:
  - Kreşteki tüm ilaç kayıtlarını silebilir.
- **PARENT (Veli)**:
  - Sadece kendi oluşturduğu (`requestedById === user.userId`) ve henüz verilmemiş (`status !== 'GIVEN'`) ilaç taleplerini silebilir. Çocuğa kreşte verilmiş (`GIVEN`) bir ilacı veli silemez (tıbbi kayıt güvenliği ve hesap verebilirlik).
- **TEACHER (Öğretmen)**:
  - İlaç uygulama/atlama yetkisine sahiptir ancak ilaç talebini silme yetkisi yoktur.

## 3. Mimari ve Değişiklik Detayları

### 3.1 Backend (`apps/api`)

1. **`IMedicationRepository` & `MedicationRepository`**:
   - `delete(tenantId: string, id: string): Promise<boolean>` metodu.
   - `client.medicationRecord.deleteMany({ where: { tenantId, id } })` ile multi-tenant izolasyonlu silme.
2. **`MedicationService`**:
   - `delete(tenantId: string, id: string, user: CurrentUserPayload): Promise<void>`
   - Kayıt bulunamadığında `NotFoundException`.
   - Veli için yetki ve durum kontrolü (`ForbiddenException` & `BadRequestException`).
3. **`MedicationController`**:
   - `@Delete('records/:id')`
   - `@Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')`
   - `@HttpCode(204)`

### 3.2 Frontend (`apps/admin-web`)

1. **`src/api/medication.ts`**:
   - `deleteMedicationRecord(id: string): Promise<void>`
2. **`src/features/medication/MedicationPage.tsx`**:
   - İlaç kartına silme butonu (`Trash2`, dokunsal buton, kırmızı/tehlike temalı).
   - Yanlışlıkla basılmasını önlemek için silme onay modalı/diyaloğu.
   - Silme işlemi tamamlandığında başarı tostu gösterilmesi ve tablonun/listenin güncellenmesi.
3. **`src/features/medication/MedicationPage.test.tsx`**:
   - Silme butonunun render edildiğini ve tıklandığında silme API'sinin çağrıldığını doğrulayan testler.

### 3.3 Mobil API (`apps/mobile`)

1. **`src/api/medication.ts`**:
   - `deleteMedicationRecord(id: string): Promise<void>` fonksiyonunun eklenmesi.

## 4. Başarı Kriterleri & Kanıtlar

- Backend birim ve entegrasyon testlerinin (`medication.service.spec.ts`) yeşil geçmesi.
- Admin web birim testlerinin (`MedicationPage.test.tsx`) yeşil geçmesi.
- TypeScript derleme kontrolünün (`tsc --noEmit`) 0 hata vermesi.
- `./scripts/check.ps1`'in başarıyla tamamlanması.
