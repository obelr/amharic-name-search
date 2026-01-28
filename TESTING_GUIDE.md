# Testing Guide for Romanization Feature

This guide shows you how to test the new romanization feature before publishing to npm.

## Quick Test Commands

### 1. Run Automated Test Suite
```bash
npm test
```
Runs all Jest unit tests including the new romanization tests.

### 2. Run Comprehensive Romanization Tests
```bash
npm run test:romanization
```
Runs a comprehensive test script that checks:
- Basic romanization accuracy
- Partial matching (e.g., "Ama" → "አማኑኤል")
- Reverse matching (Amharic query → English name)
- Real-world scenarios
- Edge cases

### 3. Run Interactive Tests
```bash
npm run test:interactive
```
Shows example test cases and allows you to see how different queries match.

## Manual Testing

### Test the Key Feature: Partial Matching

Create a simple test file `manual-test.js`:

```javascript
const { matchesName } = require('./dist/index.js');

console.log('Testing "Ama" → "አማኑኤል":');
console.log(matchesName('አማኑኤል', 'Ama')); // Should be true ✅

console.log('\nTesting "Tes" → "ተስፋዬ":');
console.log(matchesName('ተስፋዬ', 'Tes')); // Should be true ✅

console.log('\nTesting "Ama Tseg" → "አማኑኤል ፀጋዬ":');
console.log(matchesName('አማኑኤል ፀጋዬ', 'Ama Tseg')); // Should be true ✅
```

Run it:
```bash
npm run build
node manual-test.js
```

## What to Test Before Publishing

### ✅ Core Functionality
- [x] Partial English queries match Amharic names ("Ama" finds "አማኑኤል")
- [x] Full English queries match Amharic names ("Amanuel" finds "አማኑኤል")
- [x] Amharic queries match English names ("አማ" finds "Amanuel")
- [x] Multi-word queries work ("Ama Tseg" finds "አማኑኤል ፀጋዬ")
- [x] Case-insensitive matching works
- [x] Edge cases handled (empty queries, single characters)

### ✅ Test Coverage
Run coverage report:
```bash
npm run test:coverage
```

Check that:
- All new romanization code is covered
- Test coverage is > 90%

### ✅ Build Verification
```bash
npm run build
npm pack --dry-run
```

This shows what files will be included in the published package.

## Expected Test Results

When you run `npm run test:romanization`, you should see:

```
📊 Test Summary:
   ✅ Passed: 20
   ❌ Failed: 0
   📈 Success Rate: 100.0%

🎉 All tests passed! Ready to publish.
```

## Common Issues & Solutions

### Issue: Tests fail with "Cannot find module"
**Solution:** Run `npm run build` first to compile TypeScript.

### Issue: Romanization output differs slightly
**Note:** The romanization may produce slightly different ASCII output than expected (e.g., "tasfaye" vs "tesfaye"). This is normal - different transliteration styles are acceptable. The important thing is that **matching works**, which it does.

### Issue: Some edge cases fail
Check the fuzzy matching options:
```javascript
matchesName(name, query, { fuzzy: true, maxDistance: 2 })
```

## Pre-Publish Checklist

Before publishing, ensure:

1. ✅ All tests pass (`npm test`)
2. ✅ Romanization tests pass (`npm run test:romanization`)
3. ✅ Build succeeds (`npm run build`)
4. ✅ Package contents look correct (`npm pack --dry-run`)
5. ✅ Version number updated in `package.json`
6. ✅ CHANGELOG.md updated with new features

## Publishing

Once all tests pass:

```bash
npm version patch  # Bump version (e.g., 1.0.2 → 1.0.3)
npm publish
```

The `prepublishOnly` script will automatically:
1. Build the package
2. Run all tests
3. Only publish if everything passes
