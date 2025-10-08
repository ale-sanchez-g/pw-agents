const { test, expect } = require('@playwright/test');
const APIAgent = require('../agents/api-agent');

test.describe('API Agent', () => {
  let agent;

  test.beforeEach(async () => {
    agent = new APIAgent({
      baseURL: 'https://petstore.swagger.io/v2'
    });
  });

  test.afterEach(async () => {
    await agent.close();
  });

  test('should initialize successfully', () => {
    expect(agent).toBeDefined();
    expect(agent.options).toBeDefined();
    expect(agent.options.baseURL).toBe('https://petstore.swagger.io/v2');
  });

  test('should initialize with Swagger document', async () => {
    await agent.initialize('https://petstore.swagger.io/v2/swagger.json');
    
    expect(agent.swaggerDoc).toBeDefined();
    expect(agent.apiContext).toBeDefined();
    expect(agent.swaggerDoc.paths).toBeDefined();
  });

  test('should test a GET endpoint', async () => {
    await agent.initialize('https://petstore.swagger.io/v2/swagger.json');
    
    const result = await agent.testEndpoint('/pet/findByStatus', 'GET', {
      params: { status: 'available' }
    });
    
    expect(result).toBeDefined();
    expect(result.path).toBe('/pet/findByStatus');
    expect(result.method).toBe('GET');
    expect(result.timestamp).toBeDefined();
    expect(result.response).toBeDefined();
  });

  test('should generate test data from method object', () => {
    const methodObj = {
      parameters: [
        { name: 'id', in: 'query', schema: { type: 'number' } },
        { name: 'name', in: 'query', schema: { type: 'string' } }
      ]
    };

    const testData = agent.generateTestData(methodObj);
    
    expect(testData).toBeDefined();
    expect(testData.params).toBeDefined();
    expect(testData.params.id).toBe(123);
    expect(testData.params.name).toBe('test-string');
  });

  test('should generate value for different types', () => {
    expect(agent.generateValueForType('string')).toBe('test-string');
    expect(agent.generateValueForType('number')).toBe(123);
    expect(agent.generateValueForType('integer')).toBe(123);
    expect(agent.generateValueForType('boolean')).toBe(true);
    expect(agent.generateValueForType('array')).toEqual([]);
    expect(agent.generateValueForType('object')).toEqual({});
  });

  test('should generate JSON report', async () => {
    const mockResults = {
      timestamp: new Date().toISOString(),
      totalEndpoints: 10,
      tested: 8,
      passed: 6,
      failed: 2,
      endpoints: []
    };

    const report = await agent.generateReport(mockResults, 'json');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    
    const parsed = JSON.parse(report);
    expect(parsed.totalEndpoints).toBe(10);
    expect(parsed.tested).toBe(8);
    expect(parsed.passed).toBe(6);
    expect(parsed.failed).toBe(2);
  });

  test('should generate HTML report', async () => {
    const mockResults = {
      timestamp: new Date().toISOString(),
      totalEndpoints: 10,
      tested: 8,
      passed: 6,
      failed: 2,
      endpoints: [
        {
          path: '/test',
          method: 'GET',
          success: true,
          response: { status: 200, statusText: 'OK' }
        }
      ]
    };

    const report = await agent.generateReport(mockResults, 'html');
    
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('<!DOCTYPE html>');
    expect(report).toContain('API Test Report');
    expect(report).toContain('/test');
  });
});
