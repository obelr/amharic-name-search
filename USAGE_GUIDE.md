# Usage Guide for Developers

This guide shows how developers can use the `amharic-name-search` package in their projects.

## Installation

```bash
npm install amharic-name-search
```

or with yarn:

```bash
yarn add amharic-name-search
```

or with pnpm:

```bash
pnpm add amharic-name-search
```

## Import Methods

### ES Modules (Modern JavaScript/TypeScript)

```typescript
import { transliterateToAmharic, matchesName, expandSearchQuery } from 'amharic-name-search';
```

### CommonJS (Node.js)

```javascript
const { transliterateToAmharic, matchesName, expandSearchQuery } = require('amharic-name-search');
```

### TypeScript

The package includes full TypeScript definitions, so no additional `@types` package is needed:

```typescript
import { 
  transliterateToAmharic, 
  matchesName, 
  expandSearchQuery,
  TransliterationOptions,
  MatchOptions 
} from 'amharic-name-search';
```

---

## Use Cases & Examples

### 1. React Component - Client Search

**Problem:** Users want to search for clients by typing either English or Amharic names.

**Solution:**

```typescript
import React, { useState } from 'react';
import { matchesName } from 'amharic-name-search';

interface Client {
  id: string;
  name: string;
  phone: string;
}

function ClientSearch({ clients }: { clients: Client[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredClients = clients.filter(client =>
    matchesName(client.name, searchQuery)
  );
  
  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name (English or Amharic)..."
        className="search-input"
      />
      
      <ul className="client-list">
        {filteredClients.map(client => (
          <li key={client.id}>
            <div>{client.name}</div>
            <div className="phone">{client.phone}</div>
          </li>
        ))}
      </ul>
      
      {filteredClients.length === 0 && searchQuery && (
        <p>No clients found matching "{searchQuery}"</p>
      )}
    </div>
  );
}

export default ClientSearch;
```

**How it works:**
- User types "Amanuel" → finds clients named "አማኑኤል"
- User types "አማኑኤል" → finds clients named "Amanuel"
- Works in both directions seamlessly

---

### 2. Next.js API Route - Server-Side Search

**Problem:** Need to search clients on the server side.

**Solution:**

```typescript
// pages/api/clients/search.ts (Next.js Pages Router)
// or app/api/clients/search/route.ts (Next.js App Router)

import { NextApiRequest, NextApiResponse } from 'next';
import { matchesName } from 'amharic-name-search';

// Example with Pages Router
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  // Fetch all clients from database
  const allClients = await fetchClientsFromDatabase();
  
  // Filter using transliteration
  const filteredClients = allClients.filter(client =>
    matchesName(client.name, query)
  );
  
  res.status(200).json({
    results: filteredClients,
    count: filteredClients.length
  });
}
```

**App Router Example:**

```typescript
// app/api/clients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { matchesName } from 'amharic-name-search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter required' },
      { status: 400 }
    );
  }

  const allClients = await fetchClientsFromDatabase();
  const filteredClients = allClients.filter(client =>
    matchesName(client.name, query)
  );
  
  return NextResponse.json({
    results: filteredClients,
    count: filteredClients.length
  });
}
```

---

### 3. Database Query - MongoDB

**Problem:** Need to search MongoDB with transliteration support.

**Solution:**

```typescript
import { MongoClient } from 'mongodb';
import { expandSearchQuery } from 'amharic-name-search';

async function searchClients(query: string) {
  const client = new MongoClient(process.env.MONGODB_URI!);
  
  try {
    await client.connect();
    const db = client.db('your-database');
    const collection = db.collection('clients');
    
    // Expand query to include Amharic variants
    const searchTerms = expandSearchQuery(query);
    
    // Build MongoDB query
    const results = await collection.find({
      $or: searchTerms.map(term => ({
        name: { $regex: term, $options: 'i' } // Case-insensitive
      }))
    }).toArray();
    
    return results;
  } finally {
    await client.close();
  }
}

// Usage
const clients = await searchClients('amanuel');
// Finds documents with name "Amanuel", "አማኑኤል", etc.
```

---

### 4. Database Query - Elasticsearch

**Problem:** Need powerful full-text search with transliteration support and relevance scoring.

**Solution:**

```typescript
import { Client } from '@elastic/elasticsearch';
import { expandSearchQuery, transliterateToAmharic } from 'amharic-name-search';

const client = new Client({ node: 'http://localhost:9200' });

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  const amharicVariants = transliterateToAmharic(query);
  
  const result = await client.search({
    index: 'clients',
    body: {
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
  
  return result.body.hits.hits.map(hit => ({
    ...hit._source,
    score: hit._score
  }));
}

// Usage
const clients = await searchClients('amanuel');
// Returns results with relevance scores, finds "Amanuel", "አማኑኤል", etc.
```

> 📖 **For advanced Elasticsearch integration**, see the [Elasticsearch Guide](./ELASTICSEARCH_GUIDE.md) with index configuration, analyzers, and performance optimization.

---

### 5. Database Query - PostgreSQL/SQL

**Problem:** Need to search SQL database with transliteration.

**Solution:**

```typescript
import { Pool } from 'pg';
import { expandSearchQuery } from 'amharic-name-search';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  // Build SQL query with ILIKE for case-insensitive matching
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

// Usage
const clients = await searchClients('amanuel');
```

---

### 6. Vue.js Component

**Problem:** Need transliteration in a Vue.js application.

**Solution:**

