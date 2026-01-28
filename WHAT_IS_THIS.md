# What is `amharic-name-search`?

## Quick Answer

**`amharic-name-search` is a transliteration library, NOT a search engine.**

It provides the logic to match names between English and Amharic scripts. You use it WITH search engines or databases.

---

## What It Does

### ✅ What `amharic-name-search` DOES:

1. **Transliterates** English names → Amharic
   ```typescript
   transliterateToAmharic('amanuel') // → ['አማኑኤል']
   ```

2. **Matches** names across scripts
   ```typescript
   matchesName('አማኑኤል', 'amanuel') // → true
   ```

3. **Expands** search queries
   ```typescript
   expandSearchQuery('amanuel') // → ['amanuel', 'አማኑኤል']
   ```

### ❌ What `amharic-name-search` DOES NOT do:

- ❌ Search databases
- ❌ Index documents
- ❌ Provide relevance scoring
- ❌ Handle millions of documents efficiently
- ❌ Replace Elasticsearch, MongoDB, or PostgreSQL

---

## How It Works

### Standalone (Small Datasets)

```typescript
import { matchesName } from 'amharic-name-search';

// Works great for arrays in memory
const clients = [/* 100-1000 items */];
const filtered = clients.filter(c => 
  matchesName(c.name, 'amanuel')
);
```

**Use when:** Small datasets, client-side filtering, simple validation

---

### With Databases (Medium Datasets)

```typescript
import { expandSearchQuery } from 'amharic-name-search';

// MongoDB
const terms = expandSearchQuery('amanuel');
db.clients.find({
  $or: terms.map(t => ({ name: { $regex: t } }))
});

// PostgreSQL
const terms = expandSearchQuery('amanuel');
db.query(`SELECT * FROM clients WHERE name ILIKE ANY($1)`, [terms]);
```

**Use when:** Medium datasets, need database queries

---

### With Elasticsearch (Large Datasets)

```typescript
import { expandSearchQuery } from 'amharic-name-search';
import { Client } from '@elastic/elasticsearch';

// Elasticsearch provides the search engine
// amharic-name-search provides the transliteration
const terms = expandSearchQuery('amanuel');
await client.search({
  query: {
    bool: {
      should: terms.map(t => ({ match: { name: t } }))
    }
  }
});
```

**Use when:** Large datasets, need relevance scoring, need fast search

---

## The Relationship

```
┌─────────────────────────┐
│  amharic-name-search    │
│  (Transliteration)      │
│                         │
│  • Converts scripts     │
│  • Matches names        │
│  • Expands queries      │
└───────────┬─────────────┘
            │
            │ provides transliteration logic
            │
            ▼
┌─────────────────────────┐
│   Your Search System    │
│                         │
│  Options:               │
│  • Array.filter()       │
│  • MongoDB              │
│  • PostgreSQL           │
│  • Elasticsearch        │
│  • Any database         │
└─────────────────────────┘
```

---

## Real-World Example

### Scenario: User searches for "Amanuel"

**Step 1:** `amharic-name-search` expands the query
```typescript
expandSearchQuery('amanuel')
// → ['amanuel', 'አማኑኤል']
```

**Step 2:** Your search system searches for both terms
```typescript
// If using MongoDB:
db.clients.find({ name: { $in: ['amanuel', 'አማኑኤል'] } })

// If using Elasticsearch:
client.search({ query: { match: { name: 'amanuel' } } })
client.search({ query: { match: { name: 'አማኑኤል' } } })
```

**Step 3:** Results include both scripts
```json
[
  { "name": "Amanuel", "phone": "911346136" },
  { "name": "አማኑኤል", "phone": "911346136" }
]
```

---

## Think of It Like This

| Component | Role | Analogy |
|-----------|------|---------|
| **amharic-name-search** | Transliteration logic | Translator |
| **Elasticsearch/MongoDB/etc** | Search engine/database | Library |
| **Together** | Bilingual search | Translator helping librarian |

---

## What You Get

### With `amharic-name-search`:

✅ Transliteration between English ↔ Amharic  
✅ Name matching logic  
✅ Query expansion  
✅ TypeScript support  
✅ Zero dependencies  
✅ Works anywhere (browser, Node.js)

### You Still Need:

⚠️ A way to store your data (database)  
⚠️ A way to search your data (search engine or database queries)  
⚠️ A way to serve your application (API, server)

---

## Summary

**`amharic-name-search` = Transliteration Tool**

- It's a library, not a search engine
- It provides the logic for matching names across scripts
- You use it WITH your existing search/database system
- Works great with Elasticsearch, MongoDB, PostgreSQL, or simple arrays

**Think of it as:** The "translator" that helps your search system understand both English and Amharic names.

---

## Next Steps

- 📖 [Quick Start](./QUICK_START.md) - Get started in 3 steps
- 📚 [Usage Guide](./USAGE_GUIDE.md) - See examples with different databases
- 🔍 [Elasticsearch Guide](./ELASTICSEARCH_GUIDE.md) - If using Elasticsearch
- 📖 [How to Use](./HOW_TO_USE.md) - Simple examples
