# How Developers Use This Package

A simple guide showing exactly how to use `amharic-name-search` in your project.

---

## 🚀 Installation

```bash
npm install amharic-name-search
```

---

## 📦 Import

```typescript
import { matchesName } from 'amharic-name-search';
```

---

## 💡 Most Common Use Case: Search Filter

**Problem:** Users type "Amanuel" but your database has "አማኑኤል"

**Solution:**

```typescript
import { matchesName } from 'amharic-name-search';

const filtered = clients.filter(client =>
  matchesName(client.name, searchQuery)
);
```

**Result:**
- User types "Amanuel" → finds "አማኑኤል" ✅
- User types "አማኑኤል" → finds "Amanuel" ✅
- Works automatically!

---

## 🎯 Three Ways to Use This Package

### 1. Filter Arrays (Client-Side)

```typescript
import { matchesName } from 'amharic-name-search';

const results = items.filter(item =>
  matchesName(item.name, userInput)
);
```

**Use when:** Filtering data already loaded in memory (React state, Vue data, etc.)

---

### 2. Database Queries (Server-Side)

```typescript
import { expandSearchQuery } from 'amharic-name-search';

const searchTerms = expandSearchQuery('amanuel');
// ['amanuel', 'አማኑኤል']

// MongoDB
db.clients.find({
  $or: searchTerms.map(term => ({
    name: { $regex: term, $options: 'i' }
  }))
});

// PostgreSQL
db.query(
  `SELECT * FROM clients WHERE name ILIKE ANY($1)`,
  [searchTerms.map(t => `%${t}%`)]
);
```

**Use when:** Searching large databases efficiently

---

### 3. Form Validation

```typescript
import { matchesName } from 'amharic-name-search';

const nameExists = existingClients.some(client =>
  matchesName(client.name, newName)
);

if (nameExists) {
  alert('This name already exists!');
}
```

**Use when:** Checking if a name already exists (regardless of script)

---

## 📋 Complete Example: React Search Component

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
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search clients..."
      />
      
      <ul>
        {filteredClients.map(client => (
          <li key={client.id}>
            {client.name} - {client.phone}
          </li>
        ))}
      </ul>
      
      {filteredClients.length === 0 && query && (
        <p>No clients found</p>
      )}
    </div>
  );
}
```

---

## 🔧 Available Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `matchesName(name, query)` | Check if name matches query | `matchesName('አማኑኤል', 'amanuel')` → `true` |
| `transliterateToAmharic(english)` | Convert English → Amharic | `transliterateToAmharic('amanuel')` → `['አማኑኤል']` |
| `expandSearchQuery(query)` | Get all search terms | `expandSearchQuery('amanuel')` → `['amanuel', 'አማኑኤል']` |

---

## ✅ What This Package Does

- ✅ Searches work in both English and Amharic
- ✅ No configuration needed
- ✅ TypeScript support included
- ✅ Zero dependencies
- ✅ Works in browser and Node.js

---

## ❌ What This Package Doesn't Do

- ❌ General text transliteration (only names)
- ❌ Amharic → English conversion (only English → Amharic)
- ❌ Phonetic matching (uses predefined mappings)

---

## 🎓 Real-World Scenarios

### Scenario 1: Case Management System

**Before:**
```typescript
// User types "Amanuel" → No results found
// Database has "አማኑኤል"
```

**After:**
```typescript
import { matchesName } from 'amharic-name-search';

const matches = cases.filter(c =>
  matchesName(c.clientName, searchQuery)
);
// Now "Amanuel" finds "አማኑኤል" ✅
```

---

### Scenario 2: Client Directory

**Before:**
```typescript
// Users must type exact name in exact script
// Frustrating for bilingual users
```

**After:**
```typescript
import { matchesName } from 'amharic-name-search';

// Users can type in either script
// System finds matches automatically ✅
```

---

### Scenario 3: Form Validation

**Before:**
```typescript
// "Amanuel" and "አማኑኤል" treated as different names
// Allows duplicates
```

**After:**
```typescript
import { matchesName } from 'amharic-name-search';

const duplicate = existing.some(c =>
  matchesName(c.name, newName)
);
// Prevents duplicates regardless of script ✅
```

---

## 📚 More Resources

- **Quick Start:** [QUICK_START.md](./QUICK_START.md) - Get started in 3 steps
- **Full Guide:** [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 10+ detailed examples
- **Developer Guide:** [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Complete reference
- **API Docs:** [README.md](./README.md) - Full API documentation

---

## 🆘 Need Help?

1. Check the [Usage Guide](./USAGE_GUIDE.md) for examples
2. Look at [tests](./tests/transliteration.test.ts) for more examples
3. Open an issue on GitHub

---

## 🎉 That's It!

You're ready to use `amharic-name-search` in your project. Just:

1. Install: `npm install amharic-name-search`
2. Import: `import { matchesName } from 'amharic-name-search'`
3. Use: `matchesName(name, query)`

Happy coding! 🚀
