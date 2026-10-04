# Şartname 0025: Akıllı Alerjen Eşleştirme (Smart Allergen Matching)

## 1. Amaç ve Kapsam

Bu şartname, günün yemek menüsü ile öğrencilerin pasaport alerjileri arasındaki eşleştirmenin daha güvenilir hale getirilmesini hedefler.

**Mevcut sorun:** `apps/api/src/modules/daily-menus/services/daily-menus.service.ts:98-145` yalnızca basit substring match yapıyor (`ma.includes(sa) || sa.includes(ma)`). Sonuç olarak:

- "Pancar Çorbası" yemeği girildiğinde, `passport.allergies: ['Pancar']` → eşleşir ✅
- "Pancarlı Köfte" yemeği için → "pancar" substring aranır, "pancarlı" içinde "pancar" var → eşleşir ✅
- AMA "Fıstıklı Baklava" + alerji `['Fıstık']` → "fıstıklı" içinde "fıstık" var → eşleşir ✅
- AMA **"Sütlü Tatlı" + alerji `['Süt / Laktoz']`** → tam eşleşme yok ❌
- AMA **"Yoğurtlu Salata" + alerji `['Süt']`** → "yoğurt" ↔ "süt" semantik eşleşme yok ❌
- AMA alerji `['Yer Fıstığı']` + yemek `['Fıstık']` → semantik eşleşme yok ❌

**Amaç:** Türkçe morfoloji (ek stripping), alerjen eş anlamlıları (alias dict) ve fuzzy match ile false negative'leri ortadan kaldırmak.

## 2. Hedeflenen Eşleştirme Stratejileri

### 2.1. Normalizasyon (Zorunlu)

- Küçük harfe çevirme (`toLocaleLowerCase('tr')`)
- Trim
- Diakritik normalleştirme (`İ → i`, `Ö → ö`, vb.)
- Boşlukları sadeleştirme

### 2.2. Türkçe Suffix Stripper

Yemek adı ve alerjiden yaygın ekleri kaldır:

- Çoğul: `-lar`, `-ler`
- İyelik: `-im`, `-imiz`, `-in`, `-iniz`, `-i`, `-leri`
- Hal ekleri: `-da`, `-de`, `-dan`, `-den`, `-ın`, `-in`, `-un`, `-ün`
- Sıfat yapma: `-lı`, `-li`, `-lu`, `-lü`, `-sız`, `-siz`, `-suz`, `-süz`

Sonuç: "pancarlı" → "pancar", "fıstıklı" → "fıstık", "sütlü" → "süt"

### 2.3. Alerjen Alias Sözlüğü

Bilinen alerjenlerin eş anlamlılarını kapsayan statik `Map<string, Set<string>>`:

| Ana alerji | Eş anlamlılar                                |
| ---------- | -------------------------------------------- |
| Süt        | süt, laktoz, yoğurt, peynir, tereyağı, krema |
| Fıstık     | fıstık, yer fıstığı, fıstık ezmesi           |
| Yumurta    | yumurta, yumurtalı                           |
| Gluten     | gluten, buğday, un                           |
| Balık      | balık                                        |
| Soya       | soya                                         |
| ...        | (güncellenebilir)                            |

Alias sözlüğü hem alerji adı hem yemek içerik için geçerli.

### 2.4. Eşleştirme Algoritması

Bir terim-yemek çifti için `eşleşti = true` if:

1. Normalize edilmiş substrings birbirini içeriyor (mevcut davranış), VEYA
2. Stemmed (suffix-stripped) kökler eşit, VEYA
3. Her ikisi de aynı alias kümesine düşüyor (alias intersection).

## 3. Kapsam Dışı

- Tam semantik embedding (BERT vb.) — ağır, ileri analitik (Faz 4).
- Otomatik alerjen çıkarımı yemek adından (örn. ML model).

## 4. Uygulama

### 4.1. Yeni dosyalar

- `apps/api/src/modules/allergens/allergen-matcher.ts` — eşleştirme servis bileşeni.
- `apps/api/src/modules/allergens/allergen-matcher.spec.ts` — unit testler.

### 4.2. Entegrasyon

- `DailyMenusService.computeAllergenWarnings` → yeni `AllergenMatcher.match(menuItems, studentAllergies)` kullanır.
- `DailyMenuItem[]` (breakfast/lunch/snack birleşik) ile `passport.allergies[]` karşılaştırılır.

## 5. Kabul Kriterleri

1. Aşağıdaki test case'ler eşleşir:
   - `['Pancar Çorbası']` ↔ `['Pancar']` ✅
   - `['Pancarlı Köfte']` ↔ `['Pancar']` ✅
   - `['Sütlü Tatlı']` ↔ `['Süt / Laktoz']` ✅ (alias)
   - `['Yoğurtlu Salata']` ↔ `['Süt']` ✅ (alias)
   - `['Fıstıklı Baklava']` ↔ `['Fıstık']` ✅ (stemming)
2. Mevcut eşleşmeler (regresyon yok) korunur.
3. `daily-menus.service.spec.ts` mevcut testler geçer + yeni testler eklenir.
4. ESLint temiz, check.ps1 0 hata.
