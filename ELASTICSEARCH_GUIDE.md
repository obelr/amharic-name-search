# Elasticsearch Integration Guide

This guide shows how to integrate `amharic-name-search` with Elasticsearch for powerful bilingual search capabilities.

## Table of Contents

1. [Why Elasticsearch?](#why-elasticsearch)
2. [Basic Integration](#basic-integration)
3. [Query Strategies](#query-strategies)
4. [Index Configuration](#index-configuration)
5. [Advanced Techniques](#advanced-techniques)
6. [Performance Optimization](#performance-optimization)

---

## Why Elasticsearch?

Elasticsearch provides:
- **Full-text search** with relevance scoring
- **Fuzzy matching** for typos
- **Multi-language support** with analyzers
- **Scalability** for large datasets
- **Advanced queries** (bool, should, must, etc.)

Combined with `amharic-name-search`, you get:
- ✅ Bilingual search (English ↔ Amharic)
- ✅ Relevance scoring
- ✅ Typo tolerance
- ✅ Fast performance on large datasets

---

## Basic Integration

### Method 1: Query Expansion (Recommended)

Use `expandSearchQuery()` to generate search terms, then query Elasticsearch:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery } from 'amharic-name-search';

const client = new Client({ node: 'http://localhost:9200' });

async function searchClients(query: string) {
  // Expand query to include Amharic variants
  const searchTerms = expandSearchQuery(query);
  // ['amanuel', 'አማኑኤል']
  
  // Build Elasticsearch query
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        bool: {
          should: searchTerms.map(term => ({
            match: {
              name: {
                query: term,
                boost: term === query ? 2.0 : 1.0 // Boost exact match
              }
            }
          }))
        }
      }
    }
  });
  
  return result.body.hits.hits.map(hit => hit._source);
}
```

**Advantages:**
- Simple to implement
- Works with existing indices
- Full control over query structure
- Easy to debug

---

### Method 2: Multi-Match Query

Use Elasticsearch's `multi_match` with expanded terms:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery } from 'amharic-name-search';

const client = new Client({ node: 'http://localhost:9200' });

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        multi_match: {
          query: searchTerms.join(' '),
          fields: ['name^2', 'name.amharic'], // Boost name field
          type: 'best_fields',
          operator: 'or'
        }
      }
    }
  });
  
  return result.body.hits.hits.map(hit => hit._source);
}
```

---

## Query Strategies

### Strategy 1: Should Clause (Best Relevance)

Boost exact matches while still finding transliterated variants:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery, transliterateToAmharic } from 'amharic-name-search';

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  const amharicVariants = transliterateToAmharic(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        bool: {
          should: [
            // Exact match (highest boost)
            {
              match: {
                name: {
                  query: query,
                  boost: 3.0
                }
              }
            },
            // Amharic variants (high boost)
            ...amharicVariants.map(variant => ({
              match: {
                name: {
                  query: variant,
                  boost: 2.5
                }
              }
            })),
            // Other expanded terms
            ...searchTerms
              .filter(term => term !== query && !amharicVariants.includes(term))
              .map(term => ({
                match: {
                  name: {
                    query: term,
                    boost: 1.0
                  }
                }
              }))
          ],
          minimum_should_match: 1
        }
      }
    }
  });
  
  return result.body.hits.hits;
}
```

---

### Strategy 2: Fuzzy Matching

Add typo tolerance while maintaining transliteration:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery } from 'amharic-name-search';

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        bool: {
          should: searchTerms.map(term => ({
            match: {
              name: {
                query: term,
                fuzziness: 'AUTO', // Auto-detect fuzziness
                prefix_length: 2
              }
            }
          }))
        }
      }
    }
  });
  
  return result.body.hits.hits;
}
```

---

### Strategy 3: Phrase Matching

For exact phrase searches:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery } from 'amharic-name-search';

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        bool: {
          should: [
            // Phrase match (exact)
            ...searchTerms.map(term => ({
              match_phrase: {
                name: {
                  query: term,
                  boost: 2.0
                }
              }
            })),
            // Regular match (partial)
            ...searchTerms.map(term => ({
              match: {
                name: {
                  query: term,
                  boost: 1.0
                }
              }
            }))
          ]
        }
      }
    }
  });
  
  return result.body.hits.hits;
}
```

---

## Index Configuration

### Basic Index Setup

Create an index with appropriate analyzers:

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

async function createClientsIndex() {
  await client.indices.create({
    index: 'clients',
    body: {
      mappings: {
        properties: {
          name: {
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: {
                type: 'keyword'
              },
              amharic: {
                type: 'text',
                analyzer: 'standard'
              }
            }
          },
          phone: {
            type: 'keyword'
          },
          email: {
            type: 'keyword'
          }
        }
      }
    }
  });
}
```

