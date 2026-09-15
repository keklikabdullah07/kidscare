import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nx/**',
      '**/.next/**',
      '**/.expo/**',
      '**/eslint.config.mjs',
      '**/next-env.d.ts',
      '**/next.config.mjs',
      '**/babel.config.js',
      '**/app.json',
      '**/package.json',
      'packages/**/src/generated/**',
      'packages/**/prisma/**',
      'scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // `expect(repo.method).toHaveBeenCalledWith(...)` references a jest
      // mock method; the unbound-method rule fires on the property access
      // even though jest.fn() never uses `this`. Off for all spec files.
      '@typescript-eslint/unbound-method': 'off',
      // Mocks carry `any` from the library callback types; the unsafe-*
      // family fires pervasively in unit tests with no real risk.
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  prettier,
];
