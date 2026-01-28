/**
 * Core transliteration functions with error handling, performance optimization,
 * and advanced matching capabilities
 */

import { COMMON_NAMES } from './name-mappings';
import type { TransliterationOptions, MatchOptions } from './types';
import { validateAndSanitizeInput, validateSearchQuery } from './validation';
import { NameTrie } from './trie';
import { levenshteinDistance, isPhoneticallySimilar } from './utils';
import { romanizeAmharicToAscii, containsAmharic, matchesTransliterationVariant } from './romanization';

// Initialize Trie for fast lookups (lazy loaded)
let nameTrie: NameTrie | null = null;

/**
 * Get or create the name trie
 */
function getNameTrie(): NameTrie {
  if (!nameTrie) {
    nameTrie = NameTrie.fromMappings(COMMON_NAMES);
  }
  return nameTrie;
}

// LRU Cache for transliteration results
const transliterationCache = new Map<string, string[]>();
const MAX_CACHE_SIZE = 1000;

/**
 * Cache management
 */
function getCached(key: string): string[] | undefined {
  return transliterationCache.get(key);
}

function setCache(key: string, value: string[]): void {
  // LRU eviction
  if (transliterationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = transliterationCache.keys().next().value;
    if (firstKey !== undefined) {
      transliterationCache.delete(firstKey);
    }
  }
  transliterationCache.set(key, value);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  transliterationCache.clear();
}

/**
 * Converts English phonetic input to possible Amharic character sequences
 * 
 * @param englishText - English text to transliterate
 * @param options - Transliteration options
 * @returns Array of Amharic name variants that match the English input
 * 
 * @example
 * ```ts
 * transliterateToAmharic('amanuel')
 * // Returns: ['አማኑኤል']
 * ```
 * 
 * @throws {ValidationError} If input is invalid
 */
export function transliterateToAmharic(
  englishText: string,
  options: TransliterationOptions = {}
): string[] {
  const {
    includePartialMatches = true,
    enableCache = true,
  } = options;

  // Handle empty string input gracefully (return empty array)
  if (typeof englishText === 'string' && englishText.trim().length === 0) {
    return [];
  }

  // Validate and sanitize input (but don't check for SQL injection patterns here)
  // SQL injection is only a concern when building queries, not for transliteration
  // This will throw ValidationError for non-string inputs
  const sanitized = validateAndSanitizeInput(englishText);
  const lower = sanitized.toLowerCase().trim();

  if (!lower) {
    return [];
  }

  // Check cache
  const cacheKey = `${lower}:${includePartialMatches}`;
  if (enableCache) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  const results: Set<string> = new Set();
  const trie = getNameTrie();

  // Check for exact match first (fastest)
  const exactMatches = trie.searchExact(lower);
  exactMatches.forEach(variant => results.add(variant));

  // Try partial matches if enabled
  if (includePartialMatches) {
    // Use trie for prefix search (faster than O(n) iteration)
    const prefixMatches = trie.searchPrefix(lower);
    prefixMatches.forEach(variant => results.add(variant));

    // Also check if query is substring of any name
    const containsMatches = trie.searchContains(lower);
    containsMatches.forEach(variant => results.add(variant));
  }

  const resultArray = Array.from(results);

  // Cache result
  if (enableCache) {
    setCache(cacheKey, resultArray);
  }

  return resultArray;
}

/**
 * Checks if a name matches a search query, considering transliteration
 * 
 * @param name - The name to check (could be in Amharic or English)
 * @param query - The search query (could be in Amharic or English)
 * @param options - Match options
 * @returns true if the name matches the query
 * 
 * @example
 * ```ts
 * matchesName('አማኑኤል', 'amanuel')
 * // Returns: true
 * ```
 * 
 * @throws {ValidationError} If inputs are invalid
 */
