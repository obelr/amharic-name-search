/**
 * Type definitions for the transliteration library
 */

export interface TransliterationOptions {
  /**
   * Include partial matches (e.g., "aman" matches "amanuel")
   * @default true
   */
  includePartialMatches?: boolean;
  
  /**
   * Include phonetic syllable matching for short queries
   * @default true
   */
  includePhoneticMatching?: boolean;
  
  /**
   * Enable caching for better performance
   * @default true
   */
  enableCache?: boolean;
}

export interface MatchOptions {
  /**
   * Case-sensitive matching
   * @default false
   */
  caseSensitive?: boolean;
  
  /**
   * Match whole words only
   * @default false
   */
  wholeWord?: boolean;
  
  /**
   * Enable fuzzy matching (typo tolerance)
   * @default false
   */
  fuzzy?: boolean;
  
  /**
   * Maximum Levenshtein distance for fuzzy matching
   * @default 2
   */
  maxDistance?: number;
  
  /**
   * Enable phonetic matching
   * @default false
   */
  phonetic?: boolean;
  
  /**
   * Minimum similarity ratio for phonetic matching (0-1)
   * @default 0.7
   */
  minSimilarity?: number;
}
