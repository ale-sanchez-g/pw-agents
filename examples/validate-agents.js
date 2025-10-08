/**
 * Validation script to verify all agents are properly structured
 * This doesn't run any tests, just validates the agent structure
 */
const { AccessibilityAgent, APIAgent, PerformanceAgent } = require('../agents');

console.log('='.repeat(60));
console.log('Agent Validation Script');
console.log('='.repeat(60));
console.log();

let allValid = true;

// Validate Accessibility Agent
console.log('1. Validating Accessibility Agent...');
try {
  const agent = new AccessibilityAgent();
  
  // Check required methods
  const requiredMethods = [
    'initialize',
    'runAccessibilityTest',
    'runMultiPageTest',
    'generateOverallSummary',
    'generateReport',
    'generateHTMLReport',
    'close'
  ];
  
  for (const method of requiredMethods) {
    if (typeof agent[method] !== 'function') {
      console.log(`  ✗ Missing method: ${method}`);
      allValid = false;
    }
  }
  
  // Check options
  if (!agent.options) {
    console.log('  ✗ Missing options property');
    allValid = false;
  }
  
  if (allValid) {
    console.log('  ✓ Accessibility Agent structure is valid');
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  allValid = false;
}
console.log();

// Validate API Agent
console.log('2. Validating API Agent...');
try {
  const agent = new APIAgent();
  
  // Check required methods
  const requiredMethods = [
    'initialize',
    'testEndpoint',
    'validateResponse',
    'testAllEndpoints',
    'generateTestData',
    'generateValueForType',
    'generateDataFromSchema',
    'generateReport',
    'generateHTMLReport',
    'close'
  ];
  
  for (const method of requiredMethods) {
    if (typeof agent[method] !== 'function') {
      console.log(`  ✗ Missing method: ${method}`);
      allValid = false;
    }
  }
  
  // Check options
  if (!agent.options) {
    console.log('  ✗ Missing options property');
    allValid = false;
  }
  
  if (allValid) {
    console.log('  ✓ API Agent structure is valid');
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  allValid = false;
}
console.log();

// Validate Performance Agent
console.log('3. Validating Performance Agent...');
try {
  const agent = new PerformanceAgent();
  
  // Check required methods
  const requiredMethods = [
    'getDefaultNFRs',
    'initialize',
    'runPerformanceTest',
    'runLighthouseAudit',
    'validateNFRs',
    'runLoadTest',
    'calculateMedian',
    'calculatePercentile',
    'generateReport',
    'generateHTMLReport',
    'close'
  ];
  
  for (const method of requiredMethods) {
    if (typeof agent[method] !== 'function') {
      console.log(`  ✗ Missing method: ${method}`);
      allValid = false;
    }
  }
  
  // Check options
  if (!agent.options) {
    console.log('  ✗ Missing options property');
    allValid = false;
  }
  
  // Check NFRs
  if (!agent.nfrs) {
    console.log('  ✗ Missing nfrs property');
    allValid = false;
  }
  
  if (allValid) {
    console.log('  ✓ Performance Agent structure is valid');
  }
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  allValid = false;
}
console.log();

// Test utility methods
console.log('4. Testing utility methods...');
try {
  const perfAgent = new PerformanceAgent();
  
  // Test calculateMedian
  const median = perfAgent.calculateMedian([1, 2, 3, 4, 5]);
  if (median !== 3) {
    console.log(`  ✗ calculateMedian failed: expected 3, got ${median}`);
    allValid = false;
  } else {
    console.log('  ✓ calculateMedian works correctly');
  }
  
  // Test calculatePercentile
  const p95 = perfAgent.calculatePercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95);
  if (p95 < 9 || p95 > 10) {
    console.log(`  ✗ calculatePercentile failed: expected ~10, got ${p95}`);
    allValid = false;
  } else {
    console.log('  ✓ calculatePercentile works correctly');
  }
  
  // Test validateNFRs
  const validation = perfAgent.validateNFRs({
    pageLoadTime: 2000,
    performanceScore: 95
  });
  
  if (!validation.checks || validation.checks.length === 0) {
    console.log('  ✗ validateNFRs failed: no checks returned');
    allValid = false;
  } else {
    console.log('  ✓ validateNFRs works correctly');
  }
  
} catch (error) {
  console.log(`  ✗ Error: ${error.message}`);
  allValid = false;
}
console.log();

console.log('='.repeat(60));
if (allValid) {
  console.log('✅ All agents are valid and ready to use!');
  console.log('='.repeat(60));
  process.exit(0);
} else {
  console.log('❌ Some validation checks failed');
  console.log('='.repeat(60));
  process.exit(1);
}