export function matchesName(
  name: string,
  query: string,
  options: MatchOptions = {}
): boolean {
  // Validate inputs
  const sanitizedName = validateAndSanitizeInput(name, 1000, 'name');
  const sanitizedQuery = validateSearchQuery(query, 'query');

  if (!sanitizedQuery) {
    return false;
  }

  const {
    caseSensitive = false,
    wholeWord = false,
    fuzzy = false,
    maxDistance = 2,
    phonetic = false,
  } = options;

  const nameToCheck = caseSensitive ? sanitizedName : sanitizedName.toLowerCase();
  const queryToCheck = caseSensitive ? sanitizedQuery : sanitizedQuery.toLowerCase();

  const nameTrimmed = nameToCheck.trim();
  const queryTrimmed = queryToCheck.trim();

  if (!queryTrimmed) {
    return false;
  }

  // Precompute romanized forms when Amharic is involved.
  // This uses the official romanization table (simplified to ASCII)
  // so that queries like "Ama" can still match "አማኑኤል".
  const hasAmharicInName = containsAmharic(nameTrimmed);
  const hasAmharicInQuery = containsAmharic(queryTrimmed);

  const romanizedName = hasAmharicInName ? romanizeAmharicToAscii(nameTrimmed) : '';
  const romanizedQuery = hasAmharicInQuery ? romanizeAmharicToAscii(queryTrimmed) : '';

  // Direct match
  if (wholeWord) {
    if (nameTrimmed === queryTrimmed) {
      return true;
    }
  } else {
    // When fuzzy matching is enabled, be more strict about substring matching
    // to avoid false positives
    if (fuzzy) {
      // Only do substring match if lengths are similar
      const lengthRatio = Math.min(nameTrimmed.length, queryTrimmed.length) / 
                         Math.max(nameTrimmed.length, queryTrimmed.length);
      if (lengthRatio >= 0.7) {
        if (nameTrimmed.includes(queryTrimmed) || queryTrimmed.includes(nameTrimmed)) {
          return true;
        }
      }
    } else {
      if (nameTrimmed.includes(queryTrimmed) || queryTrimmed.includes(nameTrimmed)) {
        return true;
      }
    }
    
    // Handle transliteration variants for English-to-English matching
    // This handles cases like "tas" vs "tes" where people write names inconsistently
    // Check if query is a prefix/substring with transliteration variants
    // Only do this if case sensitivity allows it (or if we're case-insensitive)
    if (!caseSensitive && queryTrimmed.length >= 2 && nameTrimmed.length >= queryTrimmed.length) {
      const namePrefix = nameTrimmed.substring(0, queryTrimmed.length);
      if (matchesTransliterationVariant(namePrefix, queryTrimmed, 1.5)) {
        return true;
      }
    }
  }

  // Fuzzy matching (typo tolerance) - only if strings are similar length
  if (fuzzy) {
    const distance = levenshteinDistance(nameTrimmed, queryTrimmed);
    const maxLen = Math.max(nameTrimmed.length, queryTrimmed.length);
    const minLen = Math.min(nameTrimmed.length, queryTrimmed.length);
    
    // Only match if distance is within threshold
    if (distance <= maxDistance && maxLen > 0) {
      const normalizedDistance = distance / maxLen;
      const lengthRatio = minLen / maxLen;
      
      // Require reasonable length similarity (at least 60% match) and low normalized distance
      // Also ensure the actual distance doesn't exceed maxDistance
      if (distance <= maxDistance && normalizedDistance <= 0.25 && lengthRatio >= 0.6) {
        return true;
      }
    }
  }

  // Phonetic matching
  if (phonetic) {
    if (isPhoneticallySimilar(nameTrimmed, queryTrimmed)) {
      return true;
    }
  }

  /**
   * Romanization-based matching
   *
   * This path is critical for partial English queries like "Ama"
   * matching Amharic names like "አማኑኤል". It relies on the
   * Amharic → Latin mapping derived from the official table.
   */
  // Case 1: name is Amharic, query is English (or general Latin text)
  if (hasAmharicInName && !hasAmharicInQuery) {
    if (romanizedName) {
      // Simple direct / substring / prefix checks on romanized form
      if (romanizedName === queryTrimmed) {
        return true;
      }
      if (
        romanizedName.includes(queryTrimmed) ||
        queryTrimmed.includes(romanizedName)
      ) {
        return true;
      }

      // Handle multi-word queries: "Ama Tseg" should match "አማኑኤል ፀጋዬ"
      if (queryTrimmed.includes(' ')) {
        const queryWords = queryTrimmed.split(/\s+/).filter(w => w.length > 0);
        const nameWords = romanizedName.split(/\s+/).filter(w => w.length > 0);
        
        // Check if all query words match some part of the name
        let allWordsMatch = true;
        for (const queryWord of queryWords) {
          let wordMatches = false;
          for (const nameWord of nameWords) {
            // Direct substring/prefix match
            if (nameWord.includes(queryWord) || queryWord.includes(nameWord) || 
                nameWord.startsWith(queryWord) || queryWord.startsWith(nameWord)) {
              wordMatches = true;
              break;
            }
            // Handle transliteration variants (e.g., "tseg" vs "tsag", "tas" vs "tes")
            // This handles "weird" spellings where people don't follow strict romanization
            if (queryWord.length >= 2 && nameWord.length >= queryWord.length) {
              const namePrefix = nameWord.substring(0, queryWord.length);
              
              // Use transliteration-aware matching for variants
              if (matchesTransliterationVariant(namePrefix, queryWord, 2.0)) {
                wordMatches = true;
                break;
              }
              
              // Also check with standard Levenshtein as fallback
              const distance = levenshteinDistance(namePrefix.toLowerCase(), queryWord.toLowerCase());
              if (distance <= 2 && namePrefix.length >= 2) {
                wordMatches = true;
                break;
              }
            }
          }
          if (!wordMatches) {
            allWordsMatch = false;
            break;
          }
        }
        if (allWordsMatch) {
          return true;
        }
      }

      if (fuzzy) {
        const distance = levenshteinDistance(romanizedName, queryTrimmed);
        const maxLen = Math.max(romanizedName.length, queryTrimmed.length);
        const minLen = Math.min(romanizedName.length, queryTrimmed.length);
        if (maxLen > 0) {
          const normalizedDistance = distance / maxLen;
          const lengthRatio = minLen / maxLen;
          if (
            distance <= maxDistance &&
            normalizedDistance <= 0.35 &&
            lengthRatio >= 0.5
          ) {
            return true;
          }
        }
      }
    }
  }

  // Case 2: query is Amharic, name is English
  if (!hasAmharicInName && hasAmharicInQuery) {
    if (romanizedQuery) {
      // Compare romanized Amharic query against English name
      if (nameTrimmed === romanizedQuery) {
        return true;
      }
      // Check if romanized query is a prefix/substring of the name (for partial matches)
      if (nameTrimmed.includes(romanizedQuery)) {
        return true;
      }
      // Also check if name starts with romanized query (for better prefix matching)
      if (nameTrimmed.startsWith(romanizedQuery)) {
        return true;
      }
      // Handle transliteration variants: check if name starts with a variant
      // e.g., "tas" vs "tes" - check if name starts with similar prefix
      // This handles "weird" spellings where people don't follow strict romanization
      if (romanizedQuery.length >= 2 && nameTrimmed.length >= romanizedQuery.length) {
        const namePrefix = nameTrimmed.substring(0, romanizedQuery.length);
        
        // Use transliteration-aware matching for variants like ta/te, sa/se
        if (matchesTransliterationVariant(namePrefix, romanizedQuery, 1.5)) {
          return true;
        }
        
        // Also check with standard Levenshtein as fallback
        const distance = levenshteinDistance(namePrefix.toLowerCase(), romanizedQuery.toLowerCase());
        if (distance <= 1) {
          return true;
        }
      }
      // Reverse: check if romanized query starts with name (for very short names)
      if (romanizedQuery.includes(nameTrimmed)) {
        return true;
      }

      if (fuzzy) {
        const distance = levenshteinDistance(nameTrimmed, romanizedQuery);
        const maxLen = Math.max(nameTrimmed.length, romanizedQuery.length);
        const minLen = Math.min(nameTrimmed.length, romanizedQuery.length);
        if (maxLen > 0) {
          const normalizedDistance = distance / maxLen;
          const lengthRatio = minLen / maxLen;
          // More lenient for reverse matching
          if (
            distance <= maxDistance &&
            normalizedDistance <= 0.4 &&
            lengthRatio >= 0.4
          ) {
            return true;
          }
        }
      }
    }
  }

  // Check if query is English and name is Amharic
  const amharicVariants = transliterateToAmharic(queryTrimmed, { enableCache: true });
  for (const variant of amharicVariants) {
    if (name.includes(variant)) {
      return true;
    }

    // Fuzzy match on Amharic variants
    if (fuzzy) {
      const distance = levenshteinDistance(name, variant);
      if (distance <= maxDistance) {
        return true;
      }
    }
  }

  // Check if query is Amharic and name contains English transliteration
  for (const [english, amharic] of Object.entries(COMMON_NAMES)) {
    const englishLower = caseSensitive ? english : english.toLowerCase();

    // Direct match
    if (nameToCheck.includes(englishLower) && queryTrimmed.includes(amharic)) {
      return true;
    }
    if (name.includes(amharic) && queryTrimmed.includes(englishLower)) {
      return true;
    }

    // Fuzzy match
    if (fuzzy) {
      const nameDistance = levenshteinDistance(nameToCheck, englishLower);
      const queryDistance = levenshteinDistance(queryTrimmed, amharic);

      if (nameDistance <= maxDistance || queryDistance <= maxDistance) {
        return true;
      }
    }

    // Phonetic match
    if (phonetic) {
      if (
        isPhoneticallySimilar(nameToCheck, englishLower) ||
        isPhoneticallySimilar(queryTrimmed, amharic)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Expands a search query to include transliterated Amharic variants
 * Useful for database queries or search APIs
 * 
 * @param query - Search query to expand
 * @returns Array of search terms including original and transliterated variants
 * 
 * @example
 * ```ts
 * expandSearchQuery('amanuel')
 * // Returns: ['amanuel', 'አማኑኤል']
 * ```
 */
export function expandSearchQuery(query: string): string[] {
  // Allow empty queries (return empty array)
  const sanitized = validateSearchQuery(query);
  if (!sanitized) {
    return [];
  }

  const searchTerms: Set<string> = new Set([sanitized]);

  // Get transliterated variants
  const amharicVariants = transliterateToAmharic(sanitized, { enableCache: true });

  // Add variants
  amharicVariants.forEach(variant => {
    if (variant.length >= 2 || sanitized.length === 1) {
      searchTerms.add(variant);
    }
  });

  return Array.from(searchTerms);
}
