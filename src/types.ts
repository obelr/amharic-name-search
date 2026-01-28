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
}
