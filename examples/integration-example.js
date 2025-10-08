const { AccessibilityAgent, APIAgent, PerformanceAgent } = require('../agents');
const fs = require('fs').promises;

/**
 * Integration Example: Using all three agents together
 * This demonstrates a complete testing workflow
 */
async function runIntegrationExample() {
  console.log('='.repeat(60));
  console.log('Integration Example: Complete Testing Workflow');
  console.log('='.repeat(60));
  console.log();

  const testUrl = 'https://www.example.com';
  const results = {
    accessibility: null,
    api: null,
    performance: null,
    summary: {
      overallPassed: true,
      timestamp: new Date().toISOString()
    }
  };

  // ========================================
  // 1. Accessibility Testing
  // ========================================
  console.log('Step 1: Running Accessibility Tests');
  console.log('-'.repeat(60));
  
  const accessibilityAgent = new AccessibilityAgent({ headless: true });
  
  try {
    results.accessibility = await accessibilityAgent.runAccessibilityTest(testUrl);
    
    console.log(`✓ Accessibility scan completed`);
    console.log(`  Violations: ${results.accessibility.summary.totalViolations}`);
    console.log(`  Critical: ${results.accessibility.summary.critical}`);
    console.log(`  Serious: ${results.accessibility.summary.serious}`);
    
    if (results.accessibility.summary.critical > 0) {
      results.summary.overallPassed = false;
      console.log('  ⚠ Critical accessibility issues found!');
    }
  } catch (error) {
    console.error(`✗ Accessibility testing failed: ${error.message}`);
    results.summary.overallPassed = false;
  } finally {
    await accessibilityAgent.close();
  }
  
  console.log();

  // ========================================
  // 2. API Testing (if applicable)
  // ========================================
  console.log('Step 2: Running API Tests');
  console.log('-'.repeat(60));
  
  const apiAgent = new APIAgent({
    baseURL: 'https://petstore.swagger.io/v2'
  });
  
  try {
    await apiAgent.initialize('https://petstore.swagger.io/v2/swagger.json');
    
    // Test a few key endpoints
    const endpoint1 = await apiAgent.testEndpoint('/pet/findByStatus', 'GET', {
      params: { status: 'available' }
    });
    
    results.api = {
      tested: 1,
      passed: endpoint1.success ? 1 : 0,
      failed: endpoint1.success ? 0 : 1,
      endpoints: [endpoint1]
    };
    
    console.log(`✓ API tests completed`);
    console.log(`  Endpoints tested: ${results.api.tested}`);
    console.log(`  Passed: ${results.api.passed}`);
    console.log(`  Failed: ${results.api.failed}`);
    
    if (results.api.failed > 0) {
      results.summary.overallPassed = false;
      console.log('  ⚠ Some API tests failed!');
    }
  } catch (error) {
    console.error(`✗ API testing failed: ${error.message}`);
    results.api = { error: error.message };
  } finally {
    await apiAgent.close();
  }
  
  console.log();

  // ========================================
  // 3. Performance Testing
  // ========================================
  console.log('Step 3: Running Performance Tests');
  console.log('-'.repeat(60));
  
  const performanceAgent = new PerformanceAgent({
    headless: true,
    nfrs: {
      pageLoadTime: { max: 5000, unit: 'ms' },
      firstContentfulPaint: { max: 2500, unit: 'ms' },
      performanceScore: { min: 80, unit: 'score' }
    }
  });
  
  try {
    results.performance = await performanceAgent.runPerformanceTest(testUrl);
    
    console.log(`✓ Performance tests completed`);
    console.log(`  Page Load Time: ${results.performance.metrics.pageLoadTime}ms`);
    console.log(`  First Contentful Paint: ${results.performance.metrics.firstContentfulPaint?.toFixed(2)}ms`);
    console.log(`  NFR Validation: ${results.performance.passed ? 'PASSED' : 'FAILED'}`);
    
    if (!results.performance.passed) {
      results.summary.overallPassed = false;
      console.log('  ⚠ Performance NFRs not met!');
      
      // Show failed NFRs
      const failedChecks = results.performance.nfrValidation.checks.filter(c => !c.passed);
      if (failedChecks.length > 0) {
        console.log('  Failed NFRs:');
        failedChecks.forEach(check => {
          console.log(`    - ${check.nfr}: Expected ${JSON.stringify(check.expected)}, Got ${check.actual}`);
        });
      }
    }
  } catch (error) {
    console.error(`✗ Performance testing failed: ${error.message}`);
    results.summary.overallPassed = false;
    results.performance = { error: error.message };
  } finally {
    await performanceAgent.close();
  }
  
  console.log();

  // ========================================
  // 4. Generate Combined Report
  // ========================================
  console.log('Step 4: Generating Combined Report');
  console.log('-'.repeat(60));
  
  try {
    // Save JSON report
    const jsonReport = JSON.stringify(results, null, 2);
    await fs.writeFile('integration-report.json', jsonReport);
    console.log('✓ JSON report saved: integration-report.json');
    
    // Generate HTML summary
    const htmlReport = generateHTMLSummary(results);
    await fs.writeFile('integration-report.html', htmlReport);
    console.log('✓ HTML report saved: integration-report.html');
  } catch (error) {
    console.error(`✗ Report generation failed: ${error.message}`);
  }
  
  console.log();

  // ========================================
  // Final Summary
  // ========================================
  console.log('='.repeat(60));
  console.log('Final Summary');
  console.log('='.repeat(60));
  console.log(`Overall Status: ${results.summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Timestamp: ${results.summary.timestamp}`);
  console.log();
  
  if (results.accessibility) {
    console.log('Accessibility:');
    console.log(`  Total Violations: ${results.accessibility.summary?.totalViolations || 'N/A'}`);
    console.log(`  Critical Issues: ${results.accessibility.summary?.critical || 0}`);
  }
  
  if (results.api && !results.api.error) {
    console.log('API:');
    console.log(`  Success Rate: ${results.api.tested > 0 ? ((results.api.passed / results.api.tested) * 100).toFixed(2) : 0}%`);
  }
  
  if (results.performance && !results.performance.error) {
    console.log('Performance:');
    console.log(`  Page Load Time: ${results.performance.metrics?.pageLoadTime}ms`);
    console.log(`  NFR Validation: ${results.performance.passed ? 'PASSED' : 'FAILED'}`);
  }
  
  console.log();
  console.log('Integration testing completed!');
  console.log('='.repeat(60));
  
  return results;
}

