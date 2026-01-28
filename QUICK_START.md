# Quick Start Guide

Get started with `amharic-name-search` in 3 steps!

## Step 1: Install

```bash
npm install amharic-name-search
```

## Step 2: Import

```typescript
import { matchesName } from 'amharic-name-search';
```

## Step 3: Use

```typescript
// Search for clients
const results = clients.filter(client =>
  matchesName(client.name, searchQuery)
);
```

That's it! Now searching "Amanuel" will find "አማኑኤል" automatically.

---

## Common Use Cases

### 🔍 Search Filter (Most Common)

```typescript
import { matchesName } from 'amharic-name-search';

const filtered = items.filter(item =>
  matchesName(item.name, userInput)
);
```

### 🗄️ Database Query

```typescript
import { expandSearchQuery } from 'amharic-name-search';

const searchTerms = expandSearchQuery('amanuel');
// ['amanuel', 'አማኑኤል']

// Use in MongoDB
db.clients.find({
  $or: searchTerms.map(term => ({
    name: { $regex: term, $options: 'i' }
  }))
});
```

### ✅ Form Validation

```typescript
import { matchesName } from 'amharic-name-search';

const nameExists = existingClients.some(client =>
  matchesName(client.name, newName)
);
```

---

## Three Main Functions

| Function | What It Does | When to Use |
|----------|--------------|-------------|
| `matchesName(name, query)` | Checks if name matches query | Filtering, validation |
| `transliterateToAmharic(english)` | Converts English → Amharic | Getting variants |
| `expandSearchQuery(query)` | Gets all search terms | Database queries |

---

## Real-World Example

```typescript
import { matchesName } from 'amharic-name-search';

function ClientSearch({ clients }) {
  const [query, setQuery] = useState('');
  
  const filtered = clients.filter(client =>
    matchesName(client.name, query)
  );
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search clients..."
    />
  );
}
```

**Result:**
- User types "Amanuel" → finds "አማኑኤል"
- User types "አማኑኤል" → finds "Amanuel"
- Works automatically!

---

## Need More Examples?

- 📖 [Full Usage Guide](./USAGE_GUIDE.md) - 10+ detailed examples
- 📚 [API Reference](./README.md#api-reference) - Complete documentation
- 🧪 [Tests](./tests/transliteration.test.ts) - See how it's tested

---

## Why Use This Package?

✅ **Zero Configuration** - Works out of the box  
✅ **TypeScript Support** - Full type definitions included  
✅ **No Dependencies** - Lightweight and fast  
✅ **Bidirectional** - Works English ↔ Amharic  
✅ **Production Ready** - Tested and documented

---

## Support

- Found a bug? [Open an issue](https://github.com/your-org/amharic-name-search/issues)
- Want to contribute? [See CONTRIBUTING.md](./CONTRIBUTING.md)
- Need help? Check the [Usage Guide](./USAGE_GUIDE.md)
