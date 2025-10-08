# pw-agents

This repository showcases multiple AI agents using Playwright for automated testing.

## Overview

pw-agents provides three powerful testing agents built on Playwright:

1. **Accessibility Agent** - Runs accessibility tests based on a website and workflows using axe-core
2. **API Agent** - Runs API tests based on Swagger/OpenAPI documents
3. **Performance Agent** - Runs performance tests based on a set of NFRs (Non-Functional Requirements)

## Features

### Accessibility Testing Agent
- Automated accessibility scanning using axe-core
- Support for workflow-based testing
- Multi-page accessibility testing
- Detailed violation reports with severity levels (critical, serious, moderate, minor)
- JSON and HTML report generation

### API Testing Agent
- Swagger/OpenAPI document parsing and validation
- Automated endpoint testing
- Request/response validation against schemas
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Batch testing of all endpoints
- JSON and HTML report generation

### Performance Testing Agent
- Page load time measurement
- Web Vitals collection (FCP, LCP, TTI, TBT, CLS)
- Lighthouse integration for comprehensive audits
- NFR (Non-Functional Requirements) validation
- Load testing with multiple iterations
- Resource timing analysis
- JSON and HTML report generation

## Installation

```bash
npm install
npx playwright install chromium
```

**New to pw-agents?** Check out the [Getting Started Guide](GETTING_STARTED.md) for a step-by-step tutorial.

## Usage

### Quick Start

```javascript
const { AccessibilityAgent, APIAgent, PerformanceAgent } = require('./agents');

// Accessibility Testing
const accessibilityAgent = new AccessibilityAgent();
const accessibilityResults = await accessibilityAgent.runAccessibilityTest('https://www.example.com');

// API Testing
const apiAgent = new APIAgent({ baseURL: 'https://api.example.com' });
await apiAgent.initialize('https://api.example.com/swagger.json');
const apiResults = await apiAgent.testAllEndpoints();

// Performance Testing
const performanceAgent = new PerformanceAgent({
  nfrs: {
    pageLoadTime: { max: 3000, unit: 'ms' },
    performanceScore: { min: 90, unit: 'score' }
  }
});
const performanceResults = await performanceAgent.runPerformanceTest('https://www.example.com');
```

### Accessibility Agent Example

```javascript
const AccessibilityAgent = require('./agents/accessibility-agent');

const agent = new AccessibilityAgent({ headless: true });

// Simple accessibility scan
const results = await agent.runAccessibilityTest('https://www.example.com');
console.log(`Total Violations: ${results.summary.totalViolations}`);
console.log(`Critical: ${results.summary.critical}`);

// With workflow
const workflowResults = await agent.runAccessibilityTest(
  'https://www.example.com',
  async (page) => {
    await page.click('#menu-button');
    await page.fill('#search', 'test');
  }
);

// Multi-page test
const multiPageResults = await agent.runMultiPageTest([
  'https://www.example.com',
  'https://www.example.com/about',
  'https://www.example.com/contact'
]);

// Generate reports
const jsonReport = await agent.generateReport(results, 'json');
const htmlReport = await agent.generateReport(results, 'html');

await agent.close();
```

### API Agent Example

```javascript
const APIAgent = require('./agents/api-agent');

const agent = new APIAgent({
  baseURL: 'https://petstore.swagger.io/v2',
  timeout: 30000
});

// Initialize with Swagger document
await agent.initialize('https://petstore.swagger.io/v2/swagger.json');

// Test single endpoint
const result = await agent.testEndpoint('/pet/findByStatus', 'GET', {
  params: { status: 'available' }
});

// Test POST endpoint
const postResult = await agent.testEndpoint('/pet', 'POST', {
  data: {
    id: 12345,
    name: 'Test Pet',
    status: 'available'
  }
});

// Test all endpoints
const allResults = await agent.testAllEndpoints();
console.log(`Success Rate: ${(allResults.passed / allResults.tested * 100).toFixed(2)}%`);

// Generate reports
const report = await agent.generateReport(allResults, 'html');

await agent.close();
```

### Performance Agent Example

```javascript
const PerformanceAgent = require('./agents/performance-agent');

// Define NFRs
const customNFRs = {
  pageLoadTime: { max: 3000, unit: 'ms' },
  firstContentfulPaint: { max: 1800, unit: 'ms' },
  largestContentfulPaint: { max: 2500, unit: 'ms' },
  performanceScore: { min: 90, unit: 'score' }
};

const agent = new PerformanceAgent({
  headless: true,
  nfrs: customNFRs
});

// Basic performance test
const results = await agent.runPerformanceTest('https://www.example.com');
console.log(`Page Load Time: ${results.metrics.pageLoadTime}ms`);
console.log(`NFR Validation Passed: ${results.passed}`);

// Lighthouse audit
const lighthouseResults = await agent.runLighthouseAudit('https://www.example.com');
console.log(`Performance Score: ${lighthouseResults.scores.performance}`);

// Load test
const loadTestResults = await agent.runLoadTest('https://www.example.com', {
  iterations: 10,
  concurrency: 1
});
console.log(`Average Load Time: ${loadTestResults.statistics.average}ms`);
console.log(`95th Percentile: ${loadTestResults.statistics.p95}ms`);

// Generate reports
const report = await agent.generateReport(results, 'html');

await agent.close();
```

## Running Examples

Run the example scripts to see the agents in action:

```bash
# Run accessibility example
npm run test:accessibility

# Run API example
npm run test:api

# Run performance example
npm run test:performance

# Run all examples
npm run test:examples
```

## Configuration

### Accessibility Agent Options

```javascript
{
  browser: 'chromium',        // Browser to use
  headless: true,             // Run in headless mode
  viewport: { width: 1280, height: 720 }  // Viewport size
}
```

### API Agent Options

```javascript
{
  baseURL: '',               // Base URL for API requests
  timeout: 30000,            // Request timeout in ms
  headers: {}                // Custom headers
}
```

### Performance Agent Options

```javascript
{
  browser: 'chromium',       // Browser to use
  headless: true,            // Run in headless mode
  viewport: { width: 1280, height: 720 },  // Viewport size
  nfrs: {                    // Custom NFRs
    pageLoadTime: { max: 3000, unit: 'ms' },
    performanceScore: { min: 90, unit: 'score' }
  }
}
```

## Reports

All agents support generating reports in multiple formats:

- **JSON**: Machine-readable format for CI/CD integration
- **HTML**: Human-readable format with visualizations

Reports include:
- Summary statistics
- Detailed test results
- NFR validation results (for performance testing)
- Timestamps and metadata

## Architecture

```
pw-agents/
├── agents/
│   ├── accessibility-agent.js   # Accessibility testing agent
│   ├── api-agent.js            # API testing agent
│   ├── performance-agent.js    # Performance testing agent
│   └── index.js                # Main export file
├── examples/
│   ├── accessibility-example.js
│   ├── api-example.js
│   └── performance-example.js
├── tests/                      # Test files (optional)
├── playwright.config.js        # Playwright configuration
└── package.json
```

## Dependencies

- **@playwright/test**: Core Playwright testing framework
- **@axe-core/playwright**: Accessibility testing with axe-core
- **swagger-parser**: Swagger/OpenAPI document parsing
- **lighthouse**: Performance auditing

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
