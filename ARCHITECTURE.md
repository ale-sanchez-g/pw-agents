# Architecture Overview

This document provides an architectural overview of the pw-agents framework.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        pw-agents                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Accessibility │  │   API Agent    │  │  Performance │  │
│  │     Agent      │  │                │  │    Agent     │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│         │                    │                    │         │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   axe-core     │  │    Swagger     │  │  Lighthouse  │  │
│  │  Integration   │  │    Parser      │  │  Integration │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│         │                    │                    │         │
└─────────┼────────────────────┼────────────────────┼─────────┘
          │                    │                    │
          └────────────────────┴────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Playwright Core    │
                    └──────────────────────┘
```

## Agent Architecture

Each agent follows a consistent architecture pattern:

```
┌─────────────────────────────────────────────────┐
│                   Agent Class                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Constructor(options)                           │
│  ├─ Initialize configuration                    │
│  └─ Set default options                         │
│                                                  │
│  initialize()                                    │
│  ├─ Set up browser/context                      │
│  └─ Load external resources                     │
│                                                  │
│  Core Testing Methods                            │
│  ├─ runTest() / testEndpoint()                  │
│  ├─ validateResults()                           │
│  └─ collectMetrics()                            │
│                                                  │
│  Report Generation                               │
│  ├─ generateReport(format)                      │
│  ├─ generateHTMLReport()                        │
│  └─ generateJSONReport()                        │
│                                                  │
│  Resource Management                             │
│  └─ close()                                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Component Details

### 1. Accessibility Agent

**Purpose**: Automated accessibility testing using axe-core

**Key Components**:
- **Browser Management**: Manages Chromium browser instance
- **Axe Integration**: Runs axe-core accessibility scans
- **Workflow Support**: Executes user workflows before scanning
- **Report Generation**: Creates detailed violation reports

**Data Flow**:
```
URL → Navigate → Run Workflow (optional) → Scan with Axe → 
Analyze Results → Validate Violations → Generate Report
```

**Key Methods**:
- `runAccessibilityTest(url, workflow)`: Single page test
- `runMultiPageTest(urls)`: Multiple pages test
- `generateOverallSummary(results)`: Aggregate results

### 2. API Agent

**Purpose**: API testing based on Swagger/OpenAPI specifications

**Key Components**:
- **Swagger Parser**: Parses and validates OpenAPI documents
- **Request Context**: Manages API request context
- **Schema Validation**: Validates responses against schemas
- **Test Generator**: Generates test data from schemas

**Data Flow**:
```
Swagger Doc → Parse → Extract Endpoints → Generate Test Data → 
Make Request → Validate Response → Generate Report
```

**Key Methods**:
- `initialize(swaggerPath)`: Load Swagger document
- `testEndpoint(path, method, options)`: Test single endpoint
- `testAllEndpoints()`: Test all endpoints in Swagger doc
- `validateResponse(path, method, status, response)`: Validate against schema

### 3. Performance Agent

**Purpose**: Performance testing with NFR validation

**Key Components**:
- **Performance API**: Collects browser performance metrics
- **Lighthouse**: Comprehensive performance audits
- **NFR Validator**: Validates metrics against requirements
- **Statistics Calculator**: Calculates load test statistics

**Data Flow**:
```
URL → Navigate → Collect Metrics → Run Lighthouse (optional) → 
Validate NFRs → Calculate Statistics → Generate Report
```

**Key Methods**:
- `runPerformanceTest(url)`: Basic performance test
- `runLighthouseAudit(url)`: Comprehensive Lighthouse audit
- `runLoadTest(url, options)`: Load test with multiple iterations
- `validateNFRs(metrics)`: Validate against NFRs

## Report Generation System

All agents use a unified report generation system:

```
┌──────────────────────────────────────────┐
│         Report Generation                 │
├──────────────────────────────────────────┤
│                                           │
│  Input: Test Results Object              │
│     │                                     │
│     ├─→ JSON Report                      │
│     │   └─ Machine-readable              │
│     │       └─ CI/CD integration         │
│     │                                     │
│     └─→ HTML Report                      │
│         └─ Human-readable                │
│             └─ Visual presentation       │
│                                           │
└──────────────────────────────────────────┘
```

