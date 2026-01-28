import { COMMON_NAMES } from './name-mappings';
import type { TransliterationOptions, MatchOptions } from './types';

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
 */
export function transliterateToAmharic(
  englishText: string,
  options: TransliterationOptions = {}
): string[] {
  const {
    includePartialMatches = true,
  } = options;

  const lower = englishText.toLowerCase().trim();
  if (!lower) return [];

  const results: Set<string> = new Set();
  
  // Check for exact match first
  if (COMMON_NAMES[lower]) {
    results.add(COMMON_NAMES[lower]);
  }
  
  // Try partial matches if enabled
  if (includePartialMatches) {
    for (const [english, amharic] of Object.entries(COMMON_NAMES)) {
      if (lower.includes(english) || english.includes(lower)) {
        results.add(amharic);
      }
    }
  }
  
  return Array.from(results);
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
 */
export function matchesName(
  name: string,
  query: string,
  options: MatchOptions = {}
): boolean {
  const {
    caseSensitive = false,
    wholeWord = false,
  } = options;

  const nameToCheck = caseSensitive ? name : name.toLowerCase();
  const queryToCheck = caseSensitive ? query : query.toLowerCase();
  
  const nameTrimmed = nameToCheck.trim();
  const queryTrimmed = queryToCheck.trim();
  
  if (!queryTrimmed) return false;
  
  // Direct match
  if (wholeWord) {
    if (nameTrimmed === queryTrimmed) return true;
  } else {
    if (nameTrimmed.includes(queryTrimmed) || queryTrimmed.includes(nameTrimmed)) {
      return true;
    }
  }
  
  // Check if query is English and name is Amharic
  const amharicVariants = transliterateToAmharic(queryTrimmed);
  for (const variant of amharicVariants) {
    if (name.includes(variant)) {
      return true;
    }
  }
  
  // Check if query is Amharic and name contains English transliteration
  for (const [english, amharic] of Object.entries(COMMON_NAMES)) {
    const englishLower = caseSensitive ? english : english.toLowerCase();
    if (nameToCheck.includes(englishLower) && queryTrimmed.includes(amharic)) {
      return true;
    }
    if (name.includes(amharic) && queryTrimmed.includes(englishLower)) {
      return true;
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
  const trimmed = query.trim();
  if (!trimmed) return [];

  const searchTerms: Set<string> = new Set([trimmed]);

  // Get transliterated variants
  const amharicVariants = transliterateToAmharic(trimmed);
  
  // Add variants
  amharicVariants.forEach(variant => {
    if (variant.length >= 2 || trimmed.length === 1) {
      searchTerms.add(variant);
    }
  });

  return Array.from(searchTerms);
}
