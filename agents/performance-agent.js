const { chromium } = require('playwright');
const lighthouse = require('lighthouse');

/**
 * Performance Testing Agent
 * Runs performance tests based on a set of NFRs (Non-Functional Requirements)
 */
class PerformanceAgent {
  constructor(options = {}) {
    this.options = {
      browser: options.browser || 'chromium',
      headless: options.headless !== false,
      viewport: options.viewport || { width: 1280, height: 720 },
      ...options
    };
    this.browser = null;
    this.context = null;
    this.page = null;
    this.nfrs = options.nfrs || this.getDefaultNFRs();
  }

  getDefaultNFRs() {
    return {
      pageLoadTime: { max: 3000, unit: 'ms' },
      firstContentfulPaint: { max: 1800, unit: 'ms' },
      largestContentfulPaint: { max: 2500, unit: 'ms' },
      timeToInteractive: { max: 3500, unit: 'ms' },
      totalBlockingTime: { max: 300, unit: 'ms' },
      cumulativeLayoutShift: { max: 0.1, unit: 'score' },
      performanceScore: { min: 90, unit: 'score' },
      accessibilityScore: { min: 90, unit: 'score' },
      bestPracticesScore: { min: 90, unit: 'score' },
      seoScore: { min: 90, unit: 'score' }
    };
  }

  async initialize() {
    this.browser = await chromium.launch({ 
      headless: this.options.headless,
      args: ['--remote-debugging-port=9222']
    });
    this.context = await this.browser.newContext({
      viewport: this.options.viewport
    });
    this.page = await this.context.newPage();
  }

  async runPerformanceTest(url) {
    if (!this.page) {
      await this.initialize();
    }

    const results = {
      url,
      timestamp: new Date().toISOString(),
      metrics: {},
      nfrValidation: {},
      passed: false
    };

    try {
      // Start performance measurement
      const startTime = Date.now();
      
      // Navigate and collect performance metrics
      await this.page.goto(url, { waitUntil: 'networkidle' });
      
      const endTime = Date.now();
      results.metrics.pageLoadTime = endTime - startTime;

      // Get Web Vitals and other performance metrics
      const performanceMetrics = await this.page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const paintMetrics = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
          domComplete: perfData?.domComplete - perfData?.fetchStart,
          loadComplete: perfData?.loadEventEnd - perfData?.fetchStart,
          firstPaint: paintMetrics.find(m => m.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintMetrics.find(m => m.name === 'first-contentful-paint')?.startTime || 0,
          transferSize: perfData?.transferSize || 0,
          encodedBodySize: perfData?.encodedBodySize || 0,
          decodedBodySize: perfData?.decodedBodySize || 0
        };
      });

      results.metrics = { ...results.metrics, ...performanceMetrics };

