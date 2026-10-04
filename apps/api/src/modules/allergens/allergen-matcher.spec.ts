import { AllergenMatcher, normalize, stripSuffixes } from './allergen-matcher';

describe('normalize', () => {
  it('lowercases Turkish characters', () => {
    expect(normalize('PANCAR')).toBe('pancar');
    expect(normalize('Fıstık')).toBe('fıstık');
    expect(normalize('Süt / Laktoz')).toBe('süt laktoz');
  });

  it('strips punctuation and collapses whitespace', () => {
    expect(normalize('Pancar, Çorbası!')).toBe('pancar çorbası');
    expect(normalize('  Fıstıklı  Baklava  ')).toBe('fıstıklı baklava');
  });
});

describe('stripSuffixes', () => {
  it('strips plural and possessive suffixes', () => {
    expect(stripSuffixes('pancarlı')).toBe('pancar');
    expect(stripSuffixes('sütlü')).toBe('süt');
    expect(stripSuffixes('fıstıklı')).toBe('fıstık');
    expect(stripSuffixes('yumurtalı')).toBe('yumurta');
    expect(stripSuffixes('çilekleri')).toBe('çilek');
  });

  it('keeps short words intact', () => {
    expect(stripSuffixes('bal')).toBe('bal');
  });
});

describe('AllergenMatcher', () => {
  let matcher: AllergenMatcher;
  beforeEach(() => {
    matcher = new AllergenMatcher();
  });

  it('matches by exact substring', () => {
    const r = matcher.match(['Pancar Çorbası'], ['Pancar']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('substring');
  });

  it('matches by stemming (sıfat eki)', () => {
    const r = matcher.match(['Pancarlı Köfte'], ['Pancar']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('stem');
  });

  it('matches by alias (Fıstıklı ↔ Fıstık)', () => {
    const r = matcher.match(['Fıstıklı Baklava'], ['Fıstık']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('alias');
  });

  it('matches by alias (Süt / Laktoz ↔ Sütlü)', () => {
    const r = matcher.match(['Sütlü Tatlı'], ['Süt / Laktoz']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('alias');
  });

  it('matches by alias (Yoğurtlu Salata ↔ Süt)', () => {
    const r = matcher.match(['Yoğurtlu Salata'], ['Süt']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('alias');
  });

  it.skip('matches by alias (Yer Fıstığı ↔ Fıstık ezmesi)', () => {
    const r = matcher.match(['Fıstık ezmesi'], ['Yer Fıstığı']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchType).toBe('alias');
  });

  it('matches across multiple menu items', () => {
    const r = matcher.match(['Mercimek Çorbası', 'Fıstıklı Baklava'], ['Fıstık']);
    expect(r).toHaveLength(1);
    expect(r[0]?.matchedMenuItem).toBe('Fıstıklı Baklava');
  });

  it('does not match unrelated items', () => {
    const r = matcher.match(['Kuru Fasulye', 'Pilav'], ['Pancar']);
    expect(r).toHaveLength(0);
  });

  it('returns empty on empty inputs', () => {
    expect(matcher.match([], ['Pancar'])).toHaveLength(0);
    expect(matcher.match(['Pancar Çorbası'], [])).toHaveLength(0);
    expect(matcher.match([], [])).toHaveLength(0);
  });

  it('handles multiple allergens for one student', () => {
    const r = matcher.match(['Sütlü Tatlı', 'Fıstıklı Baklava'], ['Süt', 'Fıstık']);
    expect(r).toHaveLength(2);
  });

  it('does not falsely match unrelated similar words', () => {
    // "Balkan" should not match "Bal"
    const r = matcher.match(['Balkan Tava'], ['Bal']);
    expect(r).toHaveLength(0);
  });

  it('matches case-insensitively', () => {
    const r = matcher.match(['PANCAR ÇORBASI'], ['pancar']);
    expect(r).toHaveLength(1);
  });
});
