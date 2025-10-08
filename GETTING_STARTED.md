# Getting Started with pw-agents

This guide will help you get started with the pw-agents testing framework.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ale-sanchez-g/pw-agents.git
cd pw-agents
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Quick Start

### 1. Accessibility Testing

Test a website for accessibility issues:

```javascript
const { AccessibilityAgent } = require('./agents');

async function testAccessibility() {
  const agent = new AccessibilityAgent({ headless: true });
  
  const results = await agent.runAccessibilityTest('https://www.example.com');
  
  console.log(`Total Violations: ${results.summary.totalViolations}`);
  console.log(`Critical Issues: ${results.summary.critical}`);
  
  await agent.close();
}

testAccessibility();
```

Run the built-in example:
```bash
npm run test:accessibility
```

### 2. API Testing

Test your API endpoints using a Swagger document:

```javascript
const { APIAgent } = require('./agents');

async function testAPI() {
  const agent = new APIAgent({
    baseURL: 'https://jsonplaceholder.typicode.com'
  });
  
  // Use local Swagger file
  await agent.initialize('./examples/data/sample-api.json');
  
  // Test a single endpoint
  const result = await agent.testEndpoint('/posts', 'GET');
  console.log(`Status: ${result.response.status}`);
  
  await agent.close();
}

testAPI();
```

Run the built-in example:
```bash
npm run test:api
```

### 3. Performance Testing

Test your website's performance against NFRs:

```javascript
const { PerformanceAgent } = require('./agents');

async function testPerformance() {
  const agent = new PerformanceAgent({
    headless: true,
    nfrs: {
      pageLoadTime: { max: 3000, unit: 'ms' },
      firstContentfulPaint: { max: 1800, unit: 'ms' }
    }
  });
  
  const results = await agent.runPerformanceTest('https://www.example.com');
  
  console.log(`Page Load Time: ${results.metrics.pageLoadTime}ms`);
  console.log(`NFR Validation: ${results.passed ? 'PASSED' : 'FAILED'}`);
  
  await agent.close();
}

testPerformance();
```

Run the built-in example:
```bash
npm run test:performance
```

### 4. Integration Testing

Run all three agents together:

```bash
npm run test:integration
```

This will:
1. Run accessibility tests
2. Run API tests
3. Run performance tests
4. Generate a combined report

## Understanding the Results

### Accessibility Results

The accessibility agent returns:
- **Violations**: List of accessibility issues found
- **Impact Levels**: Critical, Serious, Moderate, Minor
- **Summary**: Count of violations by severity

### API Results

The API agent returns:
- **Endpoint Results**: Success/failure status for each endpoint
- **Response Details**: Status codes, headers, body
- **Validation**: Schema validation against Swagger document

### Performance Results

The performance agent returns:
- **Metrics**: Page load time, FCP, LCP, TTI, TBT, CLS
- **NFR Validation**: Pass/fail status against your requirements
- **Resource Analysis**: Count and size of loaded resources

## Generating Reports

All agents support JSON and HTML report generation:

```javascript
// JSON Report
const jsonReport = await agent.generateReport(results, 'json');
await fs.writeFile('report.json', jsonReport);

// HTML Report
const htmlReport = await agent.generateReport(results, 'html');
await fs.writeFile('report.html', htmlReport);
```

## Advanced Usage

### Accessibility with Workflows

Test accessibility after user interactions:

```javascript
const results = await agent.runAccessibilityTest(
  'https://www.example.com',
  async (page) => {
    // Perform user actions
    await page.click('#menu-button');
    await page.fill('#search', 'test');
    await page.click('#submit');
  }
);
```

### Multi-Page Accessibility Testing

Test multiple pages at once:

```javascript
const results = await agent.runMultiPageTest([
  'https://www.example.com',
  'https://www.example.com/about',
  'https://www.example.com/contact'
]);
```

### Load Testing

Run performance tests multiple times:

```javascript
const results = await agent.runLoadTest('https://www.example.com', {
  iterations: 10,
  concurrency: 1
});

console.log(`Average Load Time: ${results.statistics.average}ms`);
console.log(`95th Percentile: ${results.statistics.p95}ms`);
```

### Custom NFRs

Define your own performance requirements:

```javascript
const customNFRs = {
  pageLoadTime: { max: 2000, unit: 'ms' },
  firstContentfulPaint: { max: 1500, unit: 'ms' },
  largestContentfulPaint: { max: 2000, unit: 'ms' },
  timeToInteractive: { max: 3000, unit: 'ms' },
  totalBlockingTime: { max: 200, unit: 'ms' },
  cumulativeLayoutShift: { max: 0.05, unit: 'score' },
  performanceScore: { min: 95, unit: 'score' }
};

const agent = new PerformanceAgent({ nfrs: customNFRs });
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Automated Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run test:integration
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: '*-report.*'
```

## Troubleshooting

### Browser Installation Issues

If you encounter browser installation errors:
```bash
# Install all browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

### Network Errors

If you get network errors when testing:
- Check your internet connection
- Verify the URLs are accessible
- Check if you're behind a proxy

### Memory Issues

For large test suites, increase Node.js memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run test:integration
```

## Next Steps

- Explore the example files in the `examples/` directory
- Check out the full API documentation in the README
- Customize the agents for your specific needs
- Integrate into your CI/CD pipeline

## Support

For issues and questions:
- Open an issue on GitHub
- Check the README for detailed API documentation
- Review the example files for usage patterns
