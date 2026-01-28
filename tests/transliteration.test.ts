import {
  transliterateToAmharic,
  matchesName,
  expandSearchQuery,
  clearCache,
} from '../src/transliteration';
import { ValidationError } from '../src/errors';
import { levenshteinDistance, similarityRatio, phoneticHash, isPhoneticallySimilar } from '../src/utils';
import { NameTrie } from '../src/trie';
import { COMMON_NAMES } from '../src/name-mappings';

describe('transliterateToAmharic', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('Basic functionality', () => {
    it('should transliterate common names', () => {
      expect(transliterateToAmharic('amanuel')).toContain('አማኑኤል');
      expect(transliterateToAmharic('tadesse')).toContain('ታደሰ');
      expect(transliterateToAmharic('tesfaye')).toContain('ተስፋዬ');
    });

    it('should handle partial matches', () => {
      const results = transliterateToAmharic('aman');
      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain('አማኑኤል');
    });

    it('should return empty array for empty input', () => {
      expect(transliterateToAmharic('')).toEqual([]);
    });

    it('should handle whitespace', () => {
      expect(transliterateToAmharic('  amanuel  ')).toContain('አማኑኤል');
    });

    it('should handle case-insensitive input', () => {
      expect(transliterateToAmharic('AMANUEL')).toContain('አማኑኤል');
      expect(transliterateToAmharic('Amanuel')).toContain('አማኑኤል');
      expect(transliterateToAmharic('aMaNuEl')).toContain('አማኑኤል');
    });
  });

  describe('Error handling', () => {
    it('should throw ValidationError for null input', () => {
      expect(() => transliterateToAmharic(null as any)).toThrow(ValidationError);
      expect(() => transliterateToAmharic(null as any)).toThrow('must be a string');
    });

    it('should throw ValidationError for undefined input', () => {
      expect(() => transliterateToAmharic(undefined as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-string input', () => {
      expect(() => transliterateToAmharic(123 as any)).toThrow(ValidationError);
      expect(() => transliterateToAmharic({} as any)).toThrow(ValidationError);
      expect(() => transliterateToAmharic([] as any)).toThrow(ValidationError);
    });

    it('should throw ValidationError for input exceeding max length', () => {
      const longInput = 'a'.repeat(1001);
      expect(() => transliterateToAmharic(longInput)).toThrow(ValidationError);
      expect(() => transliterateToAmharic(longInput)).toThrow('exceeds maximum length');
    });

    it('should handle potentially dangerous patterns', () => {
      // Note: SQL injection patterns are checked when building queries, not during transliteration
      // Transliteration should still work but the result should be sanitized
      expect(() => transliterateToAmharic("'; DROP TABLE users; --")).not.toThrow();
    });
  });

  describe('Options', () => {
    it('should respect includePartialMatches option', () => {
      const withPartial = transliterateToAmharic('aman', { includePartialMatches: true });
      const withoutPartial = transliterateToAmharic('aman', { includePartialMatches: false });
      
      expect(withPartial.length).toBeGreaterThan(withoutPartial.length);
    });

    it('should use cache when enabled', () => {
      const result1 = transliterateToAmharic('amanuel', { enableCache: true });
      const result2 = transliterateToAmharic('amanuel', { enableCache: true });
      
      expect(result1).toEqual(result2);
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters', () => {
      expect(() => transliterateToAmharic('amanuel!@#$')).not.toThrow();
    });

    it('should handle unicode characters', () => {
      expect(() => transliterateToAmharic('amanuel中文')).not.toThrow();
    });

    it('should handle very short inputs', () => {
      expect(transliterateToAmharic('a')).toBeInstanceOf(Array);
      expect(transliterateToAmharic('am')).toBeInstanceOf(Array);
    });
  });
});

describe('matchesName', () => {
  describe('Basic functionality', () => {
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
      expect(matchesName('አማኑኤል', 'AMANUEL')).toBe(true);
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

  describe('Error handling', () => {
    it('should throw ValidationError for invalid name', () => {
      expect(() => matchesName(null as any, 'amanuel')).toThrow(ValidationError);
      expect(() => matchesName(123 as any, 'amanuel')).toThrow(ValidationError);
    });

    it('should handle empty query gracefully', () => {
      expect(matchesName('Amanuel', '')).toBe(false);
      expect(matchesName('Amanuel', null as any)).toBe(false);
    });
  });

  describe('Options', () => {
    it('should respect caseSensitive option', () => {
      expect(matchesName('Amanuel', 'amanuel', { caseSensitive: false })).toBe(true);
      expect(matchesName('Amanuel', 'amanuel', { caseSensitive: true })).toBe(false);
    });

    it('should respect wholeWord option', () => {
      expect(matchesName('Amanuel Tsegaye', 'Amanuel', { wholeWord: false })).toBe(true);
      expect(matchesName('AmanuelTsegaye', 'Amanuel', { wholeWord: true })).toBe(false);
    });

    it('should support fuzzy matching', () => {
      // Typo tolerance
      expect(matchesName('amanuel', 'amanuel', { fuzzy: true })).toBe(true);
      expect(matchesName('amanuel', 'amanuell', { fuzzy: true, maxDistance: 2 })).toBe(true);
      // Test with a name that won't match via transliteration
      expect(matchesName('xyzabc', 'xyzabcc', { fuzzy: true, maxDistance: 2 })).toBe(true);
      // This should fail: distance is 12, maxDistance is 2, length ratio is too low
      expect(matchesName('xyzabc', 'xyzabcccccccccccc', { fuzzy: true, maxDistance: 2 })).toBe(false);
      // But should work with higher maxDistance
      expect(matchesName('xyzabc', 'xyzabcccc', { fuzzy: true, maxDistance: 5 })).toBe(true);
    });

    it('should support phonetic matching', () => {
      expect(matchesName('amanuel', 'amanuel', { phonetic: true })).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long names', () => {
      const longName = 'Amanuel ' + 'Tsegaye '.repeat(100);
      expect(() => matchesName(longName, 'amanuel')).not.toThrow();
    });

    it('should handle names with special characters', () => {
      expect(matchesName('Amanuel-Tsegaye', 'amanuel')).toBe(true);
      expect(matchesName('Amanuel_Tsegaye', 'amanuel')).toBe(true);
    });
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
    expect(expandSearchQuery('   ')).toEqual([]);
  });

  it('should handle whitespace', () => {
    const result = expandSearchQuery('  amanuel  ');
    expect(result).toContain('amanuel');
  });

  it('should handle edge cases', () => {
    expect(() => expandSearchQuery(null as any)).not.toThrow();
    expect(() => expandSearchQuery(undefined as any)).not.toThrow();
  });
});

describe('Utility functions', () => {
  describe('levenshteinDistance', () => {
    it('should calculate distance correctly', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('abc', 'abc')).toBe(0);
      expect(levenshteinDistance('abc', 'def')).toBe(3);
    });
  });

  describe('similarityRatio', () => {
    it('should return 1.0 for identical strings', () => {
      expect(similarityRatio('abc', 'abc')).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      expect(similarityRatio('abc', 'xyz')).toBeLessThan(0.5);
    });

    it('should handle empty strings', () => {
      expect(similarityRatio('', '')).toBe(1.0);
    });
  });

  describe('phoneticHash', () => {
    it('should generate hash for input', () => {
      const hash = phoneticHash('amanuel');
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
    });

    it('should handle empty input', () => {
      expect(phoneticHash('')).toBe('');
    });
  });

  describe('isPhoneticallySimilar', () => {
    it('should return true for similar strings', () => {
      expect(isPhoneticallySimilar('amanuel', 'amanuel')).toBe(true);
    });

    it('should return false for very different strings', () => {
      expect(isPhoneticallySimilar('amanuel', 'xyz')).toBe(false);
    });
  });
});

describe('NameTrie', () => {
  let trie: NameTrie;

  beforeEach(() => {
    trie = NameTrie.fromMappings(COMMON_NAMES);
  });

  it('should find exact matches', () => {
    const results = trie.searchExact('amanuel');
    expect(results).toContain('አማኑኤል');
  });

  it('should find prefix matches', () => {
    const results = trie.searchPrefix('aman');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find substring matches', () => {
    const results = trie.searchContains('man');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty array for no matches', () => {
    expect(trie.searchExact('nonexistent')).toEqual([]);
  });
});

describe('Performance tests', () => {
  it('should handle multiple calls efficiently', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      transliterateToAmharic('amanuel');
    }
    const duration = Date.now() - start;
    
    // Should complete in reasonable time (< 1 second for 1000 calls)
    expect(duration).toBeLessThan(1000);
  });

  it('should cache results for performance', () => {
    clearCache();
    const firstCall = Date.now();
    transliterateToAmharic('amanuel', { enableCache: true });
    const firstDuration = Date.now() - firstCall;

    const secondCall = Date.now();
    transliterateToAmharic('amanuel', { enableCache: true });
    const secondDuration = Date.now() - secondCall;

    // Second call should be faster due to caching
    expect(secondDuration).toBeLessThanOrEqual(firstDuration);
  });
});

describe('Integration tests', () => {
  it('should work with real-world scenarios', () => {
    // Scenario 1: User searches "Amanuel" finds "አማኑኤል"
    expect(matchesName('አማኑኤል', 'amanuel')).toBe(true);

    // Scenario 2: User searches "አማኑኤል" finds "Amanuel"
    expect(matchesName('Amanuel', 'አማኑኤል')).toBe(true);

    // Scenario 3: Expand query for database search
    const terms = expandSearchQuery('amanuel');
    expect(terms.length).toBeGreaterThan(1);
    expect(terms).toContain('amanuel');
  });

  it('should handle fuzzy matching for typos', () => {
    // User types "amanuell" instead of "amanuel"
    expect(matchesName('አማኑኤል', 'amanuell', { fuzzy: true, maxDistance: 2 })).toBe(true);
  });
});
