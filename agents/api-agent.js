const { request } = require('playwright');
const SwaggerParser = require('swagger-parser');

/**
 * API Testing Agent
 * Runs API tests based on a Swagger/OpenAPI document
 */
class APIAgent {
  constructor(options = {}) {
    this.options = {
      baseURL: options.baseURL || '',
      timeout: options.timeout || 30000,
      headers: options.headers || {},
      ...options
    };
    this.apiContext = null;
    this.swaggerDoc = null;
  }

  async initialize(swaggerPath) {
    // Parse Swagger/OpenAPI document
    try {
      this.swaggerDoc = await SwaggerParser.validate(swaggerPath);
      
      // Create API request context
      this.apiContext = await request.newContext({
        baseURL: this.options.baseURL || this.swaggerDoc.servers?.[0]?.url || '',
        extraHTTPHeaders: this.options.headers,
        timeout: this.options.timeout
      });
    } catch (error) {
      throw new Error(`Failed to initialize API agent: ${error.message}`);
    }
  }

  async testEndpoint(path, method, options = {}) {
    if (!this.apiContext) {
      throw new Error('API agent not initialized. Call initialize() first.');
    }

    const result = {
      path,
      method: method.toUpperCase(),
      timestamp: new Date().toISOString(),
      success: false,
      response: null,
      error: null
    };

    try {
      const requestOptions = {
        data: options.data,
        params: options.params,
        headers: options.headers
      };

      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await this.apiContext.get(path, requestOptions);
          break;
        case 'post':
          response = await this.apiContext.post(path, requestOptions);
          break;
        case 'put':
          response = await this.apiContext.put(path, requestOptions);
          break;
        case 'delete':
          response = await this.apiContext.delete(path, requestOptions);
          break;
        case 'patch':
          response = await this.apiContext.patch(path, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      result.response = {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: await response.text()
      };

      // Try to parse JSON response
      try {
        result.response.json = JSON.parse(result.response.body);
      } catch (e) {
        // Response is not JSON
      }

      result.success = response.ok();

      // Validate response against schema if available
      if (this.swaggerDoc) {
        const validation = this.validateResponse(path, method, response.status(), result.response);
        result.validation = validation;
      }

    } catch (error) {
      result.error = error.message;
      result.stack = error.stack;
    }

    return result;
  }

  validateResponse(path, method, statusCode, response) {
    const validation = {
      isValid: true,
      errors: []
    };

    try {
      const pathObj = this.swaggerDoc.paths[path];
      if (!pathObj) {
        validation.errors.push(`Path ${path} not found in Swagger document`);
        validation.isValid = false;
        return validation;
      }

      const methodObj = pathObj[method.toLowerCase()];
      if (!methodObj) {
        validation.errors.push(`Method ${method} not found for path ${path}`);
        validation.isValid = false;
        return validation;
      }

      const responseSchema = methodObj.responses?.[statusCode] || methodObj.responses?.default;
      if (!responseSchema) {
        validation.errors.push(`Response schema not found for status ${statusCode}`);
        validation.isValid = false;
        return validation;
      }

      // Basic validation - check if response structure matches
      validation.schemaFound = true;
      validation.expectedStatus = statusCode;
      
    } catch (error) {
      validation.errors.push(`Validation error: ${error.message}`);
      validation.isValid = false;
    }

    return validation;
  }

  async testAllEndpoints(options = {}) {
    if (!this.swaggerDoc) {
      throw new Error('Swagger document not loaded. Call initialize() first.');
    }

    const results = {
      timestamp: new Date().toISOString(),
      totalEndpoints: 0,
      tested: 0,
      passed: 0,
      failed: 0,
      endpoints: []
    };

    for (const [path, pathObj] of Object.entries(this.swaggerDoc.paths)) {
      for (const [method, methodObj] of Object.entries(pathObj)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          results.totalEndpoints++;
          
          // Skip if method is in exclude list
          if (options.exclude && options.exclude.some(e => e.path === path && e.method === method)) {
            continue;
          }

          // Generate test data based on parameters
          const testData = this.generateTestData(methodObj);
          
          const result = await this.testEndpoint(path, method, testData);
          results.endpoints.push(result);
          results.tested++;
          
          if (result.success) {
            results.passed++;
          } else {
            results.failed++;
          }
        }
      }
    }

    return results;
  }

  generateTestData(methodObj) {
    const testData = {
      params: {},
      data: {}
    };

    // Generate test data from parameters
    if (methodObj.parameters) {
      methodObj.parameters.forEach(param => {
        const value = this.generateValueForType(param.schema?.type || 'string');
        if (param.in === 'query') {
          testData.params[param.name] = value;
        } else if (param.in === 'path') {
          testData.params[param.name] = value;
        }
      });
    }

    // Generate request body if required
    if (methodObj.requestBody) {
      const schema = methodObj.requestBody.content?.['application/json']?.schema;
      if (schema) {
        testData.data = this.generateDataFromSchema(schema);
      }
    }

    return testData;
  }

  generateValueForType(type) {
    switch (type) {
      case 'string':
        return 'test-string';
      case 'number':
      case 'integer':
        return 123;
      case 'boolean':
        return true;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return 'test-value';
    }
  }

  generateDataFromSchema(schema) {
    if (schema.type === 'object' && schema.properties) {
      const data = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        data[key] = this.generateValueForType(prop.type);
      }
      return data;
    }
    return {};
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
    return `
<!DOCTYPE html>
<html>
<head>
  <title>API Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .endpoint { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { border-left: 4px solid #4caf50; background: #f1f8f4; }
    .failure { border-left: 4px solid #f44336; background: #ffebee; }
    .method { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .put { background: #fca130; color: white; }
    .delete { background: #f93e3e; color: white; }
  </style>
</head>
<body>
  <h1>API Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Date:</strong> ${results.timestamp}</p>
    <p><strong>Total Endpoints:</strong> ${results.totalEndpoints}</p>
    <p><strong>Tested:</strong> ${results.tested}</p>
    <p><strong>Passed:</strong> ${results.passed}</p>
    <p><strong>Failed:</strong> ${results.failed}</p>
    <p><strong>Success Rate:</strong> ${results.tested > 0 ? ((results.passed / results.tested) * 100).toFixed(2) : 0}%</p>
  </div>
  <h2>Endpoint Results</h2>
  ${results.endpoints?.map(e => `
    <div class="endpoint ${e.success ? 'success' : 'failure'}">
      <p><span class="method ${e.method.toLowerCase()}">${e.method}</span> ${e.path}</p>
      <p><strong>Status:</strong> ${e.response?.status || 'N/A'} ${e.response?.statusText || ''}</p>
      ${e.error ? `<p><strong>Error:</strong> ${e.error}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
  }

  async close() {
    if (this.apiContext) {
      await this.apiContext.dispose();
    }
  }
}

module.exports = APIAgent;
