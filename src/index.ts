/**
 * Amharic Name Search Library
 * 
 * Search and match Ethiopian names in both English and Amharic scripts.
 * 
 * @packageDocumentation
 */

export {
  transliterateToAmharic,
  matchesName,
  expandSearchQuery,
  clearCache,
} from './transliteration';

export type {
  TransliterationOptions,
  MatchOptions,
} from './types';

// Re-export common name mappings for advanced usage
export { COMMON_NAMES } from './name-mappings';

// Export error classes
export {
  TransliterationError,
  ValidationError,
  SecurityError,
  ERROR_CODES,
} from './errors';

// Export utilities for advanced usage
export {
  levenshteinDistance,
  similarityRatio,
  phoneticHash,
  isPhoneticallySimilar,
  memoize,
} from './utils';

// Export Trie for advanced usage
export { NameTrie } from './trie';

// Export validation utilities
export {
  validateAndSanitizeInput,
  validateSearchQuery,
  sanitizeInput,
  MAX_INPUT_LENGTH,
  MAX_QUERY_LENGTH,
} from './validation';
