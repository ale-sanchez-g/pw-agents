const PerformanceAgent = require('../agents/performance-agent');
const fs = require('fs').promises;

/**
 * Example: Running performance tests based on NFRs
 */
async function runPerformanceExample() {
  // Define custom NFRs (Non-Functional Requirements)
  const customNFRs = {
    pageLoadTime: { max: 3000, unit: 'ms' },
    firstContentfulPaint: { max: 1800, unit: 'ms' },
    largestContentfulPaint: { max: 2500, unit: 'ms' },
    timeToInteractive: { max: 3500, unit: 'ms' },
    totalBlockingTime: { max: 300, unit: 'ms' },
    cumulativeLayoutShift: { max: 0.1, unit: 'score' },
    performanceScore: { min: 90, unit: 'score' }
  };

  const agent = new PerformanceAgent({
    headless: true,
    nfrs: customNFRs
  });

  console.log('Running performance tests...\n');

  try {
    // Test 1: Basic performance test
    console.log('Test 1: Basic performance test');
    const result1 = await agent.runPerformanceTest('https://www.example.com');
    console.log(`  URL: ${result1.url}`);
    console.log(`  Page Load Time: ${result1.metrics.pageLoadTime}ms`);
    console.log(`  First Contentful Paint: ${result1.metrics.firstContentfulPaint?.toFixed(2)}ms`);
    console.log(`  Total Resources: ${result1.resources?.totalResources}`);
    console.log(`  NFR Validation Passed: ${result1.passed}`);
    console.log('');

    // Test 2: Lighthouse audit
    console.log('Test 2: Lighthouse audit (if browser supports remote debugging)');
    try {
      const lighthouseResult = await agent.runLighthouseAudit('https://www.example.com');
      console.log(`  URL: ${lighthouseResult.url}`);
      console.log(`  Performance Score: ${lighthouseResult.scores?.performance?.toFixed(2)}`);
      console.log(`  Accessibility Score: ${lighthouseResult.scores?.accessibility?.toFixed(2)}`);
      console.log(`  Best Practices Score: ${lighthouseResult.scores?.bestPractices?.toFixed(2)}`);
      console.log(`  SEO Score: ${lighthouseResult.scores?.seo?.toFixed(2)}`);
      console.log(`  LCP: ${lighthouseResult.metrics?.largestContentfulPaint?.toFixed(2)}ms`);
      console.log(`  TBT: ${lighthouseResult.metrics?.totalBlockingTime?.toFixed(2)}ms`);
      console.log(`  CLS: ${lighthouseResult.metrics?.cumulativeLayoutShift?.toFixed(4)}`);
      console.log(`  NFR Validation Passed: ${lighthouseResult.passed}`);
      console.log('');

      // Generate Lighthouse report
      const lighthouseJsonReport = await agent.generateReport(lighthouseResult, 'json');
      await fs.writeFile('performance-lighthouse-report.json', lighthouseJsonReport);
      console.log('  Lighthouse JSON report saved: performance-lighthouse-report.json');

      const lighthouseHtmlReport = await agent.generateReport(lighthouseResult, 'html');
      await fs.writeFile('performance-lighthouse-report.html', lighthouseHtmlReport);
      console.log('  Lighthouse HTML report saved: performance-lighthouse-report.html');
      console.log('');
    } catch (error) {
      console.log(`  Lighthouse test skipped: ${error.message}\n`);
    }

    // Test 3: Load test
    console.log('Test 3: Load test (multiple iterations)');
    const loadTestResult = await agent.runLoadTest('https://www.example.com', {
      iterations: 5,
      concurrency: 1
    });
    console.log(`  URL: ${loadTestResult.url}`);
    console.log(`  Iterations: ${loadTestResult.iterations}`);
    console.log(`  Min Load Time: ${loadTestResult.statistics?.min?.toFixed(2)}ms`);
    console.log(`  Max Load Time: ${loadTestResult.statistics?.max?.toFixed(2)}ms`);
    console.log(`  Average Load Time: ${loadTestResult.statistics?.average?.toFixed(2)}ms`);
    console.log(`  Median Load Time: ${loadTestResult.statistics?.median?.toFixed(2)}ms`);
    console.log(`  95th Percentile: ${loadTestResult.statistics?.p95?.toFixed(2)}ms`);
    console.log('');

    // Generate reports
    console.log('Generating reports...');
    const jsonReport = await agent.generateReport(result1, 'json');
    await fs.writeFile('performance-report.json', jsonReport);
    console.log('  JSON report saved: performance-report.json');

    const htmlReport = await agent.generateReport(result1, 'html');
    await fs.writeFile('performance-report.html', htmlReport);
    console.log('  HTML report saved: performance-report.html');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await agent.close();
    console.log('\nPerformance tests completed!');
  }
}

// Run the example if executed directly
if (require.main === module) {
  runPerformanceExample();
}

module.exports = runPerformanceExample;