```vue
<template>
  <div>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search clients..."
    />
    
    <ul>
      <li v-for="client in filteredClients" :key="client.id">
        {{ client.name }} - {{ client.phone }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { matchesName } from 'amharic-name-search';

interface Client {
  id: string;
  name: string;
  phone: string;
}

const props = defineProps<{
  clients: Client[];
}>();

const searchQuery = ref('');

const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.clients;
  }
  
  return props.clients.filter(client =>
    matchesName(client.name, searchQuery.value)
  );
});
</script>
```

---

### 7. Form Validation - Check if Name Exists

**Problem:** Validate if a client name already exists, regardless of script.

**Solution:**

```typescript
import { matchesName } from 'amharic-name-search';

async function validateClientName(newName: string): Promise<boolean> {
  const existingClients = await fetchAllClients();
  
  // Check if any existing client matches the new name
  const nameExists = existingClients.some(client =>
    matchesName(client.name, newName)
  );
  
  if (nameExists) {
    throw new Error('A client with this name already exists');
  }
  
  return true;
}

// Usage in form handler
try {
  await validateClientName('Amanuel');
  // Proceed with creating client
} catch (error) {
  // Show error: "A client with this name already exists"
  // (even if existing client is named "አማኑኤል")
}
```

---

### 8. Advanced: Custom Options

**Problem:** Need case-sensitive or whole-word matching.

**Solution:**

```typescript
import { matchesName, MatchOptions } from 'amharic-name-search';

// Case-sensitive matching
const options: MatchOptions = {
  caseSensitive: true,
  wholeWord: false
};

matchesName('Amanuel', 'amanuel', options); // false (case-sensitive)
matchesName('Amanuel', 'Amanuel', options); // true

// Whole word matching
const wholeWordOptions: MatchOptions = {
  caseSensitive: false,
  wholeWord: true
};

matchesName('Amanuel Tsegaye', 'Amanuel', wholeWordOptions); // true
matchesName('AmanuelTsegaye', 'Amanuel', wholeWordOptions); // false (not whole word)
```

---

### 9. Advanced: Transliteration with Options

**Problem:** Need to control partial matching behavior.

**Solution:**

```typescript
import { transliterateToAmharic, TransliterationOptions } from 'amharic-name-search';

// With partial matches (default)
const withPartial: TransliterationOptions = {
  includePartialMatches: true
};

transliterateToAmharic('aman', withPartial);
// Returns: ['አማኑኤል'] (matches "amanuel")

// Without partial matches
const withoutPartial: TransliterationOptions = {
  includePartialMatches: false
};

transliterateToAmharic('aman', withoutPartial);
// Returns: [] (no exact match for "aman")
```

---

### 10. Autocomplete/Suggestions Component

**Problem:** Build an autocomplete that suggests names in both scripts.

**Solution:**

```typescript
import { useState, useMemo } from 'react';
import { transliterateToAmharic, matchesName } from 'amharic-name-search';

function NameAutocomplete({ allNames }: { allNames: string[] }) {
  const [input, setInput] = useState('');
  
  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    
    // Get transliterated variants
    const amharicVariants = transliterateToAmharic(input);
    
    // Find matching names
    const matches = allNames.filter(name =>
      matchesName(name, input)
    );
    
    // Also include transliterated variants as suggestions
    const variantSuggestions = amharicVariants.filter(variant =>
      !matches.includes(variant) && allNames.includes(variant)
    );
    
    return [...matches, ...variantSuggestions].slice(0, 10);
  }, [input, allNames]);
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a name..."
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => setInput(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 11. Bulk Name Processing

**Problem:** Process a list of names and normalize them.

**Solution:**

```typescript
import { transliterateToAmharic } from 'amharic-name-search';

function normalizeNames(names: string[]): Map<string, string[]> {
  const normalized = new Map<string, string[]>();
  
  names.forEach(name => {
    const lowerName = name.toLowerCase().trim();
    
    // Get Amharic variants
    const amharicVariants = transliterateToAmharic(lowerName);
    
    // Store all variants together
    const allVariants = [name, ...amharicVariants];
    normalized.set(lowerName, allVariants);
  });
  
  return normalized;
}

// Usage
const names = ['Amanuel', 'Tadesse', 'አማኑኤል'];
const normalized = normalizeNames(names);
// Map contains:
// 'amanuel' -> ['Amanuel', 'አማኑኤል']
// 'tadesse' -> ['Tadesse', 'ታደሰ']
// 'አማኑኤል' -> ['አማኑኤል', 'አማኑኤል']
```

---

## Common Patterns

### Pattern 1: Filter Array

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

### Pattern 3: Check Existence

```typescript
const exists = items.some(item =>
  matchesName(item.name, searchQuery)
);
```

### Pattern 4: Database Search Terms

```typescript
const searchTerms = expandSearchQuery(query);
// Use searchTerms in your database query
```

---

## Performance Tips

1. **For large datasets:** Use `expandSearchQuery()` and build database indexes on the name field
2. **For real-time search:** Debounce the search input to avoid excessive filtering
3. **For server-side:** Consider caching transliteration results for common names

---

## TypeScript Support

The package is fully typed. You'll get:
- Autocomplete in your IDE
- Type checking at compile time
- IntelliSense for function parameters

```typescript
import type { 
  TransliterationOptions, 
  MatchOptions 
} from 'amharic-name-search';
```

---

## Browser Support

Works in all modern browsers that support:
- ES2020 features
- Unicode (for Amharic characters)

No polyfills needed!

---

## Need Help?

- Check the [README.md](./README.md) for API reference
- See [tests](./tests/transliteration.test.ts) for more examples
- Open an issue on GitHub if you encounter problems
