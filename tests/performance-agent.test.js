const { test, expect } = require('@playwright/test');
const PerformanceAgent = require('../agents/performance-agent');

test.describe('Performance Agent', () => {
  let agent;

  test.beforeEach(async () => {
    agent = new PerformanceAgent({
      headless: true,
      nfrs: {
        pageLoadTime: { max: 5000, unit: 'ms' },
        performanceScore: { min: 70, unit: 'score' }
      }
    });
  });

  test.afterEach(async () => {
    await agent.close();
  });

  test('should initialize successfully', () => {
    expect(agent).toBeDefined();
    expect(agent.options).toBeDefined();
    expect(agent.options.headless).toBe(true);
    expect(agent.nfrs).toBeDefined();
  });

  test('should have default NFRs', () => {
    const defaultAgent = new PerformanceAgent();
    const nfrs = defaultAgent.getDefaultNFRs();
    
    expect(nfrs).toBeDefined();
    expect(nfrs.pageLoadTime).toBeDefined();
    expect(nfrs.firstContentfulPaint).toBeDefined();
    expect(nfrs.largestContentfulPaint).toBeDefined();
    expect(nfrs.performanceScore).toBeDefined();
  });

  test('should run performance test on a website', async () => {
    const result = await agent.runPerformanceTest('https://www.example.com');
    
    expect(result).toBeDefined();
    expect(result.url).toBe('https://www.example.com');
    expect(result.timestamp).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.pageLoadTime).toBeGreaterThan(0);
    expect(result.nfrValidation).toBeDefined();
    expect(typeof result.passed).toBe('boolean');
  });

  test('should validate NFRs correctly', () => {
    const metrics = {
      pageLoadTime: 2000,
      performanceScore: 85
    };

    const validation = agent.validateNFRs(metrics);
    
    expect(validation).toBeDefined();
    expect(validation.checks).toBeDefined();
    expect(validation.checks.length).toBeGreaterThan(0);
    expect(typeof validation.allPassed).toBe('boolean');
    
    const pageLoadCheck = validation.checks.find(c => c.nfr === 'pageLoadTime');
    expect(pageLoadCheck).toBeDefined();
    expect(pageLoadCheck.passed).toBe(true);
    expect(pageLoadCheck.actual).toBe(2000);
  });

  test('should calculate median correctly', () => {
    expect(agent.calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    expect(agent.calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(agent.calculateMedian([5, 1, 3, 2, 4])).toBe(3);
  });

  test('should calculate percentile correctly', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const p50 = agent.calculatePercentile(values, 50);
    expect(p50).toBeGreaterThanOrEqual(5);
    
    const p95 = agent.calculatePercentile(values, 95);
    expect(p95).toBeGreaterThanOrEqual(9);
    
    const p99 = agent.calculatePercentile(values, 99);
    expect(p99).toBeGreaterThanOrEqual(9);
  });

  test('should generate JSON report', async () => {
    const mockResult = {
      url: 'https://www.example.com',
      timestamp: new Date().toISOString(),
      metrics: {
        pageLoadTime: 2000,
        firstContentfulPaint: 1500
      },
      nfrValidation: {
        allPassed: true,
        checks: []
      },
      passed: true
    };

    const report = await agent.generateReport(mockResult, 'json');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    
    const parsed = JSON.parse(report);
    expect(parsed.url).toBe('https://www.example.com');
    expect(parsed.passed).toBe(true);
  });

  test('should generate HTML report', async () => {
    const mockResult = {
      url: 'https://www.example.com',
      timestamp: new Date().toISOString(),
      metrics: {
        pageLoadTime: 2000,
        firstContentfulPaint: 1500
      },
      scores: {
        performance: 95,
        accessibility: 90,
        bestPractices: 88,
        seo: 92
      },
      nfrValidation: {
        allPassed: true,
        checks: [
          {
            nfr: 'pageLoadTime',
            expected: { max: 5000, unit: 'ms' },
            actual: 2000,
            passed: true,
            status: 'passed'
          }
        ]
      },
      passed: true
    };

    const report = await agent.generateReport(mockResult, 'html');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('<!DOCTYPE html>');
    expect(report).toContain('Performance Test Report');
    expect(report).toContain('https://www.example.com');
  });

  test('should run load test with multiple iterations', async () => {
    const result = await agent.runLoadTest('https://www.example.com', {
      iterations: 3,
      concurrency: 1
    });
    
    expect(result).toBeDefined();
    expect(result.url).toBe('https://www.example.com');
    expect(result.iterations).toBe(3);
    expect(result.runs).toBeDefined();
    expect(result.runs.length).toBe(3);
    expect(result.statistics).toBeDefined();
    expect(result.statistics.min).toBeGreaterThan(0);
    expect(result.statistics.max).toBeGreaterThanOrEqual(result.statistics.min);
    expect(result.statistics.average).toBeGreaterThan(0);
  });
});
