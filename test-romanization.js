/**
 * Quick test script for romanization feature
 * Run with: node test-romanization.js
 */

const { matchesName, transliterateToAmharic, expandSearchQuery } = require('./dist/index.js');
const { romanizeAmharicToAscii, containsAmharic } = require('./dist/romanization.js');

console.log('🧪 Testing Romanization Feature\n');
console.log('=' .repeat(60));

// Test 1: Basic romanization
console.log('\n1️⃣ Testing Basic Romanization:');
console.log('-'.repeat(60));
const testCases = [
  { amharic: 'አማኑኤል', expected: 'amanuel' },
  { amharic: 'ተስፋዬ', expected: 'tesfaye' },
  { amharic: 'ሰላም', expected: 'selam' },
  { amharic: 'ዮሐንስ', expected: 'yohannes' },
];

testCases.forEach(({ amharic, expected }) => {
  const romanized = romanizeAmharicToAscii(amharic);
  const match = romanized.includes(expected) || expected.includes(romanized);
  console.log(`  ${amharic} → "${romanized}" (expected: "${expected}") ${match ? '✅' : '❌'}`);
});

// Test 2: Partial matching - THE KEY FEATURE
console.log('\n2️⃣ Testing Partial Matching (Ama → Amanuel):');
console.log('-'.repeat(60));
const partialTests = [
  { name: 'አማኑኤል', query: 'Ama', shouldMatch: true },
  { name: 'አማኑኤል', query: 'ama', shouldMatch: true },
  { name: 'አማኑኤል', query: 'AMANUEL', shouldMatch: true },
  { name: 'አማኑኤል ፀጋዬ', query: 'Ama', shouldMatch: true },
  { name: 'አማኑኤል', query: 'Amanuel', shouldMatch: true },
  { name: 'ተስፋዬ', query: 'Tes', shouldMatch: true },
  { name: 'ተስፋዬ', query: 'tesfaye', shouldMatch: true },
  { name: 'ሰላም', query: 'Sel', shouldMatch: true },
  { name: 'ዮሐንስ', query: 'Yoh', shouldMatch: true },
  { name: 'አማኑኤል', query: 'xyz', shouldMatch: false },
  { name: 'አማኑኤል', query: 'John', shouldMatch: false },
];

let passed = 0;
let failed = 0;

partialTests.forEach(({ name, query, shouldMatch }) => {
  const result = matchesName(name, query);
  const status = result === shouldMatch ? '✅' : '❌';
  if (result === shouldMatch) {
    passed++;
  } else {
    failed++;
  }
  console.log(`  ${status} "${query}" matches "${name}"? ${result} (expected: ${shouldMatch})`);
});

// Test 3: Reverse matching (Amharic query → English name)
console.log('\n3️⃣ Testing Reverse Matching (Amharic query → English name):');
console.log('-'.repeat(60));
const reverseTests = [
  { name: 'Amanuel', query: 'አማ', shouldMatch: true },
  { name: 'Amanuel Tsegaye', query: 'አማኑኤል', shouldMatch: true },
  { name: 'Tesfaye', query: 'ተስ', shouldMatch: true },
];

reverseTests.forEach(({ name, query, shouldMatch }) => {
  const result = matchesName(name, query);
  const status = result === shouldMatch ? '✅' : '❌';
  if (result === shouldMatch) {
    passed++;
  } else {
    failed++;
  }
  console.log(`  ${status} "${query}" matches "${name}"? ${result} (expected: ${shouldMatch})`);
});

// Test 4: Real-world scenarios
console.log('\n4️⃣ Real-World Scenarios:');
console.log('-'.repeat(60));
const realWorldTests = [
  { name: 'አማኑኤል ፀጋዬ', query: 'amanuel tsegaye', shouldMatch: true },
  { name: 'አማኑኤል ፀጋዬ', query: 'Ama Tseg', shouldMatch: true },
  { name: 'Amanuel Tsegaye', query: 'አማ', shouldMatch: true },
];

realWorldTests.forEach(({ name, query, shouldMatch }) => {
  const result = matchesName(name, query);
  const status = result === shouldMatch ? '✅' : '❌';
  if (result === shouldMatch) {
    passed++;
  } else {
    failed++;
  }
  console.log(`  ${status} "${query}" matches "${name}"? ${result} (expected: ${shouldMatch})`);
});

// Test 5: Edge cases
console.log('\n5️⃣ Edge Cases:');
console.log('-'.repeat(60));
const edgeTests = [
  { name: 'አማኑኤል', query: 'a', shouldMatch: true }, // Single character
  { name: 'አማኑኤል', query: 'am', shouldMatch: true }, // Two characters
  { name: 'አማኑኤል', query: '', shouldMatch: false }, // Empty query
];

edgeTests.forEach(({ name, query, shouldMatch }) => {
  const result = matchesName(name, query);
  const status = result === shouldMatch ? '✅' : '❌';
  if (result === shouldMatch) {
    passed++;
  } else {
    failed++;
  }
  console.log(`  ${status} "${query}" matches "${name}"? ${result} (expected: ${shouldMatch})`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Summary:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Ready to publish.');
} else {
  console.log('\n⚠️  Some tests failed. Please review before publishing.');
}
