# Şartname 0024: Mobile Uygulama Test Altyapısı Kurulumu

## 1. Amaç ve Kapsam

Bu şartname, `@kidscare/mobile` (Expo SDK 57 + React Native 0.86) için test altyapısının kurulmasını hedefler. Bugün mobile projede **hiç test dosyası yok**, `test` scripti tanımlı değil, vitest/jest config mevcut değil.

İlk hedef: en az bir örnek bileşen testi (`Card.test.tsx`) ile çalışan bir test ortamı sağlamak. Sonraki hedefler (kapsam dışı): ekran testleri, hook testleri, integration testleri.

## 2. Teknoloji Seçimi

- **Test runner:** `vitest` (admin-web ile tutarlı, monorepo standardı).
- **DOM:** `jsdom` (React Native bileşenleri için).
- **Rendering:** `@testing-library/react-native` (React Native için resmi Testing Library).
- **Mock:** `vitest`'in built-in `vi.mock` + RN modülleri (e.g. `react-native-safe-area-context`) için minimal mock.

## 3. Kurulum Adımları

1. `apps/mobile/package.json`:
   - `devDependencies`: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react-native`, `react-test-renderer`, `@types/react-test-renderer`.
   - `scripts`: `test: "vitest run"`, `test:watch: "vitest"`.
2. `apps/mobile/vitest.config.ts`: jsdom env, RN preset (mock react-native modülleri için setup).
3. `apps/mobile/src/test/setup.ts`: `@testing-library/react-native` uyumluluk import + RN modül mock'ları (e.g. `react-native-safe-area-context`).
4. Örnek test: `apps/mobile/src/components/Card.test.tsx` — render + basit etkileşim.

## 4. Kabul Kriterleri

1. `pnpm --filter @kidscare/mobile test` komutu çalışır.
2. En az 1 örnek test (`Card.test.tsx`) geçer.
3. ESLint temiz.
4. Mevcut yapı kırılmaz (mobile `start` scripti bozulmaz).

## 5. Kapsam Dışı

- Tüm mobil bileşenlerin test edilmesi (ileriki sprint).
- E2E testler (Detox/Maestro).
- API entegrasyon testleri (zaten `apps/api` kapsamında).
