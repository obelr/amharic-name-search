import {
  transliterateToAmharic,
  matchesName,
  expandSearchQuery,
} from '../src/transliteration';

describe('transliterateToAmharic', () => {
  it('should transliterate common names', () => {
    expect(transliterateToAmharic('amanuel')).toContain('አማኑኤል');
    expect(transliterateToAmharic('tadesse')).toContain('ታደሰ');
    expect(transliterateToAmharic('tesfaye')).toContain('ተስፋዬ');
  });

  it('should handle partial matches', () => {
    const results = transliterateToAmharic('aman');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty array for empty input', () => {
    expect(transliterateToAmharic('')).toEqual([]);
  });

  it('should handle whitespace', () => {
    expect(transliterateToAmharic('  amanuel  ')).toContain('አማኑኤል');
  });
});

describe('matchesName', () => {
  it('should match English query with Amharic name', () => {
    expect(matchesName('አማኑኤል', 'amanuel')).toBe(true);
    expect(matchesName('አማኑኤል ፀጋዬ', 'amanuel')).toBe(true);
  });

  it('should match Amharic query with English name', () => {
    expect(matchesName('Amanuel', 'አማኑኤል')).toBe(true);
    expect(matchesName('Amanuel Tsegaye', 'አማኑኤል')).toBe(true);
  });

  it('should handle case-insensitive matching', () => {
    expect(matchesName('AMANUEL', 'amanuel')).toBe(true);
    expect(matchesName('Amanuel', 'AMANUEL')).toBe(true);
  });

  it('should return false for non-matching names', () => {
    expect(matchesName('John', 'amanuel')).toBe(false);
    expect(matchesName('አማኑኤል', 'john')).toBe(false);
  });

  it('should handle empty query', () => {
    expect(matchesName('Amanuel', '')).toBe(false);
  });

  it('should match partial names', () => {
    expect(matchesName('አማኑኤል ፀጋዬ', 'amanuel')).toBe(true);
    expect(matchesName('Amanuel Tsegaye', 'አማኑኤል')).toBe(true);
  });
});

describe('expandSearchQuery', () => {
  it('should include original query and transliterated variants', () => {
    const result = expandSearchQuery('amanuel');
    expect(result).toContain('amanuel');
    expect(result).toContain('አማኑኤል');
  });

  it('should return empty array for empty input', () => {
    expect(expandSearchQuery('')).toEqual([]);
  });

  it('should handle whitespace', () => {
    const result = expandSearchQuery('  amanuel  ');
    expect(result).toContain('amanuel');
  });
});
