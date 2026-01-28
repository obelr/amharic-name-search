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
} from './transliteration';

export type {
  TransliterationOptions,
  MatchOptions,
} from './types';

// Re-export common name mappings for advanced usage
export { COMMON_NAMES } from './name-mappings';
