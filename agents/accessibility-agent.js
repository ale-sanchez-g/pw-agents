const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Accessibility Testing Agent
 * Runs accessibility tests based on a website and workflows
 */
class AccessibilityAgent {
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
  }

  async initialize() {
    this.browser = await chromium.launch({ 
      headless: this.options.headless 
    });
    this.context = await this.browser.newContext({
      viewport: this.options.viewport
    });
    this.page = await this.context.newPage();
  }

  async runAccessibilityTest(url, workflow = null) {
    if (!this.page) {
      await this.initialize();
    }

    const results = {
      url,
      timestamp: new Date().toISOString(),
      violations: [],
      passes: [],
      incomplete: [],
      workflow: workflow || 'default'
    };

    try {
      // Navigate to the URL
      await this.page.goto(url, { waitUntil: 'networkidle' });

      // Run accessibility scan
      const axeResults = await new AxeBuilder({ page: this.page })
        .analyze();

      results.violations = axeResults.violations;
      results.passes = axeResults.passes;
      results.incomplete = axeResults.incomplete;

      // If workflow is provided, execute it before final scan
      if (workflow && typeof workflow === 'function') {
        await workflow(this.page);
        
        // Run accessibility scan again after workflow
        const postWorkflowResults = await new AxeBuilder({ page: this.page })
          .analyze();
        
        results.postWorkflow = {
          violations: postWorkflowResults.violations,
          passes: postWorkflowResults.passes,
          incomplete: postWorkflowResults.incomplete
        };
      }

      results.summary = {
        totalViolations: results.violations.length,
        totalPasses: results.passes.length,
        totalIncomplete: results.incomplete.length,
        critical: results.violations.filter(v => v.impact === 'critical').length,
        serious: results.violations.filter(v => v.impact === 'serious').length,
        moderate: results.violations.filter(v => v.impact === 'moderate').length,
        minor: results.violations.filter(v => v.impact === 'minor').length
      };

    } catch (error) {
      results.error = error.message;
      results.stack = error.stack;
    }

    return results;
  }

  async runMultiPageTest(urls) {
    const allResults = [];
    
    for (const url of urls) {
      const result = await this.runAccessibilityTest(url);
      allResults.push(result);
    }

    return {
      timestamp: new Date().toISOString(),
      totalPages: urls.length,
      results: allResults,
      overallSummary: this.generateOverallSummary(allResults)
    };
  }

  generateOverallSummary(results) {
    return results.reduce((summary, result) => {
      summary.totalViolations += result.summary?.totalViolations || 0;
      summary.totalPasses += result.summary?.totalPasses || 0;
      summary.critical += result.summary?.critical || 0;
      summary.serious += result.summary?.serious || 0;
      summary.moderate += result.summary?.moderate || 0;
      summary.minor += result.summary?.minor || 0;
      return summary;
    }, { totalViolations: 0, totalPasses: 0, critical: 0, serious: 0, moderate: 0, minor: 0 });
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
    const violations = results.violations || [];
    const summary = results.summary || {};
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Accessibility Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .violation { border-left: 4px solid #d32f2f; padding: 10px; margin: 10px 0; background: #ffebee; }
    .critical { border-color: #d32f2f; background: #ffebee; }
    .serious { border-color: #f57c00; background: #fff3e0; }
    .moderate { border-color: #fbc02d; background: #fffde7; }
    .minor { border-color: #388e3c; background: #e8f5e9; }
    .impact { font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <h1>Accessibility Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>URL:</strong> ${results.url}</p>
    <p><strong>Date:</strong> ${results.timestamp}</p>
    <p><strong>Total Violations:</strong> ${summary.totalViolations}</p>
    <p><strong>Critical:</strong> ${summary.critical}</p>
    <p><strong>Serious:</strong> ${summary.serious}</p>
    <p><strong>Moderate:</strong> ${summary.moderate}</p>
    <p><strong>Minor:</strong> ${summary.minor}</p>
  </div>
  <h2>Violations</h2>
  ${violations.map(v => `
    <div class="violation ${v.impact}">
      <p class="impact">${v.impact}: ${v.id}</p>
      <p><strong>Description:</strong> ${v.description}</p>
      <p><strong>Help:</strong> ${v.help}</p>
      <p><strong>Nodes affected:</strong> ${v.nodes.length}</p>
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

module.exports = AccessibilityAgent;