function generateHTMLSummary(results) {
  const overallStatus = results.summary.overallPassed ? 
    '<span style="color: green;">✅ PASSED</span>' : 
    '<span style="color: red;">❌ FAILED</span>';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Integration Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #2196f3; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .summary { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #2196f3; }
    .section { background: #fafafa; padding: 20px; margin: 15px 0; border-radius: 5px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-weight: bold; color: #666; }
    .metric-value { color: #2196f3; font-size: 1.2em; }
    .passed { color: #4caf50; font-weight: bold; }
    .failed { color: #f44336; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Integration Test Report</h1>
    
    <div class="summary">
      <h2>Overall Summary</h2>
      <div class="metric">
        <span class="metric-label">Status:</span>
        <span class="metric-value">${overallStatus}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Timestamp:</span>
        <span class="metric-value">${results.summary.timestamp}</span>
      </div>
    </div>
    
    ${results.accessibility ? `
    <div class="section">
      <h2>Accessibility Testing</h2>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Total Violations</td>
          <td>${results.accessibility.summary?.totalViolations || 0}</td>
        </tr>
        <tr>
          <td>Critical</td>
          <td class="${results.accessibility.summary?.critical > 0 ? 'failed' : 'passed'}">${results.accessibility.summary?.critical || 0}</td>
        </tr>
        <tr>
          <td>Serious</td>
          <td class="${results.accessibility.summary?.serious > 0 ? 'failed' : 'passed'}">${results.accessibility.summary?.serious || 0}</td>
        </tr>
        <tr>
          <td>Moderate</td>
          <td>${results.accessibility.summary?.moderate || 0}</td>
        </tr>
        <tr>
          <td>Minor</td>
          <td>${results.accessibility.summary?.minor || 0}</td>
        </tr>
      </table>
    </div>
    ` : ''}
    
    ${results.api && !results.api.error ? `
    <div class="section">
      <h2>API Testing</h2>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Endpoints Tested</td>
          <td>${results.api.tested}</td>
        </tr>
        <tr>
          <td>Passed</td>
          <td class="passed">${results.api.passed}</td>
        </tr>
        <tr>
          <td>Failed</td>
          <td class="${results.api.failed > 0 ? 'failed' : 'passed'}">${results.api.failed}</td>
        </tr>
        <tr>
          <td>Success Rate</td>
          <td>${results.api.tested > 0 ? ((results.api.passed / results.api.tested) * 100).toFixed(2) : 0}%</td>
        </tr>
      </table>
    </div>
    ` : ''}
    
    ${results.performance && !results.performance.error ? `
    <div class="section">
      <h2>Performance Testing</h2>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Page Load Time</td>
          <td>${results.performance.metrics?.pageLoadTime}ms</td>
        </tr>
        <tr>
          <td>First Contentful Paint</td>
          <td>${results.performance.metrics?.firstContentfulPaint?.toFixed(2) || 'N/A'}ms</td>
        </tr>
        <tr>
          <td>NFR Validation</td>
          <td class="${results.performance.passed ? 'passed' : 'failed'}">${results.performance.passed ? 'PASSED' : 'FAILED'}</td>
        </tr>
      </table>
      
      ${results.performance.nfrValidation ? `
      <h3>NFR Validation Details</h3>
      <table>
        <tr>
          <th>NFR</th>
          <th>Expected</th>
          <th>Actual</th>
          <th>Status</th>
        </tr>
        ${results.performance.nfrValidation.checks.map(check => `
          <tr>
            <td>${check.nfr}</td>
            <td>${JSON.stringify(check.expected)}</td>
            <td>${check.actual !== undefined ? check.actual : 'N/A'}</td>
            <td class="${check.passed ? 'passed' : check.status === 'skipped' ? '' : 'failed'}">${check.status.toUpperCase()}</td>
          </tr>
        `).join('')}
      </table>
      ` : ''}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

// Run the integration example if executed directly
if (require.main === module) {
  runIntegrationExample()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = runIntegrationExample;
