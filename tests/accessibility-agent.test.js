const { test, expect } = require('@playwright/test');
const AccessibilityAgent = require('../agents/accessibility-agent');

test.describe('Accessibility Agent', () => {
  let agent;

  test.beforeEach(async () => {
    agent = new AccessibilityAgent({ headless: true });
  });

  test.afterEach(async () => {
    await agent.close();
  });

  test('should initialize successfully', async () => {
    expect(agent).toBeDefined();
    expect(agent.options).toBeDefined();
    expect(agent.options.headless).toBe(true);
  });

  test('should run accessibility test on a website', async ({ page }) => {
    const result = await agent.runAccessibilityTest('https://www.example.com');
    
    expect(result).toBeDefined();
    expect(result.url).toBe('https://www.example.com');
    expect(result.timestamp).toBeDefined();
    expect(result.violations).toBeDefined();
    expect(result.passes).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.summary.totalViolations).toBeGreaterThanOrEqual(0);
  });

  test('should generate overall summary for multiple results', async () => {
    const mockResults = [
      {
        summary: {
          totalViolations: 5,
          totalPasses: 10,
          critical: 1,
          serious: 2,
          moderate: 1,
          minor: 1
        }
      },
      {
        summary: {
          totalViolations: 3,
          totalPasses: 8,
          critical: 0,
          serious: 1,
          moderate: 2,
          minor: 0
        }
      }
    ];

    const summary = agent.generateOverallSummary(mockResults);
    
    expect(summary.totalViolations).toBe(8);
    expect(summary.totalPasses).toBe(18);
    expect(summary.critical).toBe(1);
    expect(summary.serious).toBe(3);
    expect(summary.moderate).toBe(3);
    expect(summary.minor).toBe(1);
  });

  test('should generate JSON report', async () => {
    const mockResult = {
      url: 'https://www.example.com',
      timestamp: new Date().toISOString(),
      violations: [],
      passes: [],
      summary: { totalViolations: 0 }
    };

    const report = await agent.generateReport(mockResult, 'json');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    
    const parsed = JSON.parse(report);
    expect(parsed.url).toBe('https://www.example.com');
  });

  test('should generate HTML report', async () => {
    const mockResult = {
      url: 'https://www.example.com',
      timestamp: new Date().toISOString(),
      violations: [
        {
          id: 'test-violation',
          impact: 'serious',
          description: 'Test violation description',
          help: 'How to fix this',
          nodes: [{ html: '<div>Test</div>' }]
        }
      ],
      summary: {
        totalViolations: 1,
        critical: 0,
        serious: 1,
        moderate: 0,
        minor: 0
      }
    };

    const report = await agent.generateReport(mockResult, 'html');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('<!DOCTYPE html>');
    expect(report).toContain('Accessibility Test Report');
    expect(report).toContain('test-violation');
  });
});
