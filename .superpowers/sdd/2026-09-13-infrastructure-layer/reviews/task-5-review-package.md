=== git log ===
9d2ce7d feat(database): Prisma schema skeleton with Tenant and User models

=== git diff --stat (excluding generated client) ===
.lintstagedrc.json | 2 +-
eslint.config.mjs | 10 +
package.json | 1 +
packages/database/eslint.config.mjs | 8 +
packages/database/jest.config.ts | 9 +
packages/database/package.json | 22 ++
packages/database/prisma/schema.prisma | 52 +++++
packages/database/project.json | 15 ++
packages/database/tsconfig.json | 5 +
pnpm-lock.yaml | 358 +++++++++++++++++++++++++++++++++
10 files changed, 481 insertions(+), 1 deletion(-)

=== git diff -U10 (excluding generated client) ===
diff --git a/.lintstagedrc.json b/.lintstagedrc.json
index 8b178a6..2b5437d 100644
--- a/.lintstagedrc.json
+++ b/.lintstagedrc.json
@@ -1,3 +1,3 @@
{

- "*.{ts,tsx,js,mjs,json,md,prisma}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]

* "*.{ts,tsx,js,mjs,json,md}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]
  }
  diff --git a/eslint.config.mjs b/eslint.config.mjs
  index cd145b2..bbaa06c 100644
  --- a/eslint.config.mjs
  +++ b/eslint.config.mjs
  @@ -1,15 +1,25 @@
  import js from '@eslint/js';
  import tseslint from 'typescript-eslint';
  import prettier from 'eslint-config-prettier';

export default [

- {
- ignores: [
-      '**/node_modules/**',
-      '**/dist/**',
-      '**/.nx/**',
-      '**/eslint.config.mjs',
-      'packages/**/src/generated/**',
-      'packages/**/prisma/migrations/**',
- ],
- },
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
  diff --git a/package.json b/package.json
  index 65abc03..33c8883 100644
  --- a/package.json
  +++ b/package.json
  @@ -29,15 +29,16 @@
  "@nx/jest": "^19.8.14",
  "@types/jest": "^30.0.0",
  "@types/node": "^20.0.0",
  "eslint": "^9.0.0",
  "eslint-config-prettier": "^10.1.8",
  "husky": "^9.1.7",
  "jest": "^30.5.1",
  "lint-staged": "^17.5.1",
  "nx": "^19.0.0",
  "prettier": "^3.9.6",
- "prisma": "^5.10.0",
  "ts-jest": "^29.4.12",
  "typescript": "^5.4.0",
  "typescript-eslint": "^8.70.0"
  }
  }
  diff --git a/packages/database/eslint.config.mjs b/packages/database/eslint.config.mjs
  new file mode 100644
  index 0000000..cb5baf2
  --- /dev/null
  +++ b/packages/database/eslint.config.mjs
  @@ -0,0 +1,8 @@
  +import rootConfig from '../../eslint.config.mjs';
-

+export default [

- ...rootConfig,
- {
- ignores: ['src/generated/**', 'prisma/migrations/**'],
- },
  +];
  diff --git a/packages/database/jest.config.ts b/packages/database/jest.config.ts
  new file mode 100644
  index 0000000..5a81ff6
  --- /dev/null
  +++ b/packages/database/jest.config.ts
  @@ -0,0 +1,9 @@
  +import type { Config } from 'jest';
-

+const config: Config = {

- preset: 'ts-jest',
- testEnvironment: 'node',
- testMatch: ['<rootDir>/src/**/*.spec.ts'],
  +};
-

