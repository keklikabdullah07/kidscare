# KidsCare Test Stratejisi (Testing Strategy)

Bu belge, KidsCare projesinde test piramidinin nasıl uygulandığını, hangi katmanda hangi araçların kullanıldığını ve kalite güvence (QA) süreçlerini tanımlar.

---

## 1. Test Piramidi Dağılımı

```
          /\
         /  \        E2E Testler (Playwright) — %10 (En kritik kullanıcı akışları)
        /----\
       /      \      Entegrasyon Testleri (Supertest + Prisma) — %20 (API & Guard)
      /--------\
     /          \    Birim (Unit) Testleri (Jest / Vitest) — %70 (İş mantığı, hesaplamalar)
    /------------\
```

---

## 2. Katman Bazlı Test Yaklaşımı

### 1. Backend Testleri (`apps/api`)

- **Unit Testler:** Servis fonksiyonlarının iş mantığı, devamsızlık oranları, karne doğrulama fonksiyonları.
- **Entegrasyon Testleri:**
  - `TenantGuard`: Farklı bir kreşin token'ı ile istek atıldığında `403 Forbidden` dönmesi doğrulanır.
  - `AuthService`: Şifre hashleme, JWT üretimi ve yetkisiz erişim denetimi.

### 2. Web Paneli Testleri (`apps/admin-web`)

- **Playwright E2E Testleri:**
  - _Admin Akışı:_ Giriş -> Yeni öğrenci ekle -> Öğrenci listesinde doğrula.
  - _Öğretmen Akışı:_ Giriş -> Sınıf yoklaması al -> Kaydet -> Başarı toast mesajı gör.
  - _Veli Akışı:_ Giriş -> Kendi çocuğunu gör -> Günlük karne detaylarını incele. Başka öğrencinin verisine erişilemediğini doğrula.

### 3. Mobil Uygulama Testleri (`apps/mobile`)

- API İstemci Testleri: BaseURL doğrulaması, `Authorization` başlığı enjeksiyonu, hata yakalama (`ApiError`).

---

## 3. Test Yazım Disiplini: AAA Kuralı

Tüm testler istisnasız **Arrange - Act - Assert** düzenine uyar:

```ts
test('Öğrenci devamsızlığı doğru hesaplanmalı', () => {
  // 1. Arrange (Hazırla)
  const stats = { total: 20, attended: 18 };

  // 2. Act (Çalıştır)
  const rate = calculateAbsenceRate(stats);

  // 3. Assert (Doğrula)
  expect(rate).toBe(10);
});
```

---

## 4. Tek Komutla Kalite Kapısı (`scripts/check`)

Geliştirici veya AI agent, bir işi teslim etmeden önce kalite kapısını çalıştırmak zorundadır:

```bash
# Windows PowerShell için:
./scripts/check.ps1

# Linux / Mac / CI için:
./scripts/check
```

Bu betik sırasıyla şunları doğrular:

1. **Tip Kontrolü (TypeScript):** Sıfır hata.
2. **Linter (ESLint):** Sözdizimi ve kod kuralı ihlali yok.
3. **Testler (Jest/Vitest/Playwright):** Tüm testler yeşil.