---

### Custom Analyzer for Amharic

Create a custom analyzer optimized for Amharic text:

```typescript
async function createAmharicIndex() {
  await client.indices.create({
    index: 'clients',
    body: {
      settings: {
        analysis: {
          analyzer: {
            amharic_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'amharic_stop',
                'amharic_stemmer'
              ]
            }
          },
          filter: {
            amharic_stop: {
              type: 'stop',
              stopwords: ['እና', 'ወይም', 'ነገር'] // Common Amharic stopwords
            },
            amharic_stemmer: {
              type: 'stemmer',
              language: 'amharic'
            }
          }
        }
      },
      mappings: {
        properties: {
          name: {
            type: 'text',
            analyzer: 'amharic_analyzer',
            fields: {
              keyword: {
                type: 'keyword'
              },
              english: {
                type: 'text',
                analyzer: 'standard'
              }
            }
          }
        }
      }
    }
  });
}
```

---

## Advanced Techniques

### Technique 1: Synonym Mapping

Use Elasticsearch synonyms with transliteration:

```typescript
async function createIndexWithSynonyms() {
  await client.indices.create({
    index: 'clients',
    body: {
      settings: {
        analysis: {
          analyzer: {
            amharic_synonym: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'amharic_synonyms']
            }
          },
          filter: {
            amharic_synonyms: {
              type: 'synonym',
              synonyms: [
                'amanuel,አማኑኤል',
                'tadesse,ታደሰ',
                'tesfaye,ተስፋዬ'
                // Add more from COMMON_NAMES
              ]
            }
          }
        }
      },
      mappings: {
        properties: {
          name: {
            type: 'text',
            analyzer: 'amharic_synonym'
          }
        }
      }
    }
  });
}
```

**Note:** You can generate synonyms dynamically from `COMMON_NAMES`:

```typescript
import { COMMON_NAMES } from 'amharic-name-search';

const synonyms = Object.entries(COMMON_NAMES)
  .map(([english, amharic]) => `${english},${amharic}`)
  .join('\n');
```

---

### Technique 2: Function Score Query

Boost results based on transliteration match:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery, matchesName } from 'amharic-name-search';

async function searchWithFunctionScore(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
      query: {
        function_score: {
          query: {
            bool: {
              should: searchTerms.map(term => ({
                match: {
                  name: term
                }
              }))
            }
          },
          functions: [
            {
              filter: {
                match: {
                  name: query // Exact match
                }
              },
              weight: 3.0
            },
            {
              filter: {
                match: {
                  name: {
                    query: searchTerms.find(t => t !== query) || '',
                    operator: 'and'
                  }
                }
              },
              weight: 2.0
            }
          ],
          score_mode: 'sum',
          boost_mode: 'multiply'
        }
      }
    }
  });
  
  return result.body.hits.hits;
}
```

---

### Technique 3: Post-Filter with Transliteration

Filter results after Elasticsearch search:

```typescript
import { Client } from '@elastic/elasticsearch';
import { matchesName } from 'amharic-name-search';

async function searchAndFilter(query: string) {
  // First, get broad results from Elasticsearch
  const esResult = await client.search({
    index: 'clients',
    body: {
      query: {
        match: {
          name: query
        }
      },
      size: 100 // Get more results
    }
  });
  
  // Then filter using transliteration
  const filtered = esResult.body.hits.hits
    .map(hit => hit._source)
    .filter(client => matchesName(client.name, query));
  
  return filtered;
}
```

---

## Performance Optimization

### 1. Use Filters Instead of Queries

For exact matches, use filters (faster, no scoring):

```typescript
const result = await client.search({
  index: 'clients',
  body: {
    query: {
      bool: {
        filter: searchTerms.map(term => ({
          term: {
            'name.keyword': term
          }
        }))
      }
    }
  }
});
```

---

### 2. Cache Common Queries

Cache expanded search terms for frequently searched names:

```typescript
import { LRUCache } from 'lru-cache';
import { expandSearchQuery } from 'amharic-name-search';

const queryCache = new LRUCache<string, string[]>({
  max: 500,
  ttl: 1000 * 60 * 60 // 1 hour
});

function getSearchTerms(query: string): string[] {
  const cached = queryCache.get(query);
  if (cached) return cached;
  
  const terms = expandSearchQuery(query);
  queryCache.set(query, terms);
  return terms;
}
```

---

### 3. Index Both Scripts

Store both English and Amharic versions in the index:

```typescript
interface Client {
  id: string;
  name: string; // Original name
  nameEnglish?: string; // English transliteration
  nameAmharic?: string; // Amharic transliteration
  nameSearchable: string; // Combined for search
}

