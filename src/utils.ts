/**
 * Utility functions for performance and matching
 */

/**
 * Levenshtein distance calculation for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio (0-1) between two strings
 */
export function similarityRatio(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Simple phonetic hash for Amharic names (Soundex-like)
 */
export function phoneticHash(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const normalized = input.toLowerCase().trim();
  if (!normalized) return '';

  // Amharic phonetic mapping
  const phoneticMap: Record<string, string> = {
    // Common Amharic character groups
    'አ': 'A',
    'ኡ': 'U',
    'ኢ': 'I',
    'ኤ': 'E',
    'ኦ': 'O',
    'በ': 'B',
    'ቡ': 'BU',
    'ቢ': 'BI',
    'ቤ': 'BE',
    'ቦ': 'BO',
    'ተ': 'T',
    'ቱ': 'TU',
    'ቲ': 'TI',
    'ቴ': 'TE',
    'ቶ': 'TO',
    'ሀ': 'H',
    'ሁ': 'HU',
    'ሂ': 'HI',
    'ሄ': 'HE',
    'ሆ': 'HO',
    'መ': 'M',
    'ሙ': 'MU',
    'ሚ': 'MI',
    'ሜ': 'ME',
    'ሞ': 'MO',
    'ረ': 'R',
    'ሩ': 'RU',
    'ሪ': 'RI',
    'ሬ': 'RE',
    'ሮ': 'RO',
    'ሰ': 'S',
    'ሱ': 'SU',
    'ሲ': 'SI',
    'ሴ': 'SE',
    'ሶ': 'SO',
    'የ': 'Y',
    'ዩ': 'YU',
    'ዪ': 'YI',
    'ዬ': 'YE',
    'ዮ': 'YO',
  };

  let hash = '';
  for (const char of normalized) {
    if (phoneticMap[char]) {
      hash += phoneticMap[char];
    } else if (/[a-z]/.test(char)) {
      hash += char.toUpperCase();
    }
  }

  // Remove duplicates and limit length
  const unique = hash
    .split('')
    .filter((char, index, arr) => arr.indexOf(char) === index)
    .join('')
    .substring(0, 6);

  return unique || normalized.substring(0, 6).toUpperCase();
}

/**
 * Check if two strings are phonetically similar
 */
export function isPhoneticallySimilar(str1: string, str2: string): boolean {
  const hash1 = phoneticHash(str1);
  const hash2 = phoneticHash(str2);

  if (!hash1 || !hash2) return false;

  // Check if hashes match or are similar
  if (hash1 === hash2) return true;

  // Check similarity ratio
  const similarity = similarityRatio(hash1, hash2);
  return similarity >= 0.7; // 70% similarity threshold
}

/**
 * Memoization helper
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  cacheSize: number = 1000
): T {
  const cache = new Map<string, ReturnType<T>>();
  const maxSize = cacheSize;

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    // LRU eviction
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as T;
}
