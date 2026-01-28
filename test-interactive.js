/**
 * Interactive test script for romanization feature
 * Run with: node test-interactive.js
 * 
 * This allows you to manually test different name/query combinations
 */

const { matchesName, transliterateToAmharic, expandSearchQuery } = require('./dist/index.js');
const { romanizeAmharicToAscii, containsAmharic } = require('./dist/romanization.js');

console.log('🔍 Interactive Amharic Name Search Tester\n');
console.log('='.repeat(60));
console.log('Test the romanization feature with your own examples!\n');

// Pre-defined test cases you can try
const examples = [
  { name: 'አማኑኤል', query: 'Ama', description: 'Partial match: "Ama" → "አማኑኤል"' },
  { name: 'አማኑኤል', query: 'amanuel', description: 'Full match: "amanuel" → "አማኑኤል"' },
  { name: 'ተስፋዬ', query: 'Tes', description: 'Partial match: "Tes" → "ተስፋዬ"' },
  { name: 'ሰላም', query: 'Sel', description: 'Partial match: "Sel" → "ሰላም"' },
  { name: 'Amanuel', query: 'አማ', description: 'Reverse: Amharic query → English name' },
];

console.log('📋 Example Test Cases:\n');
examples.forEach((ex, i) => {
  const result = matchesName(ex.name, ex.query);
  const romanized = containsAmharic(ex.name) ? romanizeAmharicToAscii(ex.name) : ex.name;
  console.log(`${i + 1}. ${ex.description}`);
  console.log(`   Name: "${ex.name}" (romanized: "${romanized}")`);
  console.log(`   Query: "${ex.query}"`);
  console.log(`   Match: ${result ? '✅ YES' : '❌ NO'}\n`);
});

console.log('='.repeat(60));
console.log('\n💡 Try your own test cases:\n');

// Test your own cases
const customTests = [
  // Add your own test cases here
  { name: 'አማኑኤል', query: 'Ama' },
  { name: 'አማኑኤል ፀጋዬ', query: 'Ama' },
  { name: 'Tesfaye', query: 'ተስ' },
];

console.log('Custom Tests:');
customTests.forEach((test, i) => {
  const result = matchesName(test.name, test.query);
  const nameRomanized = containsAmharic(test.name) ? romanizeAmharicToAscii(test.name) : test.name;
  const queryRomanized = containsAmharic(test.query) ? romanizeAmharicToAscii(test.query) : test.query;
  
  console.log(`\nTest ${i + 1}:`);
  console.log(`  Name: "${test.name}"`);
  if (containsAmharic(test.name)) {
    console.log(`  Name (romanized): "${nameRomanized}"`);
  }
  console.log(`  Query: "${test.query}"`);
  if (containsAmharic(test.query)) {
    console.log(`  Query (romanized): "${queryRomanized}"`);
  }
  console.log(`  Result: ${result ? '✅ MATCH' : '❌ NO MATCH'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✨ To test more cases, modify the customTests array in this file!');
