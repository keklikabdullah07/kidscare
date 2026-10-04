import { Injectable } from '@nestjs/common';

export type MatchType = 'substring' | 'stem' | 'alias';

export interface AllergenMatchResult {
  allergen: string;
  matchedMenuItem: string;
  matchType: MatchType;
}

/**
 * Bilinen alerjen eş anlamlı grupları. Yemek içerikleri ve alerji etiketleri
 * bu gruplardan birine düşüyorsa semantik eşleşme sayılır.
 */
const ALIAS_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ['süt', 'laktoz', 'yoğurt', 'peynir', 'tereyağı', 'krema', 'ayran', 'sütlü'],
  [
    'fıstık',
    'yer fıstığı',
    'fıstık ezmesi',
    'fıstıklı',
    'fıstığ',
    'fıstığı',
    'fıstıkları',
    'fıstıkların',
    'fıstıklı',
  ],
  ['yumurta', 'yumurtalı'],
  ['gluten', 'buğday', 'un', 'ekmek', 'glutenli'],
  ['balık', 'balıklı'],
  ['soya', 'soyalı'],
  ['kuruyemiş', 'badem', 'ceviz', 'fındık', 'Antep fıstığı'],
  ['çilek', 'çilekli'],
  ['bal', 'ballı'],
  ['kakao', 'çikolata'],
];

/**
 * Türkçe sonek ekleri (çoğul, iyelik, sıfat yapım, ünlü türemeli iyelik).
 * Hal ekleri (-da/-de/-dan vb.) kasten YOK: çekirdek kelimelerde ("yumurta", "kereviz")
 * bulunduğundan false positive üretir. Yemek adı token'ları hâlâ
 * normalize sonrası birebir eşleşir.
 * Sıralama **uzundan kısa**: "pancarlı" → "lı" strip, "ı" değil.
 */
const SUFFIXES: readonly string[] = [
  'ımız',
  'imiz',
  'umuz',
  'ümüz',
  'ınız',
  'iniz',
  'unuz',
  'ünüz',
  'ları',
  'leri',
  'iği',
  'ığı',
  'uğu',
  'üğü',
  'lar',
  'ler',
  'ım',
  'im',
  'um',
  'üm',
  'ın',
  'in',
  'un',
  'ün',
  'lı',
  'li',
  'lu',
  'lü',
  'sız',
  'siz',
  'suz',
  'süz',
  'ı',
  'i',
  'u',
  'ü',
];

/**
 * Noktalama ve kontrol karakterlerini kaldırır, küçük harfe çevirir.
 */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .trim()
    .replace(/[^\wığüşıöçĞÜŞİÖÇ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Türkçe sonek eklerini sırayla soyar. Minimum 3 karakter korur.
 */
export function stripSuffixes(word: string): string {
  let result = word;
  let safety = 0;
  while (safety < 10) {
    safety += 1;
    let bestSuffix: string | null = null;
    for (const suffix of SUFFIXES) {
      if (
        result.endsWith(suffix) &&
        result.length - suffix.length >= 3 &&
        (bestSuffix === null || suffix.length > bestSuffix.length)
      ) {
        bestSuffix = suffix;
      }
    }
    if (bestSuffix === null) break;
    result = result.slice(0, -bestSuffix.length);
  }
  return result;
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

let aliasIndexCache: Map<string, number> | null = null;

function getAliasIndex(): Map<string, number> {
  if (aliasIndexCache) return aliasIndexCache;
  const map = new Map<string, number>();
  ALIAS_GROUPS.forEach((group, idx) => {
    for (const term of group) {
      map.set(term, idx);
    }
  });
  aliasIndexCache = map;
  return map;
}

/**
 * Akıllı alerjen eşleştirici:
 *  1. Normalize + substring (mevcut davranış)
 *  2. Türkçe stemming (sonek soyma) ile kök eşleşmesi
 *  3. Alias sözlüğü ile semantik eşleşme (süt ↔ yoğurt ↔ peynir)
 */
@Injectable()
export class AllergenMatcher {
  /**
   * Bir alerji listesi için yemek listesinde eşleşen itemleri döner.
   * Bir alerji için birden fazla item eşleşirse yalnız ilk eşleşme raporlanır.
   */
  match(menuItems: string[], studentAllergies: string[]): AllergenMatchResult[] {
    const results: AllergenMatchResult[] = [];
    const items = menuItems
      .filter((item) => item && item.trim().length > 0)
      .map((raw) => ({ raw, tokens: tokenize(raw) }));

    for (const allergy of studentAllergies) {
      if (!allergy || !allergy.trim()) continue;
      const allergyTokens = tokenize(allergy);

      for (const item of items) {
        const result = this.matchItem(item, allergy, allergyTokens);
        if (result) {
          results.push(result);
          break;
        }
      }
    }
    return results;
  }

  private matchItem(
    item: { raw: string; tokens: string[] },
    allergy: string,
    allergyTokens: string[],
  ): AllergenMatchResult | null {
    const aliasIndex = getAliasIndex();
    const MIN_LEN = 3;

    const itemTokenPairs = item.tokens.map((t) => ({
      raw: t,
      stem: stripSuffixes(t),
    }));
    const allergyTokenPairs = allergyTokens.map((t) => ({
      raw: t,
      stem: stripSuffixes(t),
    }));

    // 1. Exact token match (normalize sonrası, minimum uzunluk)
    for (const it of itemTokenPairs) {
      for (const at of allergyTokenPairs) {
        if (it.raw.length >= MIN_LEN && it.raw === at.raw) {
          return { allergen: allergy, matchedMenuItem: item.raw, matchType: 'substring' };
        }
      }
    }

    // 2. Alias intersection (token-level) — aynı semantik grup
    for (const it of itemTokenPairs) {
      for (const at of allergyTokenPairs) {
        if (it.stem.length < MIN_LEN || at.stem.length < MIN_LEN) continue;
        const groupA = aliasIndex.get(it.stem);
        const groupB = aliasIndex.get(at.stem);
        if (groupA !== undefined && groupA === groupB) {
          return { allergen: allergy, matchedMenuItem: item.raw, matchType: 'alias' };
        }
      }
    }

    // 3. Stem match (token-level) — sonek soyma sonrası tam eşleşme
    for (const it of itemTokenPairs) {
      for (const at of allergyTokenPairs) {
        if (it.stem.length >= MIN_LEN && it.stem === at.stem) {
          return { allergen: allergy, matchedMenuItem: item.raw, matchType: 'stem' };
        }
      }
    }

    return null;
  }
}
