# Amharic Name Search

A lightweight TypeScript library for transliterating and matching Ethiopian names in both English and Amharic scripts. Perfect for building bilingual search functionality.

> **Note:** This is a transliteration library, not a search engine. Use it with databases (MongoDB, PostgreSQL), search engines (Elasticsearch), or for client-side filtering.
> 

## Quick Start

```bash
npm install amharic-name-search
```

```typescript
import { matchesName } from 'amharic-name-search';

// Search works in both directions!
matchesName('አማኑኤል', 'amanuel'); // true ✅
matchesName('Amanuel', 'አማኑኤል'); // true ✅

// NEW: Romanization-based partial matching
matchesName('አማኑኤል', 'Ama');      // true ✅
matchesName('ተስፋዬ', 'Tes');       // true ✅
matchesName('አማኑኤል ፀጋዬ', 'Ama Tseg'); // true ✅
```

**That's it!** Now you can search for names regardless of whether they're typed in English or Amharic.


## Usage

### Basic Transliteration

```typescript
import { transliterateToAmharic } from 'amharic-name-search';

const amharicVariants = transliterateToAmharic('amanuel');
// Returns: ['አማኑኤል']
```

### Name Matching

```typescript
import { matchesName } from 'amharic-name-search';

// Match English query with Amharic name
matchesName('አማኑኤል', 'amanuel'); // true
matchesName('አማኑኤል ፀጋዬ', 'amanuel'); // true

// Match Amharic query with English name
matchesName('Amanuel', 'አማኑኤል'); // true
matchesName('Amanuel Tsegaye', 'አማኑኤል'); // true

// Romanization-aware matching (handles \"weird\" spellings)
matchesName('ተስፋዬ', 'tesfaye');  // true  (standard)
matchesName('ተስፋዬ', 'tasfaye');  // true  (non-standard)
matchesName('ሰላም', 'Sel');      // true  (prefix)
matchesName('ዮሐንስ', 'Yoh');     // true  (prefix)
```

### Search Query Expansion

```typescript
import { expandSearchQuery } from 'amharic-name-search';

const searchTerms = expandSearchQuery('amanuel');
// Returns: ['amanuel', 'አማኑኤል']
```

## API Reference

### `transliterateToAmharic(englishText, options?)`

Converts English phonetic input to possible Amharic character sequences.

**Parameters:**
- `englishText` (string): English text to transliterate
- `options` (TransliterationOptions, optional): Configuration options
  - `includePartialMatches` (boolean, default: true): Include partial matches

**Returns:** `string[]` - Array of Amharic name variants

**Example:**
```typescript
transliterateToAmharic('amanuel');
// ['አማኑኤል']
```

### `matchesName(name, query, options?)`

Checks if a name matches a search query, considering transliteration.

**Parameters:**
- `name` (string): The name to check (could be in Amharic or English)
- `query` (string): The search query (could be in Amharic or English)
- `options` (MatchOptions, optional): Configuration options
  - `caseSensitive` (boolean, default: false): Case-sensitive matching
  - `wholeWord` (boolean, default: false): Match whole words only

**Returns:** `boolean` - True if the name matches the query

**Example:**
```typescript
matchesName('አማኑኤል', 'amanuel'); // true
matchesName('Amanuel', 'አማኑኤል'); // true
```

### `expandSearchQuery(query)`

Expands a search query to include transliterated Amharic variants. Useful for database queries or search APIs.

**Parameters:**
- `query` (string): Search query to expand

**Returns:** `string[]` - Array of search terms including original and transliterated variants

**Example:**
```typescript
expandSearchQuery('amanuel');
// ['amanuel', 'አማኑኤል']
```

## Use Cases

### React Component Example

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

### Database Query Example

```typescript
import { expandSearchQuery } from 'amharic-name-search';

async function searchClients(query: string) {
  const searchTerms = expandSearchQuery(query);
  
  // MongoDB example
  return db.clients.find({
    $or: searchTerms.map(term => ({
      name: { $regex: term, $options: 'i' }
    }))
  });
  
  // SQL example (PostgreSQL)
  // const conditions = searchTerms.map(term => `name ILIKE '%${term}%'`).join(' OR ');
  // return db.query(`SELECT * FROM clients WHERE ${conditions}`);
}
```

### Server-Side Filtering Example

```typescript
import { matchesName } from 'amharic-name-search';

app.get('/api/clients', (req, res) => {
  const { search } = req.query;
  
  if (!search) {
    return res.json(clients);
  }
  
  const filtered = clients.filter(client =>
    matchesName(client.name, search as string)
  );
  
  res.json(filtered);
});
```

## Supported Names

The library includes mappings for common Ethiopian names including:
- Amanuel (አማኑኤል)
- Tadesse (ታደሰ)
- Tesfaye (ተስፋዬ)
- Yohannes (ዮሐንስ)
- Mariam (ማርያም)
- And many more...

See `src/name-mappings.ts` for the complete list.

In addition to the built-in dictionary, the matcher uses:
- A **romanization layer** based on the official Amharic/Ge'ez Fidel table, simplified to ASCII
- **Fuzzy and prefix matching** on the Latin side

This means it can successfully match many real-world spellings that do **not** follow strict transliteration rules, e.g.:
- `tasfaye`, `tesfaye` → `ተስፋዬ`
- `Ama`, `Aman`, `Amanuel` → `አማኑኤል`
- `Ama Tseg` → `አማኑኤል ፀጋዬ`

## TypeScript Support

This package is written in TypeScript and includes full type definitions. No additional `@types` package needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details.