      // Get resource timing
      const resourceMetrics = await this.page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return {
          totalResources: resources.length,
          totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          scripts: resources.filter(r => r.initiatorType === 'script').length,
          stylesheets: resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css').length,
          images: resources.filter(r => r.initiatorType === 'img').length,
          fonts: resources.filter(r => r.name.includes('.woff') || r.name.includes('.ttf')).length
        };
      });

      results.resources = resourceMetrics;

      // Validate against NFRs
      results.nfrValidation = this.validateNFRs(results.metrics);
      results.passed = results.nfrValidation.allPassed;

    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }

    return results;
  }

  async runLighthouseAudit(url) {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      scores: {},
      metrics: {},
      audits: {},
      nfrValidation: {},
      passed: false
    };

    try {
      // Run Lighthouse audit
      const lighthouseResults = await lighthouse(url, {
        port: 9222,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop'
      });

      if (lighthouseResults?.lhr) {
        const lhr = lighthouseResults.lhr;
        
        // Extract scores
        results.scores = {
          performance: lhr.categories.performance?.score * 100 || 0,
          accessibility: lhr.categories.accessibility?.score * 100 || 0,
          bestPractices: lhr.categories['best-practices']?.score * 100 || 0,
          seo: lhr.categories.seo?.score * 100 || 0
        };

        // Extract key metrics
        results.metrics = {
          firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
          largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
          timeToInteractive: lhr.audits['interactive']?.numericValue || 0,
          totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
          cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: lhr.audits['speed-index']?.numericValue || 0
        };

        // Extract important audits
        results.audits = {
          opportunities: Object.entries(lhr.audits)
            .filter(([key, audit]) => audit.details?.type === 'opportunity')
            .map(([key, audit]) => ({
              id: key,
              title: audit.title,
              score: audit.score,
              description: audit.description,
              savings: audit.details?.overallSavingsMs
            })),
          diagnostics: Object.entries(lhr.audits)
            .filter(([key, audit]) => audit.details?.type === 'debugdata' || audit.details?.type === 'table')
            .slice(0, 10)
            .map(([key, audit]) => ({
              id: key,
              title: audit.title,
              score: audit.score,
              description: audit.description
            }))
        };

        // Validate against NFRs
        const metricsForValidation = { ...results.metrics, ...results.scores };
        results.nfrValidation = this.validateNFRs(metricsForValidation);
        results.passed = results.nfrValidation.allPassed;
      }

    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }

    return results;
  }

  validateNFRs(metrics) {
    const validation = {
      allPassed: true,
      checks: []
    };

    for (const [nfrKey, nfrValue] of Object.entries(this.nfrs)) {
      const metricValue = metrics[nfrKey];
      
      if (metricValue === undefined) {
        validation.checks.push({
          nfr: nfrKey,
          status: 'skipped',
          reason: 'Metric not available'
        });
        continue;
      }

      let passed = false;
      if (nfrValue.max !== undefined) {
        passed = metricValue <= nfrValue.max;
      } else if (nfrValue.min !== undefined) {
        passed = metricValue >= nfrValue.min;
      }

      validation.checks.push({
        nfr: nfrKey,
        expected: nfrValue,
        actual: metricValue,
        passed,
        status: passed ? 'passed' : 'failed'
      });

      if (!passed) {
        validation.allPassed = false;
      }
    }

    return validation;
  }

  async runLoadTest(url, options = {}) {
    const iterations = options.iterations || 5;
    const concurrency = options.concurrency || 1;
    
    const results = {
      url,
      timestamp: new Date().toISOString(),
      iterations,
      concurrency,
      runs: [],
      statistics: {}
    };

    const runTest = async () => {
      const startTime = Date.now();
      await this.page.goto(url, { waitUntil: 'networkidle' });
      const endTime = Date.now();
      return endTime - startTime;
    };

    try {
      if (!this.page) {
        await this.initialize();
      }

      // Run tests
      for (let i = 0; i < iterations; i++) {
        const loadTime = await runTest();
        results.runs.push({
          iteration: i + 1,
          loadTime,
          timestamp: new Date().toISOString()
        });
      }

      // Calculate statistics
      const loadTimes = results.runs.map(r => r.loadTime);
      results.statistics = {
        min: Math.min(...loadTimes),
        max: Math.max(...loadTimes),
        average: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
        median: this.calculateMedian(loadTimes),
        p95: this.calculatePercentile(loadTimes, 95),
        p99: this.calculatePercentile(loadTimes, 99)
      };

    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }

    return results;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  async generateReport(results, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else if (format === 'html') {
      return this.generateHTMLReport(results);
    }
    return results;
  }

  generateHTMLReport(results) {
    const nfrChecks = results.nfrValidation?.checks || [];
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: white; }
    .metric-value { font-size: 24px; font-weight: bold; color: #2196f3; }
    .nfr-check { border-left: 4px solid #ddd; padding: 10px; margin: 10px 0; }
    .passed { border-color: #4caf50; background: #f1f8f4; }
    .failed { border-color: #f44336; background: #ffebee; }
    .skipped { border-color: #9e9e9e; background: #fafafa; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Performance Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${results.url}</p>
    <p><strong>Date:</strong> ${results.timestamp}</p>
    <p><strong>Overall Status:</strong> ${results.passed ? '✅ PASSED' : '❌ FAILED'}</p>
  </div>
  
  ${results.scores ? `
  <h2>Lighthouse Scores</h2>
  <div class="metrics">
    <div class="metric-card">
      <div>Performance</div>
      <div class="metric-value">${results.scores.performance?.toFixed(0) || 0}</div>
    </div>
    <div class="metric-card">
      <div>Accessibility</div>
      <div class="metric-value">${results.scores.accessibility?.toFixed(0) || 0}</div>
    </div>
    <div class="metric-card">
      <div>Best Practices</div>
      <div class="metric-value">${results.scores.bestPractices?.toFixed(0) || 0}</div>
    </div>
    <div class="metric-card">
      <div>SEO</div>
      <div class="metric-value">${results.scores.seo?.toFixed(0) || 0}</div>
    </div>
  </div>
  ` : ''}
  
  <h2>Performance Metrics</h2>
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    ${Object.entries(results.metrics || {}).map(([key, value]) => `
      <tr>
        <td>${key}</td>
        <td>${typeof value === 'number' ? value.toFixed(2) : value}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>NFR Validation</h2>
  ${nfrChecks.map(check => `
    <div class="nfr-check ${check.status}">
      <p><strong>${check.nfr}</strong>: ${check.status.toUpperCase()}</p>
      ${check.expected ? `<p>Expected: ${JSON.stringify(check.expected)}</p>` : ''}
      ${check.actual !== undefined ? `<p>Actual: ${check.actual}</p>` : ''}
      ${check.reason ? `<p>Reason: ${check.reason}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

module.exports = PerformanceAgent;
