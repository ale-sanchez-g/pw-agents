const AccessibilityAgent = require('../agents/accessibility-agent');
const fs = require('fs').promises;

/**
 * Example: Running accessibility tests on a website
 */
async function runAccessibilityExample() {
  const agent = new AccessibilityAgent({
    headless: true
  });

  console.log('Running accessibility tests...\n');

  try {
    // Test 1: Simple accessibility scan
    console.log('Test 1: Simple accessibility scan');
    const result1 = await agent.runAccessibilityTest('https://www.example.com');
    console.log(`  URL: ${result1.url}`);
    console.log(`  Total Violations: ${result1.summary.totalViolations}`);
    console.log(`  Critical: ${result1.summary.critical}`);
    console.log(`  Serious: ${result1.summary.serious}`);
    console.log(`  Moderate: ${result1.summary.moderate}`);
    console.log(`  Minor: ${result1.summary.minor}`);
    console.log('');

    // Test 2: Accessibility test with workflow
    console.log('Test 2: Accessibility test with workflow');
    const workflowResult = await agent.runAccessibilityTest(
      'https://www.example.com',
      async (page) => {
        // Example workflow: Navigate and interact
        await page.click('body'); // Example interaction
      }
    );
    console.log(`  URL: ${workflowResult.url}`);
    console.log(`  Total Violations: ${workflowResult.summary.totalViolations}`);
    console.log('');

    // Test 3: Multi-page accessibility test
    console.log('Test 3: Multi-page accessibility test');
    const urls = [
      'https://www.example.com',
      'https://www.example.org'
    ];
    const multiPageResult = await agent.runMultiPageTest(urls);
    console.log(`  Total Pages: ${multiPageResult.totalPages}`);
    console.log(`  Overall Violations: ${multiPageResult.overallSummary.totalViolations}`);
    console.log(`  Overall Critical: ${multiPageResult.overallSummary.critical}`);
    console.log('');

    // Generate reports
    console.log('Generating reports...');
    const jsonReport = await agent.generateReport(result1, 'json');
    await fs.writeFile('accessibility-report.json', jsonReport);
    console.log('  JSON report saved: accessibility-report.json');

    const htmlReport = await agent.generateReport(result1, 'html');
    await fs.writeFile('accessibility-report.html', htmlReport);
    console.log('  HTML report saved: accessibility-report.html');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await agent.close();
    console.log('\nAccessibility tests completed!');
  }
}

// Run the example if executed directly
if (require.main === module) {
  runAccessibilityExample();
}

module.exports = runAccessibilityExample;
