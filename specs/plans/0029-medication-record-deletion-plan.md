# Uygulama Planı 0029: İlaç Kaydı Silme Özelliği

## 1. Görev Özeti

İlaç kütüğünde kayıtların (taleplerin ve kayıtların) güvenli, yetkilendirilmiş ve dokunsal onay mekanizmasıyla silinebilmesi için backend, frontend ve ortak API katmanlarında geliştirmelerin yapılması.

## 2. Adım Adım Yapılacaklar

### Adım 1: Backend Repository & Service & Controller Geliştirmesi

- Dosyalar:
  - `apps/api/src/modules/medication/repositories/medication.repository.ts`
  - `apps/api/src/modules/medication/services/medication.service.ts`
  - `apps/api/src/modules/medication/controllers/medication.controller.ts`
- Yapılacaklar:
  - Repository'ye `delete(tenantId: string, id: string): Promise<boolean>` ekle.
  - Service'e `delete(tenantId: string, id: string, user: CurrentUserPayload): Promise<void>` ekle (Tenant, Role ve GIVEN kontrolleri ile).
  - Controller'a `@Delete('records/:id')` endpoint'i ekle (`@Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')`).
  - Unit testleri (`medication.service.spec.ts`) güncelle ve doğrula.

### Adım 2: Frontend API İstemcisi & Web Arayüzü Geliştirmesi

- Dosyalar:
  - `apps/admin-web/src/api/medication.ts`
  - `apps/admin-web/src/features/medication/MedicationPage.tsx`
  - `apps/admin-web/src/features/medication/MedicationPage.test.tsx`
- Yapılacaklar:
  - `deleteMedicationRecord(id: string)` API fonksiyonunu ekle.
  - `MedicationPage.tsx` içinde her bir ilaç kartına yetkiye bağlı silme butonu ekle.
  - Silme öncesi kullanıcı onay modalı (`confirmDelete` state veya `PromptModal` benzeri onay penceresi) ile yanlış basımları engelle.
  - Silme başarılı olduğunda Toast uyarısı ver ve listeyi yenile.
  - `MedicationPage.test.tsx` içine silme butonu ve silme akışı testlerini ekle.

### Adım 3: Mobil API İstemcisi Senkronizasyonu

- Dosyalar:
  - `apps/mobile/src/api/medication.ts`
- Yapılacaklar:
  - `deleteMedicationRecord(id: string)` fonksiyonunu ekle.

### Adım 4: Doğrulama ve Test Kanıtı

- Backend testlerini koştur: `pnpm --filter @kidscare/api test`
- Web testlerini koştur: `pnpm --filter @kidscare/admin-web test`
- Tip kontrolü: `pnpm --filter @kidscare/admin-web exec tsc --noEmit`
- Tam sistem denetimi: `./scripts/check.ps1`
