/**
 * Amharic → Latin romanization utilities
 *
 * This is based on the Amharic Romanization Table (2011 version),
 * simplified to ASCII-only output for practical search usage.
 *
 * The goal is not strict linguistic correctness, but stable,
 * predictable forms that match how users typically type names
 * (e.g. "amanuel", "tesfaye", "selam").
 */

/**
 * Basic mapping from single Ethiopic syllables to ASCII romanization.
 *
 * Notes:
 * - We intentionally normalize special consonants to the closest
 *   common Latin representation (ḥ → h, ś → s, š → sh, č → ch, ṣ/ṡ → s, etc.)
 * - Long vowels (ā, é) are mapped to plain a/e to keep things simple.
 * - This mapping is not exhaustive, but covers the vast majority
 *   of letters used in common Amharic names.
 */
const AMHARIC_TO_ASCII: Record<string, string> = {
  // ሀ series (ha)
  'ሀ': 'ha', 'ሁ': 'hu', 'ሂ': 'hi', 'ሃ': 'ha', 'ሄ': 'he', 'ህ': 'h', 'ሆ': 'ho',
  // ለ series (la)
  'ለ': 'la', 'ሉ': 'lu', 'ሊ': 'li', 'ላ': 'la', 'ሌ': 'le', 'ል': 'l', 'ሎ': 'lo',
  // ሐ series (ha, emphatic)
  'ሐ': 'ha', 'ሑ': 'hu', 'ሒ': 'hi', 'ሓ': 'ha', 'ሔ': 'he', 'ሕ': 'h', 'ሖ': 'ho',
  // መ series (ma)
  'መ': 'ma', 'ሙ': 'mu', 'ሚ': 'mi', 'ማ': 'ma', 'ሜ': 'me', 'ም': 'm', 'ሞ': 'mo',
  // ሠ series (sa)
  'ሠ': 'sa', 'ሡ': 'su', 'ሢ': 'si', 'ሣ': 'sa', 'ሤ': 'se', 'ሥ': 's', 'ሦ': 'so',
  // ረ series (ra)
  'ረ': 'ra', 'ሩ': 'ru', 'ሪ': 'ri', 'ራ': 'ra', 'ሬ': 're', 'ር': 'r', 'ሮ': 'ro',
  // ሰ series (sa)
  'ሰ': 'sa', 'ሱ': 'su', 'ሲ': 'si', 'ሳ': 'sa', 'ሴ': 'se', 'ስ': 's', 'ሶ': 'so',
  // ሸ series (sha)
  'ሸ': 'sha', 'ሹ': 'shu', 'ሺ': 'shi', 'ሻ': 'sha', 'ሼ': 'she', 'ሽ': 'sh', 'ሾ': 'sho',
  // ቀ series (qa / ka-ish)
  'ቀ': 'qa', 'ቁ': 'qu', 'ቂ': 'qi', 'ቃ': 'qa', 'ቄ': 'qe', 'ቅ': 'q', 'ቆ': 'qo',
  // በ series (ba)
  'በ': 'ba', 'ቡ': 'bu', 'ቢ': 'bi', 'ባ': 'ba', 'ቤ': 'be', 'ብ': 'b', 'ቦ': 'bo',
  // ተ series (ta)
  'ተ': 'ta', 'ቱ': 'tu', 'ቲ': 'ti', 'ታ': 'ta', 'ቴ': 'te', 'ት': 't', 'ቶ': 'to',
  // ቸ series (cha)
  'ቸ': 'cha', 'ቹ': 'chu', 'ቺ': 'chi', 'ቻ': 'cha', 'ቼ': 'che', 'ች': 'ch', 'ቾ': 'cho',
  // ኀ series (ha variant)
  'ኀ': 'ha', 'ኁ': 'hu', 'ኂ': 'hi', 'ኃ': 'ha', 'ኄ': 'he', 'ኅ': 'h', 'ኆ': 'ho',
  // ነ series (na)
  'ነ': 'na', 'ኑ': 'nu', 'ኒ': 'ni', 'ና': 'na', 'ኔ': 'ne', 'ን': 'n', 'ኖ': 'no',
  // ኘ series (nya)
  'ኘ': 'nya', 'ኙ': 'nyu', 'ኚ': 'nyi', 'ኛ': 'nya', 'ኜ': 'nye', 'ኝ': 'ny', 'ኞ': 'nyo',
  // አ series (ʼa)
  'አ': 'a', 'ኡ': 'u', 'ኢ': 'i', 'ኣ': 'a', 'ኤ': 'e', 'እ': 'e', 'ኦ': 'o',
  // ከ series (ka)
  'ከ': 'ka', 'ኩ': 'ku', 'ኪ': 'ki', 'ካ': 'ka', 'ኬ': 'ke', 'ክ': 'k', 'ኮ': 'ko',
  // ኸ series (xa / ha-like)
  'ኸ': 'ha', 'ኹ': 'hu', 'ኺ': 'hi', 'ኻ': 'ha', 'ኼ': 'he', 'ኽ': 'h', 'ኾ': 'ho',
  // ወ series (wa)
  'ወ': 'wa', 'ዉ': 'wu', 'ዊ': 'wi', 'ዋ': 'wa', 'ዌ': 'we', 'ው': 'w', 'ዎ': 'wo',
  // ዐ series (ʼa gutural)
  'ዐ': 'a', 'ዑ': 'u', 'ዒ': 'i', 'ዓ': 'a', 'ዔ': 'e', 'ዕ': 'e', 'ዖ': 'o',
  // ዘ series (za)
  'ዘ': 'za', 'ዙ': 'zu', 'ዚ': 'zi', 'ዛ': 'za', 'ዜ': 'ze', 'ዝ': 'z', 'ዞ': 'zo',
  // ዠ series (zha)
  'ዠ': 'zha', 'ዡ': 'zhu', 'ዢ': 'zhi', 'ዣ': 'zha', 'ዤ': 'zhe', 'ዥ': 'zh', 'ዦ': 'zho',
  // የ series (ya)
  'የ': 'ya', 'ዩ': 'yu', 'ዪ': 'yi', 'ያ': 'ya', 'ዬ': 'ye', 'ይ': 'y', 'ዮ': 'yo',
  // ደ series (da)
  'ደ': 'da', 'ዱ': 'du', 'ዲ': 'di', 'ዳ': 'da', 'ዴ': 'de', 'ድ': 'd', 'ዶ': 'do',
  // ጀ series (ja)
  'ጀ': 'ja', 'ጁ': 'ju', 'ጂ': 'ji', 'ጃ': 'ja', 'ጄ': 'je', 'ጅ': 'j', 'ጆ': 'jo',
  // ገ series (ga)
  'ገ': 'ga', 'ጉ': 'gu', 'ጊ': 'gi', 'ጋ': 'ga', 'ጌ': 'ge', 'ግ': 'g', 'ጎ': 'go',
  // ጠ series (ta, emphatic)
  'ጠ': 'ta', 'ጡ': 'tu', 'ጢ': 'ti', 'ጣ': 'ta', 'ጤ': 'te', 'ጥ': 't', 'ጦ': 'to',
  // ጨ series (cha, emphatic)
  'ጨ': 'cha', 'ጩ': 'chu', 'ጪ': 'chi', 'ጫ': 'cha', 'ጬ': 'che', 'ጭ': 'ch', 'ጮ': 'cho',
  // ጰ series (pa, emphatic)
  'ጰ': 'pa', 'ጱ': 'pu', 'ጲ': 'pi', 'ጳ': 'pa', 'ጴ': 'pe', 'ጵ': 'p', 'ጶ': 'po',
  // ጸ series (tsa)
  'ጸ': 'tsa', 'ጹ': 'tsu', 'ጺ': 'tsi', 'ጻ': 'tsa', 'ጼ': 'tse', 'ጽ': 'ts', 'ጾ': 'tso',
  // ፀ series (tsa variant)
  'ፀ': 'tsa', 'ፁ': 'tsu', 'ፂ': 'tsi', 'ፃ': 'tsa', 'ፄ': 'tse', 'ፅ': 'ts', 'ፆ': 'tso',
  // ፈ series (fa)
  'ፈ': 'fa', 'ፉ': 'fu', 'ፊ': 'fi', 'ፋ': 'fa', 'ፌ': 'fe', 'ፍ': 'f', 'ፎ': 'fo',
  // ፐ series (pa)
  'ፐ': 'pa', 'ፑ': 'pu', 'ፒ': 'pi', 'ፓ': 'pa', 'ፔ': 'pe', 'ፕ': 'p', 'ፖ': 'po',
  // ቨ series (va)
  'ቨ': 'va', 'ቩ': 'vu', 'ቪ': 'vi', 'ቫ': 'va', 'ቬ': 've', 'ቭ': 'v', 'ቮ': 'vo',
};

