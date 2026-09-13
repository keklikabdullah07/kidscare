=== git log (commits in task range) ===
8041ce9 chore: configure base TypeScript, ESLint, Prettier, Husky

=== git diff --stat ===
.husky/pre-commit | 1 +
.lintstagedrc.json | 3 +
.prettierrc | 9 +
eslint.config.mjs | 24 ++
package.json | 18 +-
pnpm-lock.yaml | 911 +++++++++++++++++++++++++++++++++++++++++++++++++++++
tsconfig.base.json | 23 ++
tsconfig.json | 8 +
8 files changed, 993 insertions(+), 4 deletions(-)

=== git diff -U10 ===
diff --git a/.husky/pre-commit b/.husky/pre-commit
new file mode 100644
index 0000000..5ee7abd
--- /dev/null
+++ b/.husky/pre-commit
@@ -0,0 +1 @@
+pnpm exec lint-staged
diff --git a/.lintstagedrc.json b/.lintstagedrc.json
new file mode 100644
index 0000000..8b178a6
--- /dev/null
+++ b/.lintstagedrc.json
@@ -0,0 +1,3 @@
+{

- "*.{ts,tsx,js,mjs,json,md,prisma}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]
  +}
  diff --git a/.prettierrc b/.prettierrc
  new file mode 100644
  index 0000000..8eee2b8
  --- /dev/null
  +++ b/.prettierrc
  @@ -0,0 +1,9 @@
  +{
- "semi": true,
- "singleQuote": true,
- "trailingComma": "all",
- "printWidth": 100,
- "tabWidth": 2,
- "arrowParens": "always",
- "overrides": [{ "files": "*.prisma", "options": { "singleQuote": false } }]
  +}
  diff --git a/eslint.config.mjs b/eslint.config.mjs
  new file mode 100644
  index 0000000..cd145b2
  --- /dev/null
  +++ b/eslint.config.mjs
  @@ -0,0 +1,24 @@
  +import js from '@eslint/js';
  +import tseslint from 'typescript-eslint';
  +import prettier from 'eslint-config-prettier';
-

+export default [

- js.configs.recommended,
- ...tseslint.configs.recommendedTypeChecked,
- {
- languageOptions: {
-      parserOptions: { projectService: true },
- },
- rules: {
-      '@typescript-eslint/no-explicit-any': 'error',
-      '@typescript-eslint/no-floating-promises': 'error',
-      '@typescript-eslint/consistent-type-imports': 'error',
-      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
- },
- },
- {
- files: ['**/\*.spec.ts', '**/_.test.ts', '\**/_.test.tsx'],
- rules: { '@typescript-eslint/no-explicit-any': 'warn' },
- },
- prettier,
  +];
  diff --git a/package.json b/package.json
  index 7a56caa..52dde1e 100644
  --- a/package.json
  +++ b/package.json
  @@ -1,28 +1,38 @@
  {
  "name": "kidscare",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",

* "engines": { "node": ">=20" },

- "engines": {
- "node": ">=20"
- },
  "scripts": {
  "db:up": "docker compose up -d",
  "db:down": "docker compose down",
  "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
  "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
  "db:seed": "pnpm --filter @kidscare/database prisma db seed",
  "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
  "dev:api": "pnpm --filter @kidscare/api start:dev",
  "dev:admin": "pnpm --filter @kidscare/admin-web dev",
  "dev:marketing": "pnpm --filter @kidscare/marketing dev",
  "dev:mobile": "pnpm --filter @kidscare/mobile start",
  "test": "pnpm exec nx run-many --target=test",
  "test:integration": "pnpm --filter @kidscare/api test:integration",
  "lint": "pnpm exec nx run-many --target=lint",

* "format": "pnpm exec nx format:write"

- "format": "pnpm exec nx format:write",
- "prepare": "husky"
  },
  "devDependencies": {
- "@eslint/js": "^10.0.1",
- "@types/node": "^20.0.0",
- "eslint": "^9.0.0",
- "eslint-config-prettier": "^10.1.8",
- "husky": "^9.1.7",
- "lint-staged": "^17.5.1",
  "nx": "^19.0.0",
- "prettier": "^3.9.6",
  "typescript": "^5.4.0",

* "@types/node": "^20.0.0"

- "typescript-eslint": "^8.70.0"
  }
  -}
  \ No newline at end of file
  +}
  diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
  index 494e454..a23c394 100644
  --- a/pnpm-lock.yaml
  +++ b/pnpm-lock.yaml
  @@ -1,41 +1,129 @@
  lockfileVersion: '9.0'

settings:
autoInstallPeers: true
excludeLinksFromLockfile: false

importers:

.:
devDependencies:

-      '@eslint/js':
-        specifier: ^10.0.1
-        version: 10.0.1(eslint@9.39.5)
       '@types/node':
         specifier: ^20.0.0
         version: 20.19.43
-      eslint:
-        specifier: ^9.0.0
-        version: 9.39.5
-      eslint-config-prettier:
-        specifier: ^10.1.8
-        version: 10.1.8(eslint@9.39.5)
-      husky:
-        specifier: ^9.1.7
-        version: 9.1.7
-      lint-staged:
-        specifier: ^17.5.1
-        version: 17.5.1
       nx:
         specifier: ^19.0.0
         version: 19.8.14
-      prettier:
-        specifier: ^3.9.6
-        version: 3.9.6
       typescript:
         specifier: ^5.4.0
         version: 5.9.3
-      typescript-eslint:
-        specifier: ^8.70.0
-        version: 8.70.0(eslint@9.39.5)(typescript@5.9.3)

packages:

'@emnapi/core@1.11.3':
resolution: {integrity: sha512-zLpS5asjEb7lq8jYLq37N6XKaE41DIexlY1rF/z4/tIl3wo13Sqm28fRyfIsKZD+NZ8mM5RoKkpW/rBcuoSZSg==}

'@emnapi/runtime@1.11.3':
resolution: {integrity: sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==}

'@emnapi/wasi-threads@1.2.3':
resolution: {integrity: sha512-ELEBe8PsLvvJ6QMr0zLt8ffvOHW/dc1m3CEzNMg7aJUv3bMaoDtw2TXyDAwkYBuroxxuHEwhRTLJSe5sya547g==}

