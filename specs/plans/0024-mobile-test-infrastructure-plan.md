# Uygulama Planı 0024: Mobile Test Altyapısı

## Adımlar

### 1. `apps/mobile/package.json` güncelleme

- `devDependencies` ekleme:
  - `vitest`
  - `@vitest/ui` (opsiyonel)
  - `jsdom`
  - `@testing-library/react-native`
  - `react-test-renderer`
  - `@types/react-test-renderer`
- `scripts` ekleme:
  - `test: "vitest run"`
  - `test:watch: "vitest"`

### 2. `apps/mobile/vitest.config.ts`

- jsdom environment.
- `setupFiles: ['./src/test/setup.ts']`.
- `resolve.alias` (gerekiyorsa): `@` → `src`.

### 3. `apps/mobile/src/test/setup.ts`

- `@testing-library/react-native` uyumluluk import.
- RN modül mock'ları: `react-native-safe-area-context`, `expo-status-bar` (jest-expo ile aynı kalıp).

### 4. Örnek test `apps/mobile/src/components/Card.test.tsx`

- `Card` bileşenini render et, başlık + çocuk metin doğrula.

## Doğrulama

```powershell
pnpm --filter @kidscare/mobile test
pnpm exec eslint apps/mobile/src/components/Card.test.tsx
```

## Riskler

- React 19.2 + RN 0.86 + RNTL uyum sorunları olabilir (peer dependency). Çözüm: `--legacy-peer-deps` veya override.
- `react-test-renderer` eski sürüm gerekebilir.

## Commit

- Tek commit: `chore(mobile): setup vitest + RNTL test infrastructure`