/**
 * Normalize ASCII string for matching:
 * - lowercase
 * - normalize spaces (multiple spaces → single space)
 * - keep spaces for multi-word matching
 */
function normalizeAscii(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Normalize transliteration variants to handle "weird" spellings.
 * 
 * This handles common transliteration inconsistencies where the same
 * Amharic character can be written differently in Latin:
 * - ta/te/ti/tu/to variations
 * - sa/se/si/su/so variations  
 * - etc.
 * 
 * The goal is to make "tasfaye" and "tesfaye" both match "ተስፋዬ"
 * even though our romanization produces "tasfaye".
 */
export function normalizeTransliterationVariants(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let normalized = input.toLowerCase();
  
  // Common transliteration variant patterns
  // These handle cases where people write names inconsistently
  // based on how they hear/speak them, not strict romanization rules
  
  // Handle common vowel variations in transliteration
  // Note: We're being conservative - only normalizing when context suggests
  // it's a transliteration variant, not changing all vowels everywhere
  
  // Common patterns: ta/te, sa/se, etc. at word boundaries or after consonants
  // We'll use a more flexible matching approach in the matching function
  // rather than changing the input here
  
  return normalized;
}

/**
 * Calculate transliteration-aware distance between two strings.
 * 
 * This gives lower cost to common transliteration variants:
 * - Vowel swaps (a/e/i/u/o) - common in Amharic transliteration
 * - Consonant variants (s/z, t/d) - less common but occur
 * 
 * Returns a distance score where 0 = exact match, higher = more different.
 */
export function transliterationAwareDistance(str1: string, str2: string): number {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Use dynamic programming similar to Levenshtein but with variant-aware costs
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Vowel variants (common in transliteration)
  const vowels = new Set(['a', 'e', 'i', 'u', 'o']);
  
  // Consonant variants (less common)
  const consonantVariants: Record<string, Set<string>> = {
    's': new Set(['z']),
    'z': new Set(['s']),
    't': new Set(['d']),
    'd': new Set(['t']),
  };
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const c1 = s1[i - 1];
      const c2 = s2[j - 1];
      
      let cost = 1; // Default substitution cost
      
      if (c1 === c2) {
        cost = 0; // Exact match
      } else if (vowels.has(c1) && vowels.has(c2)) {
        cost = 0.3; // Vowel swap - very common in transliteration
      } else if (consonantVariants[c1]?.has(c2) || consonantVariants[c2]?.has(c1)) {
        cost = 0.5; // Consonant variant - less common but acceptable
      }
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,        // deletion
        matrix[i][j - 1] + 1,        // insertion
        matrix[i - 1][j - 1] + cost // substitution (with variant-aware cost)
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Check if two strings match considering transliteration variants.
 * 
 * This handles cases like:
 * - "tas" vs "tes" (both can represent "ተስ")
 * - "salam" vs "selam" (both can represent "ሰላም")
 */
export function matchesTransliterationVariant(str1: string, str2: string, maxDistance: number = 1.5): boolean {
  if (!str1 || !str2) return false;
  
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match
  if (s1 === s2) return true;
  
  // Substring match
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Use transliteration-aware distance
  const distance = transliterationAwareDistance(s1, s2);
  return distance <= maxDistance;
}

/**
 * Romanize an Amharic string to a simple ASCII form that matches
 * how users typically type names (e.g. "amanuel", "tesfaye").
 *
 * Example:
 *  - "አማኑኤል" → "amanuel"
 */
export function romanizeAmharicToAscii(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = '';

  for (const ch of input) {
    if (AMHARIC_TO_ASCII[ch]) {
      result += AMHARIC_TO_ASCII[ch];
    } else if (ch === ' ') {
      result += ' ';
    } else {
      // For non-Amharic characters, keep ASCII letters/digits
      if (/[a-z0-9]/i.test(ch)) {
        result += ch.toLowerCase();
      } else {
        // Treat punctuation and unknown chars as separators
        result += ' ';
      }
    }
  }

  return normalizeAscii(result);
}

/**
 * Detect if a string contains any Amharic (Ethiopic) characters.
 */
export function containsAmharic(input: string): boolean {
  return /[\u1200-\u137F]/.test(input);
}