- '@eslint-community/eslint-utils@4.10.1':
- resolution: {integrity: sha512-cuadcxVFE8sDK6iWJbs8Sn0av2Nrh2QSGQhVlBW9AaAHqHwjWsZHT8LJ4hFGPh7ASBV2deFdM7H/DPjulmh8rg==}
- engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}
- peerDependencies:
-      eslint: ^6.0.0 || ^7.0.0 || >=8.0.0
-
- '@eslint-community/regexpp@4.12.2':
- resolution: {integrity: sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==}
- engines: {node: ^12.0.0 || ^14.0.0 || >=16.0.0}
-
- '@eslint/config-array@0.21.2':
- resolution: {integrity: sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/config-helpers@0.4.2':
- resolution: {integrity: sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/core@0.17.0':
- resolution: {integrity: sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/eslintrc@3.3.7':
- resolution: {integrity: sha512-F42g89Qd5oAWtp0k0nnSrjziAKza7w8SVT4mStc18LZMaRb4J1HQAHLCalEtDCxrTuksx7NU9qsmeLwpOfPqWw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/js@10.0.1':
- resolution: {integrity: sha512-zeR9k5pd4gxjZ0abRoIaxdc7I3nDktoXZk2qOv9gCNWx3mVwEn32VRhyLaRsDiJjTs0xq/T8mfPtyuXu7GWBcA==}
- engines: {node: ^20.19.0 || ^22.13.0 || >=24}
- peerDependencies:
-      eslint: ^10.0.0
- peerDependenciesMeta:
-      eslint:
-        optional: true
-
- '@eslint/js@9.39.5':
- resolution: {integrity: sha512-QywQuszQh77pIXCsq998c8hbhSTI/azTty1Z6N53dmAudKHhy573j3yvRLsX2BSp8YpLtoCEG8E9DJe+8zUh4A==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/object-schema@2.1.7':
- resolution: {integrity: sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@eslint/plugin-kit@0.4.1':
- resolution: {integrity: sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@humanfs/core@0.19.2':
- resolution: {integrity: sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==}
- engines: {node: '>=18.18.0'}
-
- '@humanfs/node@0.16.8':
- resolution: {integrity: sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==}
- engines: {node: '>=18.18.0'}
-
- '@humanfs/types@0.15.0':
- resolution: {integrity: sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==}
- engines: {node: '>=18.18.0'}
-
- '@humanwhocodes/module-importer@1.0.1':
- resolution: {integrity: sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==}
- engines: {node: '>=12.22'}
-
- '@humanwhocodes/retry@0.4.3':
- resolution: {integrity: sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==}
- engines: {node: '>=18.18'}
- '@jest/schemas@29.6.3':
  resolution: {integrity: sha512-mo5j5X+jIZmJQveBKeS/clAueipV7KgiX1vMgCxam1RNYiqE1w62n0/tJJnHtjW8ZHcQco5gY85jA3mi0L+nSA==}
  engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}

  '@napi-rs/wasm-runtime@0.2.4':
  resolution: {integrity: sha512-9zESzOO5aDByvhIAsOy9TbpZ0Ur2AJbUI7UT73kcUTS2mxAMHOBaa1st/jAymNoCtvrit99kkzT1FZuXVcgfIQ==}

  '@nrwl/tao@19.8.14':
  resolution: {integrity: sha512-zBeYzzwg43T/Z8ZtLblv0fcKuqJULttqYDekSLILThXp3UOMSerEvruhUgwddCY1jUssfLscz8vacMKISv5X4w==}
  hasBin: true
  @@ -99,38 +187,116 @@ packages:
  engines: {node: '>= 10'}
  cpu: [x64]
  os: [win32]

  '@sinclair/typebox@0.27.12':
  resolution: {integrity: sha512-hhyNJ+nbR6ZR7pToHvllEFun9TL0sbL+tk/ON75lo+Xas054uez98qRbsuNt7MBCyZKK4+8Yli/OAGZhmfBZ/g==}

  '@tybys/wasm-util@0.9.0':
  resolution: {integrity: sha512-6+7nlbMVX/PVDCwaIQ8nTOPveOcFLSt8GcXdx8hD0bt39uWxYT88uXzqTd4fTvqta7oeUJqudepapKNt2DYJFw==}

- '@types/estree@1.0.9':
- resolution: {integrity: sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==}
-
- '@types/json-schema@7.0.15':
- resolution: {integrity: sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==}
- '@types/node@20.19.43':
  resolution: {integrity: sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==}

- '@typescript-eslint/eslint-plugin@8.70.0':
- resolution: {integrity: sha512-/v8HZt6RlyIZxB3ntehELOcUcfxKPVGWXnQdJuHRmzrqgF8nQypcC/oxGW+Ot4VGKDq81XugPKxx0n5PBtf9PA==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      '@typescript-eslint/parser': ^8.70.0
-      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/parser@8.70.0':
- resolution: {integrity: sha512-zYvrmj9Yxd63UGaXw+kdt6A0F0s0qveJyuatIM77bYC2DE4pgmg7a50u8LR7PRtXd0x+h+Tl3eXabGm06SWd3Q==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/project-service@8.70.0':
- resolution: {integrity: sha512-hFHbTNqhU9G+2eKFXCBVb1tjFT/LceiJ4+HfLO4pTpDI0KHi6iajpcFFkaSQ9gXmCh7n82A0PthaayEdN6mspQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/scope-manager@8.70.0':
- resolution: {integrity: sha512-8nP3Kwh5hlgZ4FicGvmznAmJe8UL4sdU8tLukrPaMuQmDuk4Y8xYfzu/aYZW4xT2JCgc7H/TpDI5cGlxcWJSqQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@typescript-eslint/tsconfig-utils@8.70.0':
- resolution: {integrity: sha512-adnkeeNq9Sq1sUf4+FRVc0KdgYghzsgFpZSQVZVvY0LCuUuN0FnQgyGzCJeC4fW1cdXseBAjU2EOqUIjbNcZUw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/type-utils@8.70.0':
- resolution: {integrity: sha512-NUMKIhYVaVIVLnRL9CRt+VVcuLgSHUCpXn4/+K8wql+vdInUzvx8BjUO1oJ7cG9shjFJKtF8F8Hh2kCh3/KBVw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/types@8.70.0':
- resolution: {integrity: sha512-asTOIYhDg4zdzOScCyaytrsV3cR6B4ecPQlXw/dJIm7J/MZTtCtfVII9JD8Geh4jTCrK/Xe6cg5UevoleMcoJQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- '@typescript-eslint/typescript-estree@8.70.0':
- resolution: {integrity: sha512-d9NmHMPEKQ7QCLLm1jI3zmoQBwT5KwFYjXBJ9ymZfKCUU+5rmTRykKAFvH5Qn/ZCds3CEAFS9OC9M/jkl0X2bA==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/utils@8.70.0':
- resolution: {integrity: sha512-oZmtKJz/4fufZ2p3+Cn3ijEojcdfR+1zYDH2xKYrEly0dR/Q/1xUPRCOlKGxod78nWlU2UnDe09GZ3TaknBFGA==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
-      typescript: '>=4.8.4 <6.1.0'
-
- '@typescript-eslint/visitor-keys@8.70.0':
- resolution: {integrity: sha512-BoC8PiO4Hkdo0TVJh9Ntxr5MxPDI7/oFsrygN5ADelFSeXG/qgNuucIGA+L5Z6JpPTE/uRfcTWtscjbUaufepQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- '@yarnpkg/lockfile@1.1.0':
  resolution: {integrity: sha512-GpSwvyXOcOOlV70vbnzjj4fW5xW/FdUF6nQEt1ENy7m4ZCczi1+/buVUPAqmGfqznsORNFzUMjctTIp8a9tuCQ==}

  '@yarnpkg/parsers@3.0.0-rc.46':
  resolution: {integrity: sha512-aiATs7pSutzda/rq8fnuPwTglyVwjM22bNnK2ZgjrpAjQHSSl3lztd2f9evst1W/qnC58DRz7T7QndUDumAR4Q==}
  engines: {node: '>=14.15.0'}

  '@zkochan/js-yaml@0.0.7':
  resolution: {integrity: sha512-nrUSn7hzt7J6JWgWGz78ZYI8wj+gdIJdk0Ynjpp8l+trkn58Uqsf6RYrYkEK+3X18EX+TNdtJI0WxAtc+L84SQ==}
  hasBin: true

- acorn-jsx@5.3.2:
- resolution: {integrity: sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==}
- peerDependencies:
-      acorn: ^6.0.0 || ^7.0.0 || ^8.0.0
-
- acorn@8.18.0:
- resolution: {integrity: sha512-lGq+9yr1/GuAWaVYIHRjvvySG5/4VfKIvC8EWxStPdcDh/Ka7FG3twP6v4d5BkravUilhIAsG4Qj83t02LWUPQ==}
- engines: {node: '>=0.4.0'}
- hasBin: true
- agent-base@6.0.2:
  resolution: {integrity: sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==}
  engines: {node: '>= 6.0.0'}

- ajv@6.15.0:
- resolution: {integrity: sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==}
- ansi-colors@4.1.3:
  resolution: {integrity: sha512-/6w/C21Pm1A7aZitlI5Ni/2J6FFQN8i1Cvz3kHABAAbw93v/NlvKdVOqz7CCWz/3iv/JplRSEEZ83XION15ovw==}
  engines: {node: '>=6'}

  ansi-regex@5.0.1:
  resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
  engines: {node: '>=8'}

  ansi-styles@4.3.0:
  resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
  @@ -148,36 +314,51 @@ packages:

  asynckit@0.4.0:
  resolution: {integrity: sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==}

  axios@1.20.0:
  resolution: {integrity: sha512-r8aOh8j9cGKpgQAqpzrUHnSIc6a59Y3Xf/cv8sy1DrHCkZHzQGEuoq1tARk6qSyDdtQGSDgpb9kFlruzPvrgwg==}

  balanced-match@1.0.2:
  resolution: {integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==}

- balanced-match@4.0.4:
- resolution: {integrity: sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==}
- engines: {node: 18 || 20 || >=22}
- base64-js@1.5.1:
  resolution: {integrity: sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==}

  bl@4.1.0:
  resolution: {integrity: sha512-1W07cM9gS6DcLperZfFSj+bWLtaPGSOHWhPiGzXmvVJbRLdG82sH/Kn8EtW1VqWVA54AKf2h5k5BbnIbwF3h6w==}

- brace-expansion@1.1.18:
- resolution: {integrity: sha512-Edep/X9fGqVNmzKBVsDYIOtD+z1tuezV70LBjdCst9Tqu76lsnvRiZ6oTic1n+/BIwX6QDGAO94PN4N2SADvtw==}
- brace-expansion@2.1.4:
  resolution: {integrity: sha512-hGfVzPxthbf3+2yjg/RBs60cB0FhqBS/zvdV/4wn4/BmN0bNMMHPc4V/BbFieqf1TKAGGAHnY4eSjajCl0f2Xg==}

- brace-expansion@5.0.9:
- resolution: {integrity: sha512-ScQ4IuvIEF1TMlP7Zt+vjJ//9zlPb2SDcxWxM3bk8s6t6GGdJ7KO1dCcTidOPJKePW30LE/2cT7wCyPho9/Wxg==}
- engines: {node: 20 || >=22}
- buffer@5.7.1:
  resolution: {integrity: sha512-EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==}

  call-bind-apply-helpers@1.0.2:
  resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
  engines: {node: '>= 0.4'}

- callsites@3.1.0:
- resolution: {integrity: sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==}
- engines: {node: '>=6'}
- chalk@4.1.2:
  resolution: {integrity: sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==}
  engines: {node: '>=10'}

  cli-cursor@3.1.0:
  resolution: {integrity: sha512-I/zHAwsKf9FqGoXM4WWRACob9+SNukZTd94DWF57E4toouRulbCxcUh6RKUEOQlYTHJnzkPMySvPNaaSLNfLZw==}
  engines: {node: '>=8'}

  cli-spinners@2.6.1:
  resolution: {integrity: sha512-x/5fWmGMnbKQAaNwN+UZlV79qBLM9JFnJuJ03gIi5whrob0xV0ofNVHy9DhwGdsMJQc2OKv0oGmLzvaqvAVv+g==}
  @@ -195,29 +376,39 @@ packages:
  resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
  engines: {node: '>=7.0.0'}

  color-name@1.1.4:
  resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  combined-stream@1.0.8:
  resolution: {integrity: sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==}
  engines: {node: '>= 0.8'}

- concat-map@0.0.1:
- resolution: {integrity: sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==}
-
- cross-spawn@7.0.6:
- resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
- engines: {node: '>= 8'}
- debug@4.4.3:
  resolution: {integrity: sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==}
  engines: {node: '>=6.0'}
  peerDependencies:
  supports-color: '*'
  peerDependenciesMeta:
  supports-color:
  optional: true

- deep-is@0.1.4:
- resolution: {integrity: sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==}
- defaults@1.0.4:
  resolution: {integrity: sha512-eFuaLoy/Rxalv2kr+lqMlUnrDWV+3j4pljOIJgLIhI058IQfWJ7vXhyEIHu+HtC738klGALYxOKDO0bQP3tg8A==}

  define-lazy-prop@2.0.0:
  resolution: {integrity: sha512-Ds09qNh8yw3khSjiJjiUInaGX9xlqZDY7JVryGxdxV7NPeuqQfplOpQ66yJFZut3jLa5zOwkXw1g9EI2uKh4Og==}
  engines: {node: '>=8'}

  delayed-stream@1.0.0:
  resolution: {integrity: sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==}
  engines: {node: '>=0.4.0'}
  @@ -268,33 +459,123 @@ packages:
  engines: {node: '>= 0.4'}

  escalade@3.2.0:
  resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
  engines: {node: '>=6'}

  escape-string-regexp@1.0.5:
  resolution: {integrity: sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==}
  engines: {node: '>=0.8.0'}

- escape-string-regexp@4.0.0:
- resolution: {integrity: sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==}
- engines: {node: '>=10'}
-
- eslint-config-prettier@10.1.8:
- resolution: {integrity: sha512-82GZUjRS0p/jganf6q1rEO25VSoHH0hKPCTrgillPjdI/3bgBhAE1QzHrHTizjpRvy6pGAvKjDJtk2pF9NDq8w==}
- hasBin: true
- peerDependencies:
-      eslint: '>=7.0.0'
-
- eslint-scope@8.4.0:
- resolution: {integrity: sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- eslint-visitor-keys@3.4.3:
- resolution: {integrity: sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==}
- engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}
-
- eslint-visitor-keys@4.2.1:
- resolution: {integrity: sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
-
- eslint-visitor-keys@5.0.1:
- resolution: {integrity: sha512-tD40eHxA35h0PEIZNeIjkHoDR4YjjJp34biM0mDvplBe//mB+IHCqHDGV7pxF+7MklTvighcCPPZC7ynWyjdTA==}
- engines: {node: ^20.19.0 || ^22.13.0 || >=24}
-
- eslint@9.39.5:
- resolution: {integrity: sha512-DgZS62aPLXKlnxILS/AYCoRvHaZeXceIzlXPkkGGzJWSow1aEk0lbTlxUSlyjC8jcaKxAdOnTDz+o1JFSBsyjw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- deprecated: This version is no longer supported. Please see https://eslint.org/version-support for other options.
- hasBin: true
- peerDependencies:
-      jiti: '*'
- peerDependenciesMeta:
-      jiti:
-        optional: true
-
- espree@10.4.0:
- resolution: {integrity: sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- esprima@4.0.1:
  resolution: {integrity: sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==}
  engines: {node: '>=4'}
  hasBin: true

- esquery@1.7.0:
- resolution: {integrity: sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==}
- engines: {node: '>=0.10'}
-
- esrecurse@4.3.0:
- resolution: {integrity: sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==}
- engines: {node: '>=4.0'}
-
- estraverse@5.3.0:
- resolution: {integrity: sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==}
- engines: {node: '>=4.0'}
-
- esutils@2.0.3:
- resolution: {integrity: sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==}
- engines: {node: '>=0.10.0'}
-
- fast-deep-equal@3.1.3:
- resolution: {integrity: sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==}
-
- fast-json-stable-stringify@2.1.0:
- resolution: {integrity: sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==}
-
- fast-levenshtein@2.0.6:
- resolution: {integrity: sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==}
-
- fdir@6.5.0:
- resolution: {integrity: sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==}
- engines: {node: '>=12.0.0'}
- peerDependencies:
-      picomatch: ^3 || ^4
- peerDependenciesMeta:
-      picomatch:
-        optional: true
- figures@3.2.0:
  resolution: {integrity: sha512-yaduQFRKLXYOGgEn6AZau90j3ggSOyiqXU0F9JZfeXYhNa+Jk4X+s45A2zg5jns87GAFa34BBm2kXw4XpNcbdg==}
  engines: {node: '>=8'}

- file-entry-cache@8.0.0:
- resolution: {integrity: sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==}
- engines: {node: '>=16.0.0'}
-
- find-up@5.0.0:
- resolution: {integrity: sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==}
- engines: {node: '>=10'}
-
- flat-cache@4.0.1:
- resolution: {integrity: sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==}
- engines: {node: '>=16'}
- flat@5.0.2:
  resolution: {integrity: sha512-b6suED+5/3rTpUBdG1gupIl8MPFCAMA0QXwmljLhvCUKcUvdE4gWky9zpuGCcXHOsz4J9wPGNWq6OKpmIzz3hQ==}
  hasBin: true

- flatted@3.4.4:
- resolution: {integrity: sha512-5+ybhBZANEJxaH3X5evAFatUxLfEHSr7n6kYJ+1Qd0mUqr4eu9gIf6GDbWHf8RJijHrjjO8G+la14SlL2SeS1Q==}
- follow-redirects@1.16.0:
  resolution: {integrity: sha512-y5rN/uOsadFT/JfYwhxRS5R7Qce+g3zG97+JrtFZlC9klX/W5hD7iiLzScI4nZqUS7DNUdhPgw4xI8W2LuXlUw==}
  engines: {node: '>=4.0'}
  peerDependencies:
  debug: '*'
  peerDependenciesMeta:
  debug:
  optional: true

  form-data@4.0.6:
  @@ -315,20 +596,28 @@ packages:
  engines: {node: 6.* || 8.* || >= 10.*}

  get-intrinsic@1.3.0:
  resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
  engines: {node: '>= 0.4'}

  get-proto@1.0.1:
  resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
  engines: {node: '>= 0.4'}

- glob-parent@6.0.2:
- resolution: {integrity: sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==}
- engines: {node: '>=10.13.0'}
-
- globals@14.0.0:
- resolution: {integrity: sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==}
- engines: {node: '>=18'}
- gopd@1.2.0:
  resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
  engines: {node: '>= 0.4'}

  has-flag@4.0.0:
  resolution: {integrity: sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==}
  engines: {node: '>=8'}

  has-symbols@1.1.0:
  resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
  @@ -339,105 +628,175 @@ packages:
  engines: {node: '>= 0.4'}

  hasown@2.0.4:
  resolution: {integrity: sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==}
  engines: {node: '>= 0.4'}

  https-proxy-agent@5.0.1:
  resolution: {integrity: sha512-dFcAjpTQFgoLMzC2VwU+C/CbS7uRL0lWmxDITmqm7C+7F0Odmj6s9l6alZc6AELXhrnggM2CeWSXHGOdX2YtwA==}
  engines: {node: '>= 6'}

- husky@9.1.7:
- resolution: {integrity: sha512-5gs5ytaNjBrh5Ow3zrvdUUY+0VxIuWVL4i9irt6friV+BqdCfmV11CQTWMiBYWHbXhco+J1kHfTOUkePhCDvMA==}
- engines: {node: '>=18'}
- hasBin: true
- ieee754@1.2.1:
  resolution: {integrity: sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==}

  ignore@5.3.2:
  resolution: {integrity: sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==}
  engines: {node: '>= 4'}

- ignore@7.0.9:
- resolution: {integrity: sha512-brTTsvFRt5C1gGHtPst/281UjPD5t9fBqbgoMPlVWy11ZLTPfu7HxK4ZYqO9H7o/yC9rSTCI85EaQ4OoY12qYw==}
- engines: {node: '>= 4'}
-
- import-fresh@3.3.1:
- resolution: {integrity: sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==}
- engines: {node: '>=6'}
-
- imurmurhash@0.1.4:
- resolution: {integrity: sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==}
- engines: {node: '>=0.8.19'}
- inherits@2.0.4:
  resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  is-docker@2.2.1:
  resolution: {integrity: sha512-F+i2BKsFrH66iaUFc0woD8sLy8getkwTwtOBjvs56Cx4CgJDeKQeqfz8wAYiSb8JOprWhHH5p77PbmYCvvUuXQ==}
  engines: {node: '>=8'}
  hasBin: true

- is-extglob@2.1.1:
- resolution: {integrity: sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==}
- engines: {node: '>=0.10.0'}
- is-fullwidth-code-point@3.0.0:
  resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
  engines: {node: '>=8'}

- is-glob@4.0.3:
- resolution: {integrity: sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==}
- engines: {node: '>=0.10.0'}
- is-interactive@1.0.0:
  resolution: {integrity: sha512-2HvIEKRoqS62guEC+qBjpvRubdX910WCMuJTZ+I9yvqKU2/12eSL549HMwtabb4oupdj2sMP50k+XJfB/8JE6w==}
  engines: {node: '>=8'}

  is-unicode-supported@0.1.0:
  resolution: {integrity: sha512-knxG2q4UC3u8stRGyAVJCOdxFmv5DZiRcdlIaAQXAbSfJya+OhopNotLQrstBhququ4ZpuKbDc/8S6mgXgPFPw==}
  engines: {node: '>=10'}

  is-wsl@2.2.0:
  resolution: {integrity: sha512-fKzAra0rGJUUBwGBgNkHZuToZcn+TtXHpeCgmkMJMMYx1sQDYaCSyjJBSCa2nH1DGm7s3n1oBnohoVTBaN7Lww==}
  engines: {node: '>=8'}

- isexe@2.0.0:
- resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}
- jest-diff@29.7.0:
  resolution: {integrity: sha512-LMIgiIrhigmPrs03JHpxUh2yISK3vLFPkAodPeo0+BuF7wA2FoQbkEg1u8gBYBThncu7e1oEDUfIXVuTqLRUjw==}
  engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}

  jest-get-type@29.6.3:
  resolution: {integrity: sha512-zrteXnqYxfQh7l5FHyL38jL39di8H8rHoecLH3JNxH3BwOrBsNeabdap5e0I23lD4HHI8W5VFBZqG4Eaq5LNcw==}
  engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}

  js-yaml@3.15.2:
  resolution: {integrity: sha512-6EuL879VkRA+1Cz578mKMiKvjPNEuk6+r1JaFzoSWejZmtf7xWbIyw1e3KkxlkzTIt9Taw6JBhEppG7utc1P+w==}
  hasBin: true

- js-yaml@4.3.2:
- resolution: {integrity: sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==}
- hasBin: true
-
- json-buffer@3.0.1:
- resolution: {integrity: sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==}
-
- json-schema-traverse@0.4.1:
- resolution: {integrity: sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==}
-
- json-stable-stringify-without-jsonify@1.0.1:
- resolution: {integrity: sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==}
- json5@2.2.3:
  resolution: {integrity: sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==}
  engines: {node: '>=6'}
  hasBin: true

  jsonc-parser@3.2.0:
  resolution: {integrity: sha512-gfFQZrcTc8CnKXp6Y4/CBT3fTc0OVuDofpre4aEeEpSBPV5X5v4+Vmx+8snU7RLPrNHPKSgLxGo9YuQzz20o+w==}

- keyv@4.5.4:
- resolution: {integrity: sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==}
-
- levn@0.4.1:
- resolution: {integrity: sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==}
- engines: {node: '>= 0.8.0'}
- lines-and-columns@2.0.3:
  resolution: {integrity: sha512-cNOjgCnLB+FnvWWtyRTzmB3POJ+cXxTA81LoW7u8JdmhfXzriropYwpjShnz1QLLWsQwY7nIxoDmcPTwphDK9w==}
  engines: {node: ^12.20.0 || ^14.13.1 || >=16.0.0}

- lint-staged@17.5.1:
- resolution: {integrity: sha512-7EDuco1xnBMeVpvAbeMq1U5KXwJGLmY8q6l+Ye78r36C4mPc+Vg1Z2SK8gHyRTyvPro90A0q5/FAZ+Au23d6QQ==}
- engines: {node: '>=22.22.1'}
- hasBin: true
-
- locate-path@6.0.0:
- resolution: {integrity: sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==}
- engines: {node: '>=10'}
-
- lodash.merge@4.6.2:
- resolution: {integrity: sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==}
- log-symbols@4.1.0:
  resolution: {integrity: sha512-8XPvpAA8uyhfteu8pIvQxpJZ7SYYdpUivZpGy6sFsBuKRY/7rQGavedeB8aK+Zkyq6upMFVL/9AW6vOYzfRyLg==}
  engines: {node: '>=10'}

  math-intrinsics@1.1.0:
  resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
  engines: {node: '>= 0.4'}

  mime-db@1.52.0:
  resolution: {integrity: sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==}
  engines: {node: '>= 0.6'}

  mime-types@2.1.35:
  resolution: {integrity: sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==}
  engines: {node: '>= 0.6'}

  mimic-fn@2.1.0:
  resolution: {integrity: sha512-OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==}
  engines: {node: '>=6'}

- minimatch@10.2.6:
- resolution: {integrity: sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==}
- engines: {node: 18 || 20 || >=22}
-
- minimatch@3.1.5:
- resolution: {integrity: sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==}
- minimatch@9.0.3:
  resolution: {integrity: sha512-RHiac9mvaRw0x3AYRgDC1CxAP7HTcNrrECeA8YYJeWnpo+2Q5CegtZjaotWTWxDG3UeGA1coE05iH1mPjT/2mg==}
  engines: {node: '>=16 || 14 >=14.17'}

  minimist@1.2.8:
  resolution: {integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==}

  ms@2.1.3:
  resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

- natural-compare@1.4.0:
- resolution: {integrity: sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==}
- node-machine-id@1.1.12:
  resolution: {integrity: sha512-QNABxbrPa3qEIfrE6GOJ7BYIuignnJw7iQ2YPbc3Nla1HzRJjXzZOiikfF8m7eAMfichLt3M4VgLOetqgDmgGQ==}

  npm-run-path@4.0.1:
  resolution: {integrity: sha512-S48WzZW777zhNIrn7gxOlISNAqi9ZC/uQFnRdbeIHhZhCA6UqpkOT8T1G7BvfdgP4Er8gF4sUbaS0i7QvIfCWw==}
  engines: {node: '>=8'}

  nx@19.8.14:
  resolution: {integrity: sha512-yprBOWV16eQntz5h5SShYHMVeN50fUb6yHfzsqNiFneCJeyVjyJ585m+2TuVbE11vT1amU0xCjHcSGfJBBnm8g==}
  hasBin: true
  @@ -454,155 +813,324 @@ packages:
  resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}

  onetime@5.1.2:
  resolution: {integrity: sha512-kbpaSSGJTWdAY5KPVeMOKXSrPtr8C8C7wodJbcsd51jRnmD+GZu8Y0VoU6Dm5Z4vWr0Ig/1NKuWRKf7j5aaYSg==}
  engines: {node: '>=6'}

  open@8.4.2:
  resolution: {integrity: sha512-7x81NCL719oNbsq/3mh+hVrAWmFuEYUqrq/Iw3kUzH8ReypT9QQ0BLoJS7/G9k6N81XjW4qHWtjWwe/9eLy1EQ==}
  engines: {node: '>=12'}

- optionator@0.9.4:
- resolution: {integrity: sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==}
- engines: {node: '>= 0.8.0'}
- ora@5.3.0:
  resolution: {integrity: sha512-zAKMgGXUim0Jyd6CXK9lraBnD3H5yPGBPPOkC23a2BG6hsm4Zu6OQSjQuEtV0BHDf4aKHcUFvJiGRrFuW3MG8g==}
  engines: {node: '>=10'}

- p-limit@3.1.0:
- resolution: {integrity: sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==}
- engines: {node: '>=10'}
-
- p-locate@5.0.0:
- resolution: {integrity: sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==}
- engines: {node: '>=10'}
-
- parent-module@1.0.1:
- resolution: {integrity: sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==}
- engines: {node: '>=6'}
-
- path-exists@4.0.0:
- resolution: {integrity: sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==}
- engines: {node: '>=8'}
- path-key@3.1.1:
  resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
  engines: {node: '>=8'}

- picomatch@4.0.7:
- resolution: {integrity: sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==}
- engines: {node: '>=12'}
-
- prelude-ls@1.2.1:
- resolution: {integrity: sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==}
- engines: {node: '>= 0.8.0'}
-
- prettier@3.9.6:
- resolution: {integrity: sha512-OpN0zzVdiaiAhxpuuj5efpIS4sY9j7bY6uR5mnj5yPzGkdkjNKSJeUThPb60Jw29QuAZgA4o+/iB49kFiaBX6g==}
- engines: {node: '>=14'}
- hasBin: true
- pretty-format@29.7.0:
  resolution: {integrity: sha512-Pdlw/oPxN+aXdmM9R00JVC9WVFoCLTKJvDVLgmJ+qAffBMxsV85l/Lu7sNx4zSzPyoL2euImuEwHhOXdEgNFZQ==}
  engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}

  proxy-from-env@2.1.0:
  resolution: {integrity: sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==}
  engines: {node: '>=10'}

- punycode@2.3.1:
- resolution: {integrity: sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==}
- engines: {node: '>=6'}
- react-is@18.3.1:
  resolution: {integrity: sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==}

  readable-stream@3.6.2:
  resolution: {integrity: sha512-9u/sniCrY3D5WdsERHzHE4G2YCXqoG5FTHUiCC4SIbr6XcLZBY05ya9EKjYek9O5xOAwjGq+1JdGBAS7Q9ScoA==}
  engines: {node: '>= 6'}

  require-directory@2.1.1:
  resolution: {integrity: sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==}
  engines: {node: '>=0.10.0'}

- resolve-from@4.0.0:
- resolution: {integrity: sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==}
- engines: {node: '>=4'}
- restore-cursor@3.1.0:
  resolution: {integrity: sha512-l+sSefzHpj5qimhFSE5a8nufZYAM3sBSVMAPtYkmC+4EH2anSGaEMXSD0izRQbu9nfyQ9y5JrVmp7E8oZrUjvA==}
  engines: {node: '>=8'}

  safe-buffer@5.2.1:
  resolution: {integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==}

  semver@7.8.5:
  resolution: {integrity: sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==}
  engines: {node: '>=10'}
  hasBin: true

- shebang-command@2.0.0:
- resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
- engines: {node: '>=8'}
-
- shebang-regex@3.0.0:
- resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
- engines: {node: '>=8'}
- signal-exit@3.0.7:
  resolution: {integrity: sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==}

  sprintf-js@1.0.3:
  resolution: {integrity: sha512-D9cPgkvLlV3t3IzL0D0YLvGA9Ahk4PcvVwUbN0dSGr1aP0Nrt4AEnTUbuGvquEC0mA64Gqt1fzirlRs5ibXx8g==}

- string-argv@0.3.2:
- resolution: {integrity: sha512-aqD2Q0144Z+/RqG52NeHEkZauTAUWJO8c6yTftGJKO3Tja5tUgIfmIl6kExvhtxSDP7fXB6DvzkfMpCd/F3G+Q==}
- engines: {node: '>=0.6.19'}
- string-width@4.2.3:
  resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
  engines: {node: '>=8'}

  string_decoder@1.3.0:
  resolution: {integrity: sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==}

  strip-ansi@6.0.1:
  resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
  engines: {node: '>=8'}

  strip-bom@3.0.0:
  resolution: {integrity: sha512-vavAMRXOgBVNF6nyEEmL3DBK19iRpDcoIwW+swQ+CbGiu7lju6t+JklA1MHweoWtadgt4ISVUsXLyDq34ddcwA==}
  engines: {node: '>=4'}

- strip-json-comments@3.1.1:
- resolution: {integrity: sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==}
- engines: {node: '>=8'}
- strong-log-transformer@2.1.0:
  resolution: {integrity: sha512-B3Hgul+z0L9a236FAUC9iZsL+nVHgoCJnqCbN588DjYxvGXaXaaFbfmQ/JhvKjZwsOukuR72XbHv71Qkug0HxA==}
  engines: {node: '>=4'}
  hasBin: true

  supports-color@7.2.0:
  resolution: {integrity: sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==}
  engines: {node: '>=8'}

  tar-stream@2.2.0:
  resolution: {integrity: sha512-ujeqbceABgwMZxEJnk2HDY2DlnUZ+9oEcb1KzTVfYHio0UE6dG71n60d8D2I4qNvleWrrXpmjpt7vZeF1LnMZQ==}
  engines: {node: '>=6'}

  through@2.3.8:
  resolution: {integrity: sha512-w89qg7PI8wAdvX60bMDP+bFoD5Dvhm9oLheFp5O4a2QF0cSBGsBX4qZmadPMvVqlLJBBci+WqGGOAPvcDeNSVg==}

- tinyexec@1.3.1:
- resolution: {integrity: sha512-GCvB3aoys96IuDFBMcTB46JOR6mdMtAToqwiW8JlWhsoh1mhHi/xn9ss/Dg7N555GiJyEt2qzoG/NHCwM6h1EA==}
- engines: {node: '>=18'}
-
- tinyglobby@0.2.17:
- resolution: {integrity: sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==}
- engines: {node: '>=12.0.0'}
- tmp@0.2.7:
  resolution: {integrity: sha512-e0votIpp4Uo2AJYSzVHV6xCcawuiez3DzqDAbrTc3YxBkplN6e+dM13ZeIcZnDg/QpSuU2zfZ3rzwY8ukEnaXw==}
  engines: {node: '>=14.14'}

- ts-api-utils@2.5.0:
- resolution: {integrity: sha512-OJ/ibxhPlqrMM0UiNHJ/0CKQkoKF243/AEmplt3qpRgkW8VG7IfOS41h7V8TjITqdByHzrjcS/2si+y4lIh8NA==}
- engines: {node: '>=18.12'}
- peerDependencies:
-      typescript: '>=4.8.4'
- tsconfig-paths@4.2.0:
  resolution: {integrity: sha512-NoZ4roiN7LnbKn9QqE1amc9DJfzvZXxF4xDavcOWt1BPkdx+m+0gJuPM+S0vCe7zTJMYUP0R8pO2XMr+Y8oLIg==}
  engines: {node: '>=6'}

  tslib@2.8.1:
  resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

- type-check@0.4.0:
- resolution: {integrity: sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==}
- engines: {node: '>= 0.8.0'}
-
- typescript-eslint@8.70.0:
- resolution: {integrity: sha512-P/W5cz70/cQAuKfY3xwQMWWTV7BvJ0mAQmi+9mBcsVPaBUpd6Ohpa+fECv9rBFrQcig86jAiNBFNWUqnTjr4pw==}
- engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
- peerDependencies:
-      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
-      typescript: '>=4.8.4 <6.1.0'
- typescript@5.9.3:
  resolution: {integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==}
  engines: {node: '>=14.17'}
  hasBin: true

  undici-types@6.21.0:
  resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}

- uri-js@4.4.1:
- resolution: {integrity: sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==}
- util-deprecate@1.0.2:
  resolution: {integrity: sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==}

  wcwidth@1.0.1:
  resolution: {integrity: sha512-XHPEwS0q6TaxcvG85+8EYkbiCux2XtWG2mkc47Ng2A77BQu9+DqIOJldST4HgPkuea7dvKSj5VgX3P1d4rW8Tg==}

- which@2.0.2:
- resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
- engines: {node: '>= 8'}
- hasBin: true
-
- word-wrap@1.2.5:
- resolution: {integrity: sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==}
- engines: {node: '>=0.10.0'}
- wrap-ansi@7.0.0:
  resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
  engines: {node: '>=10'}

  wrappy@1.0.2:
  resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

  y18n@5.0.8:
  resolution: {integrity: sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==}
  engines: {node: '>=10'}

- yaml@2.9.1:
- resolution: {integrity: sha512-3NxN8+78OdzbT7C/WjGsyfPAtJaN3FNDsWxv7Y7mcDsT/oOmgW8BpyQQFFBnvZE3j9Y2Sdz1ULFLezL7Eb2yFw==}
- engines: {node: '>= 14.6'}
- hasBin: true
- yargs-parser@21.1.1:
  resolution: {integrity: sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==}
  engines: {node: '>=12'}

  yargs@17.7.3:
  resolution: {integrity: sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==}
  engines: {node: '>=12'}

- yocto-queue@0.1.0:
- resolution: {integrity: sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==}
- engines: {node: '>=10'}
-

snapshots:

'@emnapi/core@1.11.3':
dependencies:
'@emnapi/wasi-threads': 1.2.3
tslib: 2.8.1

'@emnapi/runtime@1.11.3':
dependencies:
tslib: 2.8.1

'@emnapi/wasi-threads@1.2.3':
dependencies:
tslib: 2.8.1

- '@eslint-community/eslint-utils@4.10.1(eslint@9.39.5)':
- dependencies:
-      eslint: 9.39.5
-      eslint-visitor-keys: 3.4.3
-
- '@eslint-community/regexpp@4.12.2': {}
-
- '@eslint/config-array@0.21.2':
- dependencies:
-      '@eslint/object-schema': 2.1.7
-      debug: 4.4.3
-      minimatch: 3.1.5
- transitivePeerDependencies:
-      - supports-color
-
- '@eslint/config-helpers@0.4.2':
- dependencies:
-      '@eslint/core': 0.17.0
-
- '@eslint/core@0.17.0':
- dependencies:
-      '@types/json-schema': 7.0.15
-
- '@eslint/eslintrc@3.3.7':
- dependencies:
-      ajv: 6.15.0
-      debug: 4.4.3
-      espree: 10.4.0
-      globals: 14.0.0
-      ignore: 5.3.2
-      import-fresh: 3.3.1
-      js-yaml: 4.3.2
-      minimatch: 3.1.5
-      strip-json-comments: 3.1.1
- transitivePeerDependencies:
-      - supports-color
-
- '@eslint/js@10.0.1(eslint@9.39.5)':
- optionalDependencies:
-      eslint: 9.39.5
-
- '@eslint/js@9.39.5': {}
-
- '@eslint/object-schema@2.1.7': {}
-
- '@eslint/plugin-kit@0.4.1':
- dependencies:
-      '@eslint/core': 0.17.0
-      levn: 0.4.1
-
- '@humanfs/core@0.19.2':
- dependencies:
-      '@humanfs/types': 0.15.0
-
- '@humanfs/node@0.16.8':
- dependencies:
-      '@humanfs/core': 0.19.2
-      '@humanfs/types': 0.15.0
-      '@humanwhocodes/retry': 0.4.3
-
- '@humanfs/types@0.15.0': {}
-
- '@humanwhocodes/module-importer@1.0.1': {}
-
- '@humanwhocodes/retry@0.4.3': {}
- '@jest/schemas@29.6.3':
  dependencies:
  '@sinclair/typebox': 0.27.12

  '@napi-rs/wasm-runtime@0.2.4':
  dependencies:
  '@emnapi/core': 1.11.3
  '@emnapi/runtime': 1.11.3
  '@tybys/wasm-util': 0.9.0

@@ -645,41 +1173,149 @@ snapshots:

'@nx/nx-win32-x64-msvc@19.8.14':
optional: true

'@sinclair/typebox@0.27.12': {}

'@tybys/wasm-util@0.9.0':
dependencies:
tslib: 2.8.1

- '@types/estree@1.0.9': {}
-
- '@types/json-schema@7.0.15': {}
- '@types/node@20.19.43':
  dependencies:
  undici-types: 6.21.0

- '@typescript-eslint/eslint-plugin@8.70.0(@typescript-eslint/parser@8.70.0(eslint@9.39.5)(typescript@5.9.3))(eslint@9.39.5)(typescript@5.9.3)':
- dependencies:
-      '@eslint-community/regexpp': 4.12.2
-      '@typescript-eslint/parser': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      '@typescript-eslint/scope-manager': 8.70.0
-      '@typescript-eslint/type-utils': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      '@typescript-eslint/utils': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      '@typescript-eslint/visitor-keys': 8.70.0
-      eslint: 9.39.5
-      ignore: 7.0.9
-      natural-compare: 1.4.0
-      ts-api-utils: 2.5.0(typescript@5.9.3)
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/parser@8.70.0(eslint@9.39.5)(typescript@5.9.3)':
- dependencies:
-      '@typescript-eslint/scope-manager': 8.70.0
-      '@typescript-eslint/types': 8.70.0
-      '@typescript-eslint/typescript-estree': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/visitor-keys': 8.70.0
-      debug: 4.4.3
-      eslint: 9.39.5
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/project-service@8.70.0(typescript@5.9.3)':
- dependencies:
-      '@typescript-eslint/tsconfig-utils': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/types': 8.70.0
-      debug: 4.4.3
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/scope-manager@8.70.0':
- dependencies:
-      '@typescript-eslint/types': 8.70.0
-      '@typescript-eslint/visitor-keys': 8.70.0
-
- '@typescript-eslint/tsconfig-utils@8.70.0(typescript@5.9.3)':
- dependencies:
-      typescript: 5.9.3
-
- '@typescript-eslint/type-utils@8.70.0(eslint@9.39.5)(typescript@5.9.3)':
- dependencies:
-      '@typescript-eslint/types': 8.70.0
-      '@typescript-eslint/typescript-estree': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/utils': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      debug: 4.4.3
-      eslint: 9.39.5
-      ts-api-utils: 2.5.0(typescript@5.9.3)
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/types@8.70.0': {}
-
- '@typescript-eslint/typescript-estree@8.70.0(typescript@5.9.3)':
- dependencies:
-      '@typescript-eslint/project-service': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/tsconfig-utils': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/types': 8.70.0
-      '@typescript-eslint/visitor-keys': 8.70.0
-      debug: 4.4.3
-      minimatch: 10.2.6
-      semver: 7.8.5
-      tinyglobby: 0.2.17
-      ts-api-utils: 2.5.0(typescript@5.9.3)
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/utils@8.70.0(eslint@9.39.5)(typescript@5.9.3)':
- dependencies:
-      '@eslint-community/eslint-utils': 4.10.1(eslint@9.39.5)
-      '@typescript-eslint/scope-manager': 8.70.0
-      '@typescript-eslint/types': 8.70.0
-      '@typescript-eslint/typescript-estree': 8.70.0(typescript@5.9.3)
-      eslint: 9.39.5
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
-
- '@typescript-eslint/visitor-keys@8.70.0':
- dependencies:
-      '@typescript-eslint/types': 8.70.0
-      eslint-visitor-keys: 5.0.1
- '@yarnpkg/lockfile@1.1.0': {}

  '@yarnpkg/parsers@3.0.0-rc.46':
  dependencies:
  js-yaml: 3.15.2
  tslib: 2.8.1

  '@zkochan/js-yaml@0.0.7':
  dependencies:
  argparse: 2.0.1

- acorn-jsx@5.3.2(acorn@8.18.0):
- dependencies:
-      acorn: 8.18.0
-
- acorn@8.18.0: {}
- agent-base@6.0.2:
  dependencies:
  debug: 4.4.3
  transitivePeerDependencies: - supports-color

- ajv@6.15.0:
- dependencies:
-      fast-deep-equal: 3.1.3
-      fast-json-stable-stringify: 2.1.0
-      json-schema-traverse: 0.4.1
-      uri-js: 4.4.1
- ansi-colors@4.1.3: {}

  ansi-regex@5.0.1: {}

  ansi-styles@4.3.0:
  dependencies:
  color-convert: 2.0.1

  ansi-styles@5.2.0: {}

@@ -696,42 +1332,55 @@ snapshots:
follow-redirects: 1.16.0
form-data: 4.0.6
https-proxy-agent: 5.0.1
proxy-from-env: 2.1.0
transitivePeerDependencies: - debug - supports-color

balanced-match@1.0.2: {}

- balanced-match@4.0.4: {}
- base64-js@1.5.1: {}

  bl@4.1.0:
  dependencies:
  buffer: 5.7.1
  inherits: 2.0.4
  readable-stream: 3.6.2

- brace-expansion@1.1.18:
- dependencies:
-      balanced-match: 1.0.2
-      concat-map: 0.0.1
- brace-expansion@2.1.4:
  dependencies:
  balanced-match: 1.0.2

- brace-expansion@5.0.9:
- dependencies:
-      balanced-match: 4.0.4
- buffer@5.7.1:
  dependencies:
  base64-js: 1.5.1
  ieee754: 1.2.1

  call-bind-apply-helpers@1.0.2:
  dependencies:
  es-errors: 1.3.0
  function-bind: 1.1.2

- callsites@3.1.0: {}
- chalk@4.1.2:
  dependencies:
  ansi-styles: 4.3.0
  supports-color: 7.2.0

  cli-cursor@3.1.0:
  dependencies:
  restore-cursor: 3.1.0

  cli-spinners@2.6.1: {}
  @@ -747,24 +1396,34 @@ snapshots:
  color-convert@2.0.1:
  dependencies:
  color-name: 1.1.4

  color-name@1.1.4: {}

  combined-stream@1.0.8:
  dependencies:
  delayed-stream: 1.0.0

- concat-map@0.0.1: {}
-
- cross-spawn@7.0.6:
- dependencies:
-      path-key: 3.1.1
-      shebang-command: 2.0.0
-      which: 2.0.2
- debug@4.4.3:
  dependencies:
  ms: 2.1.3

- deep-is@0.1.4: {}
- defaults@1.0.4:
  dependencies:
  clone: 1.0.4

  define-lazy-prop@2.0.0: {}

  delayed-stream@1.0.0: {}

  diff-sequences@29.6.3: {}

@@ -804,28 +1463,128 @@ snapshots:
dependencies:
es-errors: 1.3.0
get-intrinsic: 1.3.0
has-tostringtag: 1.0.2
hasown: 2.0.4

escalade@3.2.0: {}

escape-string-regexp@1.0.5: {}

- escape-string-regexp@4.0.0: {}
-
- eslint-config-prettier@10.1.8(eslint@9.39.5):
- dependencies:
-      eslint: 9.39.5
-
- eslint-scope@8.4.0:
- dependencies:
-      esrecurse: 4.3.0
-      estraverse: 5.3.0
-
- eslint-visitor-keys@3.4.3: {}
-
- eslint-visitor-keys@4.2.1: {}
-
- eslint-visitor-keys@5.0.1: {}
-
- eslint@9.39.5:
- dependencies:
-      '@eslint-community/eslint-utils': 4.10.1(eslint@9.39.5)
-      '@eslint-community/regexpp': 4.12.2
-      '@eslint/config-array': 0.21.2
-      '@eslint/config-helpers': 0.4.2
-      '@eslint/core': 0.17.0
-      '@eslint/eslintrc': 3.3.7
-      '@eslint/js': 9.39.5
-      '@eslint/plugin-kit': 0.4.1
-      '@humanfs/node': 0.16.8
-      '@humanwhocodes/module-importer': 1.0.1
-      '@humanwhocodes/retry': 0.4.3
-      '@types/estree': 1.0.9
-      ajv: 6.15.0
-      chalk: 4.1.2
-      cross-spawn: 7.0.6
-      debug: 4.4.3
-      escape-string-regexp: 4.0.0
-      eslint-scope: 8.4.0
-      eslint-visitor-keys: 4.2.1
-      espree: 10.4.0
-      esquery: 1.7.0
-      esutils: 2.0.3
-      fast-deep-equal: 3.1.3
-      file-entry-cache: 8.0.0
-      find-up: 5.0.0
-      glob-parent: 6.0.2
-      ignore: 5.3.2
-      imurmurhash: 0.1.4
-      is-glob: 4.0.3
-      json-stable-stringify-without-jsonify: 1.0.1
-      lodash.merge: 4.6.2
-      minimatch: 3.1.5
-      natural-compare: 1.4.0
-      optionator: 0.9.4
- transitivePeerDependencies:
-      - supports-color
-
- espree@10.4.0:
- dependencies:
-      acorn: 8.18.0
-      acorn-jsx: 5.3.2(acorn@8.18.0)
-      eslint-visitor-keys: 4.2.1
- esprima@4.0.1: {}

- esquery@1.7.0:
- dependencies:
-      estraverse: 5.3.0
-
- esrecurse@4.3.0:
- dependencies:
-      estraverse: 5.3.0
-
- estraverse@5.3.0: {}
-
- esutils@2.0.3: {}
-
- fast-deep-equal@3.1.3: {}
-
- fast-json-stable-stringify@2.1.0: {}
-
- fast-levenshtein@2.0.6: {}
-
- fdir@6.5.0(picomatch@4.0.7):
- optionalDependencies:
-      picomatch: 4.0.7
- figures@3.2.0:
  dependencies:
  escape-string-regexp: 1.0.5

- file-entry-cache@8.0.0:
- dependencies:
-      flat-cache: 4.0.1
-
- find-up@5.0.0:
- dependencies:
-      locate-path: 6.0.0
-      path-exists: 4.0.0
-
- flat-cache@4.0.1:
- dependencies:
-      flatted: 3.4.4
-      keyv: 4.5.4
- flat@5.0.2: {}

- flatted@3.4.4: {}
- follow-redirects@1.16.0: {}

  form-data@4.0.6:
  dependencies:
  asynckit: 0.4.0
  combined-stream: 1.0.8
  es-set-tostringtag: 2.1.0
  hasown: 2.0.4
  mime-types: 2.1.35

@@ -850,20 +1609,26 @@ snapshots:
gopd: 1.2.0
has-symbols: 1.1.0
hasown: 2.0.4
math-intrinsics: 1.1.0

get-proto@1.0.1:
dependencies:
dunder-proto: 1.0.1
es-object-atoms: 1.1.2

- glob-parent@6.0.2:
- dependencies:
-      is-glob: 4.0.3
-
- globals@14.0.0: {}
- gopd@1.2.0: {}

  has-flag@4.0.0: {}

  has-symbols@1.1.0: {}

  has-tostringtag@1.0.2:
  dependencies:
  has-symbols: 1.1.0

@@ -871,81 +1636,143 @@ snapshots:
dependencies:
function-bind: 1.1.2

https-proxy-agent@5.0.1:
dependencies:
agent-base: 6.0.2
debug: 4.4.3
transitivePeerDependencies: - supports-color

- husky@9.1.7: {}
- ieee754@1.2.1: {}

  ignore@5.3.2: {}

- ignore@7.0.9: {}
-
- import-fresh@3.3.1:
- dependencies:
-      parent-module: 1.0.1
-      resolve-from: 4.0.0
-
- imurmurhash@0.1.4: {}
- inherits@2.0.4: {}

  is-docker@2.2.1: {}

- is-extglob@2.1.1: {}
- is-fullwidth-code-point@3.0.0: {}

- is-glob@4.0.3:
- dependencies:
-      is-extglob: 2.1.1
- is-interactive@1.0.0: {}

  is-unicode-supported@0.1.0: {}

  is-wsl@2.2.0:
  dependencies:
  is-docker: 2.2.1

- isexe@2.0.0: {}
- jest-diff@29.7.0:
  dependencies:
  chalk: 4.1.2
  diff-sequences: 29.6.3
  jest-get-type: 29.6.3
  pretty-format: 29.7.0

  jest-get-type@29.6.3: {}

  js-yaml@3.15.2:
  dependencies:
  argparse: 1.0.10
  esprima: 4.0.1

- js-yaml@4.3.2:
- dependencies:
-      argparse: 2.0.1
-
- json-buffer@3.0.1: {}
-
- json-schema-traverse@0.4.1: {}
-
- json-stable-stringify-without-jsonify@1.0.1: {}
- json5@2.2.3: {}

  jsonc-parser@3.2.0: {}

- keyv@4.5.4:
- dependencies:
-      json-buffer: 3.0.1
-
- levn@0.4.1:
- dependencies:
-      prelude-ls: 1.2.1
-      type-check: 0.4.0
- lines-and-columns@2.0.3: {}

- lint-staged@17.5.1:
- dependencies:
-      picomatch: 4.0.7
-      string-argv: 0.3.2
-      tinyexec: 1.3.1
- optionalDependencies:
-      yaml: 2.9.1
-
- locate-path@6.0.0:
- dependencies:
-      p-locate: 5.0.0
-
- lodash.merge@4.6.2: {}
- log-symbols@4.1.0:
  dependencies:
  chalk: 4.1.2
  is-unicode-supported: 0.1.0

  math-intrinsics@1.1.0: {}

  mime-db@1.52.0: {}

  mime-types@2.1.35:
  dependencies:
  mime-db: 1.52.0

  mimic-fn@2.1.0: {}

- minimatch@10.2.6:
- dependencies:
-      brace-expansion: 5.0.9
-
- minimatch@3.1.5:
- dependencies:
-      brace-expansion: 1.1.18
- minimatch@9.0.3:
  dependencies:
  brace-expansion: 2.1.4

  minimist@1.2.8: {}

  ms@2.1.3: {}

- natural-compare@1.4.0: {}
- node-machine-id@1.1.12: {}

  npm-run-path@4.0.1:
  dependencies:
  path-key: 3.1.1

  nx@19.8.14:
  dependencies:
  '@napi-rs/wasm-runtime': 0.2.4
  '@nrwl/tao': 19.8.14
  @@ -1003,131 +1830,215 @@ snapshots:
  onetime@5.1.2:
  dependencies:
  mimic-fn: 2.1.0

  open@8.4.2:
  dependencies:
  define-lazy-prop: 2.0.0
  is-docker: 2.2.1
  is-wsl: 2.2.0

- optionator@0.9.4:
- dependencies:
-      deep-is: 0.1.4
-      fast-levenshtein: 2.0.6
-      levn: 0.4.1
-      prelude-ls: 1.2.1
-      type-check: 0.4.0
-      word-wrap: 1.2.5
- ora@5.3.0:
  dependencies:
  bl: 4.1.0
  chalk: 4.1.2
  cli-cursor: 3.1.0
  cli-spinners: 2.6.1
  is-interactive: 1.0.0
  log-symbols: 4.1.0
  strip-ansi: 6.0.1
  wcwidth: 1.0.1

- p-limit@3.1.0:
- dependencies:
-      yocto-queue: 0.1.0
-
- p-locate@5.0.0:
- dependencies:
-      p-limit: 3.1.0
-
- parent-module@1.0.1:
- dependencies:
-      callsites: 3.1.0
-
- path-exists@4.0.0: {}
- path-key@3.1.1: {}

- picomatch@4.0.7: {}
-
- prelude-ls@1.2.1: {}
-
- prettier@3.9.6: {}
- pretty-format@29.7.0:
  dependencies:
  '@jest/schemas': 29.6.3
  ansi-styles: 5.2.0
  react-is: 18.3.1

  proxy-from-env@2.1.0: {}

- punycode@2.3.1: {}
- react-is@18.3.1: {}

  readable-stream@3.6.2:
  dependencies:
  inherits: 2.0.4
  string_decoder: 1.3.0
  util-deprecate: 1.0.2

  require-directory@2.1.1: {}

- resolve-from@4.0.0: {}
- restore-cursor@3.1.0:
  dependencies:
  onetime: 5.1.2
  signal-exit: 3.0.7

  safe-buffer@5.2.1: {}

  semver@7.8.5: {}

- shebang-command@2.0.0:
- dependencies:
-      shebang-regex: 3.0.0
-
- shebang-regex@3.0.0: {}
- signal-exit@3.0.7: {}

  sprintf-js@1.0.3: {}

- string-argv@0.3.2: {}
- string-width@4.2.3:
  dependencies:
  emoji-regex: 8.0.0
  is-fullwidth-code-point: 3.0.0
  strip-ansi: 6.0.1

  string_decoder@1.3.0:
  dependencies:
  safe-buffer: 5.2.1

  strip-ansi@6.0.1:
  dependencies:
  ansi-regex: 5.0.1

  strip-bom@3.0.0: {}

- strip-json-comments@3.1.1: {}
- strong-log-transformer@2.1.0:
  dependencies:
  duplexer: 0.1.2
  minimist: 1.2.8
  through: 2.3.8

  supports-color@7.2.0:
  dependencies:
  has-flag: 4.0.0

  tar-stream@2.2.0:
  dependencies:
  bl: 4.1.0
  end-of-stream: 1.4.5
  fs-constants: 1.0.0
  inherits: 2.0.4
  readable-stream: 3.6.2

  through@2.3.8: {}

- tinyexec@1.3.1: {}
-
- tinyglobby@0.2.17:
- dependencies:
-      fdir: 6.5.0(picomatch@4.0.7)
-      picomatch: 4.0.7
- tmp@0.2.7: {}

- ts-api-utils@2.5.0(typescript@5.9.3):
- dependencies:
-      typescript: 5.9.3
- tsconfig-paths@4.2.0:
  dependencies:
  json5: 2.2.3
  minimist: 1.2.8
  strip-bom: 3.0.0

  tslib@2.8.1: {}

- type-check@0.4.0:
- dependencies:
-      prelude-ls: 1.2.1
-
- typescript-eslint@8.70.0(eslint@9.39.5)(typescript@5.9.3):
- dependencies:
-      '@typescript-eslint/eslint-plugin': 8.70.0(@typescript-eslint/parser@8.70.0(eslint@9.39.5)(typescript@5.9.3))(eslint@9.39.5)(typescript@5.9.3)
-      '@typescript-eslint/parser': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      '@typescript-eslint/typescript-estree': 8.70.0(typescript@5.9.3)
-      '@typescript-eslint/utils': 8.70.0(eslint@9.39.5)(typescript@5.9.3)
-      eslint: 9.39.5
-      typescript: 5.9.3
- transitivePeerDependencies:
-      - supports-color
- typescript@5.9.3: {}

  undici-types@6.21.0: {}

- uri-js@4.4.1:
- dependencies:
-      punycode: 2.3.1
- util-deprecate@1.0.2: {}

  wcwidth@1.0.1:
  dependencies:
  defaults: 1.0.4

- which@2.0.2:
- dependencies:
-      isexe: 2.0.0
-
- word-wrap@1.2.5: {}
- wrap-ansi@7.0.0:
  dependencies:
  ansi-styles: 4.3.0
  string-width: 4.2.3
  strip-ansi: 6.0.1

  wrappy@1.0.2: {}

  y18n@5.0.8: {}

- yaml@2.9.1:
- optional: true
- yargs-parser@21.1.1: {}

  yargs@17.7.3:
  dependencies:
  cliui: 8.0.1
  escalade: 3.2.0
  get-caller-file: 2.0.5
  require-directory: 2.1.1
  string-width: 4.2.3
  y18n: 5.0.8
  yargs-parser: 21.1.1

-
- yocto-queue@0.1.0: {}
  diff --git a/tsconfig.base.json b/tsconfig.base.json
  new file mode 100644
  index 0000000..51fa676
  --- /dev/null
  +++ b/tsconfig.base.json
  @@ -0,0 +1,23 @@
  +{
- "compilerOptions": {
- "target": "ES2022",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "strict": true,
- "noUncheckedIndexedAccess": true,
- "exactOptionalPropertyTypes": true,
- "noImplicitOverride": true,
- "esModuleInterop": true,
- "skipLibCheck": true,
- "forceConsistentCasingInFileNames": true,
- "resolveJsonModule": true,
- "baseUrl": ".",
- "paths": {
-      "@kidscare/shared-types": ["packages/shared-types/src"],
-      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
-      "@kidscare/database": ["packages/database/src"],
-      "@kidscare/tenant-context": ["packages/tenant-context/src"]
- }
- },
- "exclude": ["node_modules", "dist", ".nx", "apps/mobile/node_modules"]
  +}
  diff --git a/tsconfig.json b/tsconfig.json
  new file mode 100644
  index 0000000..7c6b8e5
  --- /dev/null
  +++ b/tsconfig.json
  @@ -0,0 +1,8 @@
  +{
- "extends": "./tsconfig.base.json",
- "compilerOptions": {
- "allowJs": true
- },
- "include": ["eslint.config.mjs", "**/\*.ts", "**/_.tsx", "\**/_.mts", "**/*.cts"],
- "exclude": ["node_modules", "dist", ".nx", "apps/mobile/node_modules"]
  +}