+export default config;
diff --git a/packages/database/package.json b/packages/database/package.json
new file mode 100644
index 0000000..f4da90a
--- /dev/null
+++ b/packages/database/package.json
@@ -0,0 +1,22 @@
+{

- "name": "@kidscare/database",
- "version": "0.0.0",
- "private": true,
- "main": "src/index.ts",
- "types": "src/index.ts",
- "scripts": {
- "prisma": "prisma",
- "db:seed": "prisma db seed"
- },
- "prisma": {
- "seed": "tsx prisma/seed.ts"
- },
- "dependencies": {
- "@kidscare/tenant-context": "workspace:*",
- "@prisma/client": "^5.22.0"
- },
- "devDependencies": {
- "prisma": "^5.10.0",
- "tsx": "^4.7.0"
- }
  +}
  diff --git a/packages/database/prisma/schema.prisma b/packages/database/prisma/schema.prisma
  new file mode 100644
  index 0000000..9bdbb18
  --- /dev/null
  +++ b/packages/database/prisma/schema.prisma
  @@ -0,0 +1,52 @@
  +generator client {
- provider = "prisma-client-js"
- output = "../src/generated/client"
  +}
-

+datasource db {

- provider = "postgresql"
- url = env("DATABASE_URL")
  +}
-

+enum UserRole {

- ADMIN
- TEACHER
- PARENT
  +}
-

+enum TenantStatus {

- ACTIVE
- SUSPENDED
- DELETED
  +}
-

+model Tenant {

- id String @id @default(cuid())
- slug String @unique
- name String
- status TenantStatus @default(ACTIVE)
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- users User[]
-
- @@map("tenants")
  +}
-

+model User {

- id String @id @default(cuid())
- tenantId String
- email String
- passwordHash String
- role UserRole
- isActive Boolean @default(true)
- lastLoginAt DateTime?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
-
- @@unique([tenantId, email])
- @@index([tenantId])
- @@map("users")
  +}
  diff --git a/packages/database/project.json b/packages/database/project.json
  new file mode 100644
  index 0000000..502d5a4
  --- /dev/null
  +++ b/packages/database/project.json
  @@ -0,0 +1,15 @@
  +{
- "name": "database",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "packages/database/src",
- "projectType": "library",
- "targets": {
- "lint": { "executor": "@nx/eslint:lint" },
- "test": {
-      "executor": "@nx/jest:jest",
-      "options": { "jestConfig": "packages/database/jest.config.ts" }
- },
- "generate": { "executor": "nx:run-commands", "options": { "command": "pnpm prisma generate" } }
- },
- "tags": ["scope:shared"]
  +}
  diff --git a/packages/database/tsconfig.json b/packages/database/tsconfig.json
  new file mode 100644
  index 0000000..40f995b
  --- /dev/null
  +++ b/packages/database/tsconfig.json
  @@ -0,0 +1,5 @@
  +{
- "extends": "../../tsconfig.base.json",
- "compilerOptions": { "outDir": "dist" },
- "include": ["src/**/\*.ts", "prisma/**/*.ts"]
  +}
  diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
  index e06d0c8..ce373ab 100644
  --- a/pnpm-lock.yaml
  +++ b/pnpm-lock.yaml
  @@ -37,30 +37,49 @@ importers:
  version: 30.5.1(@types/node@20.19.43)(babel-plugin-macros@3.1.0)(ts-node@10.9.1(@types/node@20.19.43)(typescript@5.9.3))
  lint-staged:
  specifier: ^17.5.1
  version: 17.5.1
  nx:
  specifier: ^19.0.0
  version: 19.8.14
  prettier:
  specifier: ^3.9.6
  version: 3.9.6
-      prisma:
-        specifier: ^5.10.0
-        version: 5.22.0
       ts-jest:
         specifier: ^29.4.12
         version: 29.4.12(@babel/core@7.29.7)(@jest/transform@30.5.1)(@jest/types@30.5.1)(babel-jest@30.5.1(@babel/core@7.29.7))(jest-util@30.5.1)(jest@30.5.1(@types/node@20.19.43)(babel-plugin-macros@3.1.0)(ts-node@10.9.1(@types/node@20.19.43)(typescript@5.9.3)))(typescript@5.9.3)
       typescript:
         specifier: ^5.4.0
         version: 5.9.3
       typescript-eslint:
         specifier: ^8.70.0
         version: 8.70.0(eslint@9.39.5)(typescript@5.9.3)

- packages/database:
- dependencies:
-      '@kidscare/tenant-context':
-        specifier: workspace:*
-        version: link:../tenant-context
-      '@prisma/client':
-        specifier: ^5.22.0
-        version: 5.22.0(prisma@5.22.0)
- devDependencies:
-      prisma:
-        specifier: ^5.10.0
-        version: 5.22.0
-      tsx:
-        specifier: ^4.7.0
-        version: 4.23.13
- packages/tenant-context: {}