## Testing Flow

### Single Agent Test

```
1. Initialize Agent
   ├─ Set options
   └─ Create browser/context

2. Run Test
   ├─ Navigate to URL
   ├─ Execute test logic
   └─ Collect results

3. Generate Report
   ├─ Format results
   └─ Save to file

4. Cleanup
   └─ Close browser/context
```

### Integration Test (All Agents)

```
1. Run Accessibility Test
   ├─ Scan for violations
   └─ Check critical issues

2. Run API Test
   ├─ Test endpoints
   └─ Validate responses

3. Run Performance Test
   ├─ Measure metrics
   └─ Validate NFRs

4. Generate Combined Report
   ├─ Aggregate results
   └─ Overall pass/fail

5. Cleanup All Agents
```

## Configuration Management

```
┌──────────────────────────────────────────┐
│         Configuration Layers              │
├──────────────────────────────────────────┤
│                                           │
│  1. Default Configuration                │
│     └─ Built into agent                  │
│                                           │
│  2. User Options                          │
│     └─ Passed to constructor             │
│                                           │
│  3. Runtime Options                       │
│     └─ Passed to methods                 │
│                                           │
└──────────────────────────────────────────┘
```

Configuration priority: Runtime > User > Default

## Error Handling

All agents implement comprehensive error handling:

```
try {
  // Core test logic
  const result = await testOperation();
  result.success = true;
} catch (error) {
  // Capture error details
  result.error = error.message;
  result.stack = error.stack;
  result.success = false;
} finally {
  // Always cleanup
  await cleanup();
}
```

## Extension Points

The framework is designed to be extensible:

### Adding a New Agent

1. Create new agent class following the pattern
2. Implement required methods:
   - `constructor(options)`
   - `initialize()`
   - `runTest()`
   - `generateReport()`
   - `close()`
3. Add to `agents/index.js`
4. Create examples and tests

### Customizing Existing Agents

1. **Custom Options**: Pass options to constructor
2. **Custom NFRs**: Define performance requirements
3. **Custom Workflows**: Pass workflow functions
4. **Custom Reports**: Extend report generation

## Performance Considerations

- **Browser Reuse**: Agents reuse browser instances
- **Parallel Testing**: Multiple agents can run in parallel
- **Resource Cleanup**: Always close resources
- **Memory Management**: Limit concurrent operations

## Security Considerations

- **No Secrets in Code**: Configuration via environment variables
- **Secure Connections**: HTTPS by default
- **Input Validation**: Validate URLs and inputs
- **Sandbox Isolation**: Tests run in isolated contexts

## Integration with CI/CD

```
┌────────────────────────────────────────────┐
│            CI/CD Pipeline                   │
├────────────────────────────────────────────┤
│                                             │
│  1. Checkout Code                          │
│  2. Install Dependencies                   │
│  3. Run Validation                         │
│  4. Run Tests                              │
│     ├─ Accessibility Tests                │
│     ├─ API Tests                          │
│     └─ Performance Tests                  │
│  5. Generate Reports                       │
│  6. Upload Artifacts                       │
│  7. Report Results                         │
│                                             │
└────────────────────────────────────────────┘
```

## Best Practices

1. **Always Close Resources**: Call `close()` on agents
2. **Use Try-Catch**: Wrap agent calls in error handling
3. **Validate Early**: Run validation before tests
4. **Generate Reports**: Save results for analysis
5. **Monitor Performance**: Track test execution time
6. **Isolate Tests**: Each test should be independent
7. **Version Lock**: Pin dependency versions
8. **Document Changes**: Update CHANGELOG.md

## Future Enhancements

Potential areas for expansion:

- **Visual Regression Testing**: Screenshot comparison
- **Security Testing**: OWASP compliance checking
- **Mobile Testing**: Mobile device emulation
- **Load Testing**: Distributed load testing
- **Real User Monitoring**: RUM integration
- **CI/CD Plugins**: Native CI/CD integrations
- **Report Dashboard**: Web-based reporting UI

## References

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [OpenAPI Specification](https://swagger.io/specification/)
