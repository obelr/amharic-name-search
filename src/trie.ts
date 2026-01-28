/**
 * Trie data structure for efficient name lookups
 */

interface TrieNode {
  children: Map<string, TrieNode>;
  amharicVariants: Set<string>;
  isEnd: boolean;
}

/**
 * Trie for fast name lookups
 */
export class NameTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      amharicVariants: new Set(),
      isEnd: false,
    };
  }

  /**
   * Insert English name and its Amharic variant
   */
  insert(english: string, amharic: string): void {
    const normalized = english.toLowerCase();
    let node = this.root;

    for (const char of normalized) {
      if (!node.children.has(char)) {
        node.children.set(char, {
          children: new Map(),
          amharicVariants: new Set(),
          isEnd: false,
        });
      }
      node = node.children.get(char)!;
    }

    node.isEnd = true;
    node.amharicVariants.add(amharic);
  }

  /**
   * Search for exact match
   */
  searchExact(query: string): string[] {
    const normalized = query.toLowerCase();
    let node = this.root;

    for (const char of normalized) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    return node.isEnd ? Array.from(node.amharicVariants) : [];
  }

  /**
   * Search for partial matches (prefix search)
   */
  searchPrefix(prefix: string): string[] {
    const normalized = prefix.toLowerCase();
    let node = this.root;

    // Navigate to prefix node
    for (const char of normalized) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    // Collect all variants from this node and children
    const results = new Set<string>();
    this.collectVariants(node, results);
    return Array.from(results);
  }

  /**
   * Search for names containing the query (substring search)
   */
  searchContains(query: string): string[] {
    const normalized = query.toLowerCase();
    const results = new Set<string>();

    // Try starting from each position
    for (let i = 0; i < normalized.length; i++) {
      const substring = normalized.substring(i);
      const prefixResults = this.searchPrefix(substring);
      prefixResults.forEach(variant => results.add(variant));
    }

    return Array.from(results);
  }

  /**
   * Collect all variants from a node and its children
   */
  private collectVariants(node: TrieNode, results: Set<string>): void {
    // Add variants from current node
    node.amharicVariants.forEach(variant => results.add(variant));

    // Recursively collect from children
    for (const child of node.children.values()) {
      this.collectVariants(child, results);
    }
  }

  /**
   * Build trie from name mappings
   */
  static fromMappings(mappings: Record<string, string>): NameTrie {
    const trie = new NameTrie();
    for (const [english, amharic] of Object.entries(mappings)) {
      trie.insert(english, amharic);
    }
    return trie;
  }
}
