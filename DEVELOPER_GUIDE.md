# Developer Guide: How to Use `amharic-name-search`

This guide shows developers how to integrate and use the `amharic-name-search` package in their projects.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Common Patterns](#common-patterns)
4. [Framework Examples](#framework-examples)
5. [Database Integration](#database-integration)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)

---

## Installation

### npm

```bash
npm install amharic-name-search
```

### yarn

```bash
yarn add amharic-name-search
```

### pnpm

```bash
pnpm add amharic-name-search
```

---

## Basic Usage

### Import the Functions

**ES Modules (Recommended):**
```typescript
import { matchesName, transliterateToAmharic, expandSearchQuery } from 'amharic-name-search';
```

**CommonJS:**
```javascript
const { matchesName, transliterateToAmharic, expandSearchQuery } = require('amharic-name-search');
```

### The Three Main Functions

#### 1. `matchesName(name, query)` - Most Common Use Case

Check if a name matches a search query (works both ways):

```typescript
import { matchesName } from 'amharic-name-search';

// English query → Amharic name
matchesName('አማኑኤል', 'amanuel'); // true

// Amharic query → English name  
matchesName('Amanuel', 'አማኑኤል'); // true

// Works with full names too
matchesName('አማኑኤል ፀጋዬ', 'amanuel'); // true
matchesName('Amanuel Tsegaye', 'አማኑኤል'); // true
```

#### 2. `transliterateToAmharic(englishText)` - Get Amharic Variants

Convert English text to Amharic equivalents:

```typescript
import { transliterateToAmharic } from 'amharic-name-search';

transliterateToAmharic('amanuel');
// Returns: ['አማኑኤል']

transliterateToAmharic('tadesse');
// Returns: ['ታደሰ']
```

#### 3. `expandSearchQuery(query)` - For Database Queries

Get all search terms including transliterated variants:

```typescript
import { expandSearchQuery } from 'amharic-name-search';

expandSearchQuery('amanuel');
// Returns: ['amanuel', 'አማኑኤል']
```

---

## Common Patterns

### Pattern 1: Filter an Array

```typescript
const filtered = items.filter(item =>
  matchesName(item.name, searchQuery)
);
```

### Pattern 2: Find Exact Match

```typescript
const found = items.find(item =>
  matchesName(item.name, searchQuery)
);
```

### Pattern 3: Check if Exists

```typescript
const exists = items.some(item =>
  matchesName(item.name, searchQuery)
);
```

### Pattern 4: Validate Duplicate Names

```typescript
const isDuplicate = existingNames.some(name =>
  matchesName(name, newName)
);
```

---

## Framework Examples

### React Component

```typescript
import { useState } from 'react';
import { matchesName } from 'amharic-name-search';

function ClientSearch({ clients }) {
  const [query, setQuery] = useState('');
  
  const filteredClients = clients.filter(client =>
    matchesName(client.name, query)
  );
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search clients..."
      />
      <ul>
        {filteredClients.map(client => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Vue.js Component

```vue
<template>
  <div>
    <input v-model="query" placeholder="Search..." />
    <ul>
      <li v-for="client in filteredClients" :key="client.id">
        {{ client.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { matchesName } from 'amharic-name-search';

const props = defineProps<{ clients: Client[] }>();
const query = ref('');

const filteredClients = computed(() =>
  props.clients.filter(client => matchesName(client.name, query.value))
);
</script>
```

### Next.js API Route

**Pages Router:**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { matchesName } from 'amharic-name-search';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;
  const clients = await fetchClients();
  
  const filtered = clients.filter(client =>
    matchesName(client.name, q as string)
  );
  
  res.json(filtered);
}
```

**App Router:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { matchesName } from 'amharic-name-search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  const clients = await fetchClients();
  const filtered = clients.filter(client =>
    matchesName(client.name, query || '')
  );
  
  return NextResponse.json(filtered);
}
```

---

## Database Integration

### MongoDB

```typescript
import { MongoClient } from 'mongodb';
import { expandSearchQuery } from 'amharic-name-search';

async function searchClients(query: string) {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  
  const db = client.db('your-db');
  const collection = db.collection('clients');
  
  const searchTerms = expandSearchQuery(query);
  
  const results = await collection.find({
    $or: searchTerms.map(term => ({
      name: { $regex: term, $options: 'i' }
    }))
  }).toArray();
  
  await client.close();
  return results;
}
```

### PostgreSQL

```typescript
import { Pool } from 'pg';
import { expandSearchQuery } from 'amharic-name-search';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  const conditions = searchTerms
    .map((term, index) => `name ILIKE $${index + 1}`)
    .join(' OR ');
  
  const placeholders = searchTerms.map(term => `%${term}%`);
  
  const result = await pool.query(
    `SELECT * FROM clients WHERE ${conditions}`,
    placeholders
  );
  
  return result.rows;
}
```

### Prisma

```typescript
import { PrismaClient } from '@prisma/client';
import { expandSearchQuery } from 'amharic-name-search';

const prisma = new PrismaClient();

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  return prisma.client.findMany({
    where: {
      OR: searchTerms.map(term => ({
        name: { contains: term, mode: 'insensitive' }
      }))
    }
  });
}
```

### Elasticsearch

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
        bool: {
          should: searchTerms.map(term => ({
            match: {
              name: {
                query: term,
                boost: term === query ? 2.0 : 1.0
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

> 📖 **For advanced Elasticsearch features** (analyzers, synonyms, performance optimization), see the [Elasticsearch Guide](./ELASTICSEARCH_GUIDE.md).

---

## API Reference

### `matchesName(name, query, options?)`

Checks if a name matches a search query.

**Parameters:**
- `name` (string): The name to check
- `query` (string): The search query
- `options` (optional): MatchOptions
  - `caseSensitive` (boolean, default: false)
  - `wholeWord` (boolean, default: false)

**Returns:** `boolean`

**Example:**
```typescript
matchesName('አማኑኤል', 'amanuel'); // true
matchesName('Amanuel', 'አማኑኤል'); // true
```

### `transliterateToAmharic(englishText, options?)`

Converts English text to Amharic variants.

**Parameters:**
- `englishText` (string): English text to transliterate
- `options` (optional): TransliterationOptions
  - `includePartialMatches` (boolean, default: true)

**Returns:** `string[]`

**Example:**
```typescript
transliterateToAmharic('amanuel'); // ['አማኑኤል']
```

### `expandSearchQuery(query)`

Expands a search query to include transliterated variants.

**Parameters:**
- `query` (string): Search query to expand

**Returns:** `string[]`

**Example:**
```typescript
expandSearchQuery('amanuel'); // ['amanuel', 'አማኑኤል']
```

---

## Best Practices

### 1. Use `matchesName()` for Client-Side Filtering

```typescript
// ✅ Good - Simple and fast
const filtered = clients.filter(client =>
  matchesName(client.name, query)
);

// ❌ Avoid - Unnecessary complexity
const terms = expandSearchQuery(query);
const filtered = clients.filter(client =>
  terms.some(term => client.name.includes(term))
);
```

### 2. Use `expandSearchQuery()` for Database Queries

```typescript
// ✅ Good - Let database handle the search
const terms = expandSearchQuery(query);
db.clients.find({ name: { $in: terms } });

// ❌ Avoid - Loading all data to filter
const allClients = await db.clients.find({}).toArray();
const filtered = allClients.filter(c => matchesName(c.name, query));
```

### 3. Debounce Search Input

```typescript
import { useState, useEffect } from 'react';
import { matchesName } from 'amharic-name-search';

function SearchComponent({ items }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const filtered = items.filter(item =>
    matchesName(item.name, debouncedQuery)
  );
  
  // ...
}
```

### 4. Handle Empty Queries

```typescript
const filtered = query.trim()
  ? items.filter(item => matchesName(item.name, query))
  : items;
```

### 5. TypeScript Types

The package includes full TypeScript definitions:

```typescript
import type { MatchOptions, TransliterationOptions } from 'amharic-name-search';

const options: MatchOptions = {
  caseSensitive: false,
  wholeWord: true
};
```

---

## Troubleshooting

### Names Not Matching?

1. Check if the name is in the mappings: See `src/name-mappings.ts`
2. Verify the spelling matches common transliteration patterns
3. Try using `transliterateToAmharic()` to see what variants are generated

### Performance Issues?

1. For large datasets, use `expandSearchQuery()` with database queries
2. Add debouncing to search inputs
3. Consider caching transliteration results for common names

### TypeScript Errors?

The package includes type definitions. Make sure you're using TypeScript 4.0+ and have proper module resolution configured.

---

## Need More Help?

- 📖 [Quick Start Guide](./QUICK_START.md) - Get started in 3 steps
- 📚 [Full Usage Guide](./USAGE_GUIDE.md) - 10+ detailed examples
- 🧪 [Tests](./tests/transliteration.test.ts) - See test cases
- 🐛 [Report Issues](https://github.com/your-org/amharic-name-search/issues)

---

## Contributing

Found a name that's missing? Want to improve the transliteration? Contributions are welcome!

1. Fork the repository
2. Add your changes
3. Submit a pull request

See `src/name-mappings.ts` to add new name mappings.