// When indexing
import { transliterateToAmharic } from 'amharic-name-search';

async function indexClient(client: Client) {
  const amharicVariants = transliterateToAmharic(client.name.toLowerCase());
  
  await client.index({
    index: 'clients',
    id: client.id,
    body: {
      ...client,
      nameEnglish: client.name,
      nameAmharic: amharicVariants[0] || client.name,
      nameSearchable: [client.name, ...amharicVariants].join(' ')
    }
  });
}
```

Then search on `nameSearchable`:

```typescript
const result = await client.search({
  index: 'clients',
  body: {
    query: {
      match: {
        nameSearchable: query
      }
    }
  }
});
```

---

## Complete Example

Here's a complete, production-ready example:

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery, transliterateToAmharic } from 'amharic-name-search';

class AmharicElasticsearchSearch {
  private client: Client;
  
  constructor(elasticsearchUrl: string) {
    this.client = new Client({ node: elasticsearchUrl });
  }
  
  async searchClients(query: string, limit: number = 20) {
    if (!query.trim()) {
      return [];
    }
    
    const searchTerms = expandSearchQuery(query);
    const amharicVariants = transliterateToAmharic(query);
    
    const result = await this.client.search({
      index: 'clients',
      body: {
        size: limit,
        query: {
          bool: {
            should: [
              // Exact match - highest boost
              {
                match: {
                  name: {
                    query: query,
                    boost: 3.0
                  }
                }
              },
              // Amharic variants - high boost
              ...amharicVariants.map(variant => ({
                match: {
                  name: {
                    query: variant,
                    boost: 2.5
                  }
                }
              })),
              // Other terms - standard boost
              ...searchTerms
                .filter(term => term !== query && !amharicVariants.includes(term))
                .map(term => ({
                  match: {
                    name: {
                      query: term,
                      boost: 1.0,
                      fuzziness: 'AUTO'
                    }
                  }
                }))
            ],
            minimum_should_match: 1
          }
        },
        highlight: {
          fields: {
            name: {}
          }
        }
      }
    });
    
    return result.body.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score,
      highlights: hit.highlight
    }));
  }
  
  async indexClient(client: { id: string; name: string; [key: string]: any }) {
    const amharicVariants = transliterateToAmharic(client.name.toLowerCase());
    
    await this.client.index({
      index: 'clients',
      id: client.id,
      body: {
        ...client,
        nameSearchable: [client.name, ...amharicVariants].join(' ')
      }
    });
  }
}

// Usage
const search = new AmharicElasticsearchSearch('http://localhost:9200');

// Search
const results = await search.searchClients('amanuel');

// Index
await search.indexClient({
  id: '1',
  name: 'አማኑኤል ፀጋዬ',
  phone: '911346136'
});
```

---

## Comparison: Elasticsearch vs Other Methods

| Method | Best For | Performance | Complexity |
|--------|----------|-------------|------------|
| **Elasticsearch** | Large datasets, relevance scoring | ⭐⭐⭐⭐⭐ | Medium |
| **MongoDB** | Document databases | ⭐⭐⭐⭐ | Low |
| **PostgreSQL** | Relational data | ⭐⭐⭐ | Low |
| **Client-side filtering** | Small datasets (<1000 items) | ⭐⭐ | Very Low |

---

## Best Practices

1. **Use `expandSearchQuery()`** - Generates all search variants
2. **Boost exact matches** - Better relevance scoring
3. **Index both scripts** - Store English and Amharic versions
4. **Use filters for exact matches** - Faster queries
5. **Cache common queries** - Reduce computation
6. **Monitor performance** - Use Elasticsearch monitoring tools

---

## Troubleshooting

### Low Relevance Scores

- Increase boost values for exact matches
- Use function_score queries
- Check analyzer configuration

### Slow Queries

- Use filters instead of queries where possible
- Limit result size
- Add indexes to frequently searched fields
- Consider caching

### Missing Results

- Verify transliteration mappings include the name
- Check analyzer tokenization
- Use fuzzy matching for typos

---

## Next Steps

- 📖 [Usage Guide](./USAGE_GUIDE.md) - More examples
- 📚 [Developer Guide](./DEVELOPER_GUIDE.md) - Complete reference
- 🧪 Test with your Elasticsearch cluster
- 🚀 Deploy to production!

---

## Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch Node.js Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)
- [Amharic Analyzer Plugin](https://github.com/elastic/elasticsearch) (if available)
