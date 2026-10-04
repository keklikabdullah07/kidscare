# Uygulama Planı 0025: Akıllı Alerjen Eşleştirme

## Adımlar

### 1. `apps/api/src/modules/allergens/allergen-matcher.ts`

- `@Injectable()` servis.
- Public metot: `match(menuItems: string[], studentAllergies: string[]): AllergenMatchResult[]`.
- Internal: `normalize()`, `stripSuffixes()`, `buildAliasMap()`, `matchSingle()`.
- Alias sözlüğü modül başında statik `Map<string, Set<string>>` ile tanımlı.

### 2. `apps/api/src/modules/allergens/allergen-matcher.spec.ts`

- Unit testler (10+ case):
  - Exact substring
  - Stemmed match
  - Alias match (süt/laktoz/yoğurt)
  - Multi-item menu (herhangi bir item eşleşirse)
  - Boş liste
  - Diacritik normalize
  - Çoğul/sıfat ekleri (`pancarlı`, `sütlü`, `yumurtalı`)

### 3. `apps/api/src/modules/daily-menus/services/daily-menus.service.ts`

- `AllergenMatcher` inject edilir.
- `computeAllergenWarnings` içinde:
  - Yemek itemleri: `breakfast + lunch + snack` birleşik liste.
  - Her öğrencinin alerjisi için `matcher.match(items, [allergy])` çağrılır.
  - Eşleşen varsa warning push'lanır (`matchedAllergens` alanı).

### 4. Mevcut test güncellemesi

- `daily-menus.service.spec.ts` yeni testler eklenir (alias match case'leri).

## Doğrulama

```powershell
pnpm exec eslint apps/api/src/modules/allergens/ apps/api/src/modules/daily-menus/
pnpm --filter @kidscare/api test --testPathPattern=allergen|daily-menus
pwsh -File ./scripts/check.ps1
```

## Riskler

- Türkçe stemming'in false positive üretme ihtimali (örn. "bal" içeren "balkan"). Alias sözlüğüyle sınırlandırılır.
- Performance: her çağrıda O(N×M×K). N (öğrenci sayısı) < 200, M (yemek sayısı) < 20, K (alerji sayısı) < 5. Yeterli.

## Commit

- Tek commit: `feat(api): smart allergen matching with stemming + alias dict`.
