const APIAgent = require('../agents/api-agent');
const fs = require('fs').promises;

/**
 * Example: Running API tests based on a Swagger document
 */
async function runAPIExample() {
  const agent = new APIAgent({
    baseURL: 'https://petstore.swagger.io/v2',
    timeout: 30000
  });

  console.log('Running API tests...\n');

  try {
    // Initialize with Swagger document URL
    console.log('Initializing with Swagger document...');
    await agent.initialize('https://petstore.swagger.io/v2/swagger.json');
    console.log('  Swagger document loaded successfully\n');

    // Test 1: Test a single endpoint
    console.log('Test 1: Testing single endpoint (GET /pet/findByStatus)');
    const result1 = await agent.testEndpoint('/pet/findByStatus', 'GET', {
      params: { status: 'available' }
    });
    console.log(`  Method: ${result1.method}`);
    console.log(`  Path: ${result1.path}`);
    console.log(`  Status: ${result1.response?.status}`);
    console.log(`  Success: ${result1.success}`);
    console.log('');

    // Test 2: Test POST endpoint
    console.log('Test 2: Testing POST endpoint');
    const result2 = await agent.testEndpoint('/pet', 'POST', {
      data: {
        id: 12345,
        name: 'Test Pet',
        status: 'available',
        category: { id: 1, name: 'Dogs' },
        photoUrls: ['http://example.com/photo.jpg']
      }
    });
    console.log(`  Method: ${result2.method}`);
    console.log(`  Path: ${result2.path}`);
    console.log(`  Status: ${result2.response?.status}`);
    console.log(`  Success: ${result2.success}`);
    console.log('');

    // Test 3: Test all endpoints (limited)
    console.log('Test 3: Testing multiple endpoints');
    const allResults = await agent.testAllEndpoints({
      exclude: [
        { path: '/pet/{petId}/uploadImage', method: 'post' },
        { path: '/user/createWithList', method: 'post' }
      ]
    });
    console.log(`  Total Endpoints: ${allResults.totalEndpoints}`);
    console.log(`  Tested: ${allResults.tested}`);
    console.log(`  Passed: ${allResults.passed}`);
    console.log(`  Failed: ${allResults.failed}`);
    console.log(`  Success Rate: ${allResults.tested > 0 ? ((allResults.passed / allResults.tested) * 100).toFixed(2) : 0}%`);
    console.log('');

    // Generate reports
    console.log('Generating reports...');
    const jsonReport = await agent.generateReport(allResults, 'json');
    await fs.writeFile('api-report.json', jsonReport);
    console.log('  JSON report saved: api-report.json');

    const htmlReport = await agent.generateReport(allResults, 'html');
    await fs.writeFile('api-report.html', htmlReport);
    console.log('  HTML report saved: api-report.html');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await agent.close();
    console.log('\nAPI tests completed!');
  }
}

// Run the example if executed directly
if (require.main === module) {
  runAPIExample();
}

module.exports = runAPIExample;