packages:

'@babel/code-frame@7.29.7':
resolution: {integrity: sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==}
engines: {node: '>=6.9.0'}

'@babel/compat-data@7.29.7':
resolution: {integrity: sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==}
@@ -692,20 +711,176 @@ packages:

'@emnapi/runtime@1.11.3':
resolution: {integrity: sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==}

'@emnapi/wasi-threads@1.2.1':
resolution: {integrity: sha512-uTII7OYF+/Mes/MrcIOYp5yOtSMLBWSIoLPpcgwipoiKbli6k322tcoFsxoIIxPDqW01SQGAgko4EzZi2BNv2w==}

'@emnapi/wasi-threads@1.2.3':
resolution: {integrity: sha512-ELEBe8PsLvvJ6QMr0zLt8ffvOHW/dc1m3CEzNMg7aJUv3bMaoDtw2TXyDAwkYBuroxxuHEwhRTLJSe5sya547g==}

- '@esbuild/aix-ppc64@0.28.2':
- resolution: {integrity: sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==}
- engines: {node: '>=18'}
- cpu: [ppc64]
- os: [aix]
-
- '@esbuild/android-arm64@0.28.2':
- resolution: {integrity: sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [android]
-
- '@esbuild/android-arm@0.28.2':
- resolution: {integrity: sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==}
- engines: {node: '>=18'}
- cpu: [arm]
- os: [android]
-
- '@esbuild/android-x64@0.28.2':
- resolution: {integrity: sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [android]
-
- '@esbuild/darwin-arm64@0.28.2':
- resolution: {integrity: sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [darwin]
-
- '@esbuild/darwin-x64@0.28.2':
- resolution: {integrity: sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [darwin]
-
- '@esbuild/freebsd-arm64@0.28.2':
- resolution: {integrity: sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [freebsd]
-
- '@esbuild/freebsd-x64@0.28.2':
- resolution: {integrity: sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [freebsd]
-
- '@esbuild/linux-arm64@0.28.2':
- resolution: {integrity: sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [linux]
-
- '@esbuild/linux-arm@0.28.2':
- resolution: {integrity: sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==}
- engines: {node: '>=18'}
- cpu: [arm]
- os: [linux]
-
- '@esbuild/linux-ia32@0.28.2':
- resolution: {integrity: sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==}
- engines: {node: '>=18'}
- cpu: [ia32]
- os: [linux]
-
- '@esbuild/linux-loong64@0.28.2':
- resolution: {integrity: sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==}
- engines: {node: '>=18'}
- cpu: [loong64]
- os: [linux]
-
- '@esbuild/linux-mips64el@0.28.2':
- resolution: {integrity: sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==}
- engines: {node: '>=18'}
- cpu: [mips64el]
- os: [linux]
-
- '@esbuild/linux-ppc64@0.28.2':
- resolution: {integrity: sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==}
- engines: {node: '>=18'}
- cpu: [ppc64]
- os: [linux]
-
- '@esbuild/linux-riscv64@0.28.2':
- resolution: {integrity: sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==}
- engines: {node: '>=18'}
- cpu: [riscv64]
- os: [linux]
-
- '@esbuild/linux-s390x@0.28.2':
- resolution: {integrity: sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==}
- engines: {node: '>=18'}
- cpu: [s390x]
- os: [linux]
-
- '@esbuild/linux-x64@0.28.2':
- resolution: {integrity: sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [linux]
-
- '@esbuild/netbsd-arm64@0.28.2':
- resolution: {integrity: sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [netbsd]
-
- '@esbuild/netbsd-x64@0.28.2':
- resolution: {integrity: sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [netbsd]
-
- '@esbuild/openbsd-arm64@0.28.2':
- resolution: {integrity: sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [openbsd]
-
- '@esbuild/openbsd-x64@0.28.2':
- resolution: {integrity: sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [openbsd]
-
- '@esbuild/openharmony-arm64@0.28.2':
- resolution: {integrity: sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [openharmony]
-
- '@esbuild/sunos-x64@0.28.2':
- resolution: {integrity: sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [sunos]
-
- '@esbuild/win32-arm64@0.28.2':
- resolution: {integrity: sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==}
- engines: {node: '>=18'}
- cpu: [arm64]
- os: [win32]
-
- '@esbuild/win32-ia32@0.28.2':
- resolution: {integrity: sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==}
- engines: {node: '>=18'}
- cpu: [ia32]
- os: [win32]
-
- '@esbuild/win32-x64@0.28.2':
- resolution: {integrity: sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==}
- engines: {node: '>=18'}
- cpu: [x64]
- os: [win32]
- '@eslint-community/eslint-utils@4.10.1':
  resolution: {integrity: sha512-cuadcxVFE8sDK6iWJbs8Sn0av2Nrh2QSGQhVlBW9AaAHqHwjWsZHT8LJ4hFGPh7ASBV2deFdM7H/DPjulmh8rg==}
  engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}
  peerDependencies:
  eslint: ^6.0.0 || ^7.0.0 || >=8.0.0

  '@eslint-community/regexpp@4.12.2':
  resolution: {integrity: sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==}
  engines: {node: ^12.0.0 || ^14.0.0 || >=16.0.0}

@@ -1147,20 +1322,44 @@ packages:
typescript: ^3 || ^4 || ^5

'@pkgjs/parseargs@0.11.0':
resolution: {integrity: sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==}
engines: {node: '>=14'}

'@pkgr/core@0.3.6':
resolution: {integrity: sha512-SEeaJLb3qBNF/OaXnaR1NmmBbFYk1zC0ZH/52fATcRPLFg/p791YrcyFFy44Bo9sLaGuSuLp5Q6axbb/O+v/RA==}
engines: {node: ^14.18.0 || >=16.0.0}

- '@prisma/client@5.22.0':
- resolution: {integrity: sha512-M0SVXfyHnQREBKxCgyo7sffrKttwE6R8PMq330MIUF0pTwjUhLbW84pFDlf06B27XyCR++VtjugEnIHdr07SVA==}
- engines: {node: '>=16.13'}
- peerDependencies:
-      prisma: '*'
- peerDependenciesMeta:
-      prisma:
-        optional: true
-
- '@prisma/debug@5.22.0':
- resolution: {integrity: sha512-AUt44v3YJeggO2ZU5BkXI7M4hu9BF2zzH2iF2V5pyXT/lRTyWiElZ7It+bRH1EshoMRxHgpYg4VB6rCM+mG5jQ==}
-
- '@prisma/engines-version@5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2':
- resolution: {integrity: sha512-2PTmxFR2yHW/eB3uqWtcgRcgAbG1rwG9ZriSvQw+nnb7c4uCr3RAcGMb6/zfE88SKlC1Nj2ziUvc96Z379mHgQ==}
-
- '@prisma/engines@5.22.0':
- resolution: {integrity: sha512-UNjfslWhAt06kVL3CjkuYpHAWSO6L4kDCVPegV6itt7nD1kSJavd3vhgAEhjglLJJKEdJ7oIqDJ+yHk6qO8gPA==}
-
- '@prisma/fetch-engine@5.22.0':
- resolution: {integrity: sha512-bkrD/Mc2fSvkQBV5EpoFcZ87AvOgDxbG99488a5cexp5Ccny+UM6MAe/UFkUC0wLYD9+9befNOqGiIJhhq+HbA==}
-
- '@prisma/get-platform@5.22.0':
- resolution: {integrity: sha512-pHhpQdr1UPFpt+zFfnPazhulaZYCUqeIcPpJViYoq9R+D/yw4fjE+CtnsnKzPYm0ddUbeXUzjGVGIRVgPDCk4Q==}
- '@sinclair/typebox@0.27.12':
  resolution: {integrity: sha512-hhyNJ+nbR6ZR7pToHvllEFun9TL0sbL+tk/ON75lo+Xas054uez98qRbsuNt7MBCyZKK4+8Yli/OAGZhmfBZ/g==}

  '@sinclair/typebox@0.34.52':
  resolution: {integrity: sha512-XiMQh7qqVlxZzcVD+kkGMNGMzcTrDMLWI7S4x7z1MkCkbDPrekpZXEUK0eZqZFMuHQg2a2DZOcDIh9o5v3Gonw==}

  '@sinonjs/commons@3.0.1':
  resolution: {integrity: sha512-K3mCHKQ9sVh8o1C9cxkwxaOmXoAMlDxC1mYyHrjqOWEcBjYr76t96zL2zlj5dUGZ3HSw240X1qgH3Mjf1yJWpQ==}

  '@sinonjs/fake-timers@10.3.0':
  @@ -1847,20 +2046,25 @@ packages:
  resolution: {integrity: sha512-poHGpORABojJJucnV9KbOavETW8lBVnphkW77ER5/BQ5Fz7oXSoCNek7IH3vR5nRjdsEz926ibFYX8KtLQmdyw==}

  es-object-atoms@1.1.2:
  resolution: {integrity: sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==}
  engines: {node: '>= 0.4'}

  es-set-tostringtag@2.1.0:
  resolution: {integrity: sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==}
  engines: {node: '>= 0.4'}

- esbuild@0.28.2:
- resolution: {integrity: sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==}
- engines: {node: '>=18'}
- hasBin: true
- escalade@3.2.0:
  resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
  engines: {node: '>=6'}

  escape-string-regexp@1.0.5:
  resolution: {integrity: sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==}
  engines: {node: '>=0.8.0'}

  escape-string-regexp@2.0.0:
  resolution: {integrity: sha512-UpzcLCXolUWcNu5HtVMHYdXJjArjsF9C0aNnquZYY4uW/Vu0miy5YoWvbV345HauVvcAUnpRuhMMcqTcGOY2+w==}
  @@ -2796,20 +3000,25 @@ packages:
  hasBin: true

  pretty-format@29.7.0:
  resolution: {integrity: sha512-Pdlw/oPxN+aXdmM9R00JVC9WVFoCLTKJvDVLgmJ+qAffBMxsV85l/Lu7sNx4zSzPyoL2euImuEwHhOXdEgNFZQ==}
  engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}

  pretty-format@30.5.1:
  resolution: {integrity: sha512-byhRAPguVKMQIj4kjJwJ5lAskVhfuiSdiYl/aLTWpgkGEmic2jYhJh1yE9ih8Ox44Xg9ccCT11/S6QrzSJuNrg==}
  engines: {node: ^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0}

- prisma@5.22.0:
- resolution: {integrity: sha512-vtpjW3XuYCSnMsNVBjLMNkTj6OZbudcPPTPYHqX0CJfpcdWciI1dM8uHETwmDxxiqEwCIE6WvXucWUetJgfu/A==}
- engines: {node: '>=16.13'}
- hasBin: true
- proc-log@3.0.0:
  resolution: {integrity: sha512-++Vn7NS4Xf9NacaU9Xq3URUuqZETPsf8L4j5/ckhaRYsfPeRyzGw+iDjFhV/Jr3uNmTvvddEJFWh5R1gRgUH8A==}
  engines: {node: ^14.17.0 || ^16.13.0 || >=18.0.0}

  proxy-from-env@2.1.0:
  resolution: {integrity: sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==}
  engines: {node: '>=10'}

  punycode@2.3.1:
  resolution: {integrity: sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==}
  @@ -3085,20 +3294,25 @@ packages:
  '@swc/wasm':
  optional: true

  tsconfig-paths@4.2.0:
  resolution: {integrity: sha512-NoZ4roiN7LnbKn9QqE1amc9DJfzvZXxF4xDavcOWt1BPkdx+m+0gJuPM+S0vCe7zTJMYUP0R8pO2XMr+Y8oLIg==}
  engines: {node: '>=6'}

  tslib@2.8.1:
  resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

- tsx@4.23.13:
- resolution: {integrity: sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==}
- engines: {node: '>=18.0.0'}
- hasBin: true
- type-check@0.4.0:
  resolution: {integrity: sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==}
  engines: {node: '>= 0.8.0'}

  type-detect@4.0.8:
  resolution: {integrity: sha512-0fr/mIH1dlO+x7TlcMy+bIDqKPsw/70tVyeHW787goQjhmqaZe10uwLujubK9q9Lg6Fiho1KUKDYz0Z7k7g5/g==}
  engines: {node: '>=4'}

  type-fest@0.21.3:
  resolution: {integrity: sha512-t0rzBq87m3fVcduHDUFhKmyyX+9eo6WQjZvf51Ea/M0Q7+T374Jp1aUiyUl0GKxp8M/OETVHSDvmkyPgvX+X2w==}
  @@ -4065,20 +4279,98 @@ snapshots:

  '@emnapi/wasi-threads@1.2.1':
  dependencies:
  tslib: 2.8.1
  optional: true

  '@emnapi/wasi-threads@1.2.3':
  dependencies:
  tslib: 2.8.1

- '@esbuild/aix-ppc64@0.28.2':
- optional: true
-
- '@esbuild/android-arm64@0.28.2':
- optional: true
-
- '@esbuild/android-arm@0.28.2':
- optional: true
-
- '@esbuild/android-x64@0.28.2':
- optional: true
-
- '@esbuild/darwin-arm64@0.28.2':
- optional: true
-
- '@esbuild/darwin-x64@0.28.2':
- optional: true
-
- '@esbuild/freebsd-arm64@0.28.2':
- optional: true
-
- '@esbuild/freebsd-x64@0.28.2':
- optional: true
-
- '@esbuild/linux-arm64@0.28.2':
- optional: true
-
- '@esbuild/linux-arm@0.28.2':
- optional: true
-
- '@esbuild/linux-ia32@0.28.2':
- optional: true
-
- '@esbuild/linux-loong64@0.28.2':
- optional: true
-
- '@esbuild/linux-mips64el@0.28.2':
- optional: true
-
- '@esbuild/linux-ppc64@0.28.2':
- optional: true
-
- '@esbuild/linux-riscv64@0.28.2':
- optional: true
-
- '@esbuild/linux-s390x@0.28.2':
- optional: true
-
- '@esbuild/linux-x64@0.28.2':
- optional: true
-
- '@esbuild/netbsd-arm64@0.28.2':
- optional: true
-
- '@esbuild/netbsd-x64@0.28.2':
- optional: true
-
- '@esbuild/openbsd-arm64@0.28.2':
- optional: true
-
- '@esbuild/openbsd-x64@0.28.2':
- optional: true
-
- '@esbuild/openharmony-arm64@0.28.2':
- optional: true
-
- '@esbuild/sunos-x64@0.28.2':
- optional: true
-
- '@esbuild/win32-arm64@0.28.2':
- optional: true
-
- '@esbuild/win32-ia32@0.28.2':
- optional: true
-
- '@esbuild/win32-x64@0.28.2':
- optional: true
- '@eslint-community/eslint-utils@4.10.1(eslint@9.39.5)':
  dependencies:
  eslint: 9.39.5
  eslint-visitor-keys: 3.4.3

  '@eslint-community/regexpp@4.12.2': {}

  '@eslint/config-array@0.21.2':
  dependencies:
  '@eslint/object-schema': 2.1.7
  @@ -4859,20 +5151,45 @@ snapshots:
  '@phenomnomnominal/tsquery@5.0.1(typescript@5.9.3)':
  dependencies:
  esquery: 1.7.0
  typescript: 5.9.3

  '@pkgjs/parseargs@0.11.0':
  optional: true

  '@pkgr/core@0.3.6': {}

- '@prisma/client@5.22.0(prisma@5.22.0)':
- optionalDependencies:
-      prisma: 5.22.0
-
- '@prisma/debug@5.22.0': {}
-
- '@prisma/engines-version@5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2': {}
-
- '@prisma/engines@5.22.0':
- dependencies:
-      '@prisma/debug': 5.22.0
-      '@prisma/engines-version': 5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2
-      '@prisma/fetch-engine': 5.22.0
-      '@prisma/get-platform': 5.22.0
-
- '@prisma/fetch-engine@5.22.0':
- dependencies:
-      '@prisma/debug': 5.22.0
-      '@prisma/engines-version': 5.22.0-44.605197351a3c8bdd595af2d2a9bc3025bca48ea2
-      '@prisma/get-platform': 5.22.0
-
- '@prisma/get-platform@5.22.0':
- dependencies:
-      '@prisma/debug': 5.22.0
- '@sinclair/typebox@0.27.12': {}

  '@sinclair/typebox@0.34.52': {}

  '@sinonjs/commons@3.0.1':
  dependencies:
  type-detect: 4.0.8

  '@sinonjs/fake-timers@10.3.0':
  dependencies:
  @@ -5583,20 +5900,49 @@ snapshots:
  dependencies:
  es-errors: 1.3.0

  es-set-tostringtag@2.1.0:
  dependencies:
  es-errors: 1.3.0
  get-intrinsic: 1.3.0
  has-tostringtag: 1.0.2
  hasown: 2.0.4

- esbuild@0.28.2:
- optionalDependencies:
-      '@esbuild/aix-ppc64': 0.28.2
-      '@esbuild/android-arm': 0.28.2
-      '@esbuild/android-arm64': 0.28.2
-      '@esbuild/android-x64': 0.28.2
-      '@esbuild/darwin-arm64': 0.28.2
-      '@esbuild/darwin-x64': 0.28.2
-      '@esbuild/freebsd-arm64': 0.28.2
-      '@esbuild/freebsd-x64': 0.28.2
-      '@esbuild/linux-arm': 0.28.2
-      '@esbuild/linux-arm64': 0.28.2
-      '@esbuild/linux-ia32': 0.28.2
-      '@esbuild/linux-loong64': 0.28.2
-      '@esbuild/linux-mips64el': 0.28.2
-      '@esbuild/linux-ppc64': 0.28.2
-      '@esbuild/linux-riscv64': 0.28.2
-      '@esbuild/linux-s390x': 0.28.2
-      '@esbuild/linux-x64': 0.28.2
-      '@esbuild/netbsd-arm64': 0.28.2
-      '@esbuild/netbsd-x64': 0.28.2
-      '@esbuild/openbsd-arm64': 0.28.2
-      '@esbuild/openbsd-x64': 0.28.2
-      '@esbuild/openharmony-arm64': 0.28.2
-      '@esbuild/sunos-x64': 0.28.2
-      '@esbuild/win32-arm64': 0.28.2
-      '@esbuild/win32-ia32': 0.28.2
-      '@esbuild/win32-x64': 0.28.2
- escalade@3.2.0: {}

  escape-string-regexp@1.0.5: {}

  escape-string-regexp@2.0.0: {}

  escape-string-regexp@4.0.0: {}

  eslint-config-prettier@10.1.8(eslint@9.39.5):
  dependencies:
  @@ -6908,20 +7254,26 @@ snapshots:
  ansi-styles: 5.2.0
  react-is: 18.3.1

  pretty-format@30.5.1:
  dependencies:
  '@jest/react-is-18': react-is@18.3.1
  '@jest/react-is-19': react-is@19.3.0
  '@jest/schemas': 30.5.0
  ansi-styles: 5.2.0

- prisma@5.22.0:
- dependencies:
-      '@prisma/engines': 5.22.0
- optionalDependencies:
-      fsevents: 2.3.3
- proc-log@3.0.0: {}

  proxy-from-env@2.1.0: {}

  punycode@2.3.1: {}

  pure-rand@6.1.0: {}

  pure-rand@7.0.1: {}

@@ -7183,20 +7535,26 @@ snapshots:
yn: 3.1.1

tsconfig-paths@4.2.0:
dependencies:
json5: 2.2.3
minimist: 1.2.8
strip-bom: 3.0.0

tslib@2.8.1: {}

- tsx@4.23.13:
- dependencies:
-      esbuild: 0.28.2
- optionalDependencies:
-      fsevents: 2.3.3
- type-check@0.4.0:
  dependencies:
  prelude-ls: 1.2.1

  type-detect@4.0.8: {}

  type-fest@0.21.3: {}

  type-fest@4.41.0: {}
