# Contributing to pw-agents

Thank you for your interest in contributing to pw-agents! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate in all interactions within this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Node.js version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:
- A clear description of the feature
- The problem it solves
- Potential implementation approach
- Any examples or mockups

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run validation (`npm run validate`)
5. Run tests (`npm test`)
6. Commit your changes (`git commit -m 'Add some feature'`)
7. Push to the branch (`git push origin feature/my-feature`)
8. Open a Pull Request

## Development Setup

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

4. Validate the setup:
```bash
npm run validate
```

## Project Structure

```
pw-agents/
├── agents/                      # Agent implementations
│   ├── accessibility-agent.js   # Accessibility testing agent
│   ├── api-agent.js            # API testing agent
│   ├── performance-agent.js    # Performance testing agent
│   └── index.js                # Main export file
├── examples/                    # Example usage scripts
│   ├── data/                   # Sample data files
│   ├── accessibility-example.js
│   ├── api-example.js
│   ├── performance-example.js
│   ├── integration-example.js
│   └── validate-agents.js
├── tests/                      # Test files
│   ├── accessibility-agent.test.js
│   ├── api-agent.test.js
│   └── performance-agent.test.js
├── playwright.config.js        # Playwright configuration
├── package.json               # Project configuration
├── README.md                  # Main documentation
├── GETTING_STARTED.md        # Getting started guide
└── CONTRIBUTING.md           # This file
```

## Coding Standards

### JavaScript Style

- Use ES6+ features where appropriate
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Follow the existing code style

### Example:

```javascript
/**
 * Runs an accessibility test on the specified URL
 * @param {string} url - The URL to test
 * @param {Function} workflow - Optional workflow function
 * @returns {Promise<Object>} Test results
 */
async runAccessibilityTest(url, workflow = null) {
  // Implementation
}
```

### Agent Development Guidelines

When developing or modifying agents:

1. **Maintain Consistency**: Follow the pattern of existing agents
2. **Error Handling**: Always wrap agent operations in try-catch blocks
3. **Resource Cleanup**: Always implement a `close()` method
4. **Report Generation**: Support both JSON and HTML report formats
5. **Options**: Accept an options object in the constructor
6. **Documentation**: Add JSDoc comments for all public methods

### Required Methods for All Agents

Every agent should implement:

- `constructor(options)` - Initialize the agent
- `initialize()` - Set up resources (if needed)
- `generateReport(results, format)` - Generate reports
- `close()` - Clean up resources

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/accessibility-agent.test.js

# Run validation
npm run validate
```

### Writing Tests

When adding new features, please include tests:

```javascript
const { test, expect } = require('@playwright/test');
const YourAgent = require('../agents/your-agent');

test.describe('Your Agent', () => {
  let agent;

  test.beforeEach(async () => {
    agent = new YourAgent({ headless: true });
  });

  test.afterEach(async () => {
    await agent.close();
  });

  test('should do something', async () => {
    const result = await agent.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Adding New Agents

To add a new agent:

1. Create a new file in `agents/` directory
2. Implement the required methods
3. Export the agent class
4. Add it to `agents/index.js`
5. Create example usage in `examples/`
6. Add tests in `tests/`
7. Update README.md with documentation

### Example Agent Template

```javascript
/**
 * Your Agent Description
 */
class YourAgent {
  constructor(options = {}) {
    this.options = {
      // Default options
      ...options
    };
  }

  async initialize() {
    // Setup code
  }

  async doSomething() {
    // Implementation
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
    // HTML generation
  }

  async close() {
    // Cleanup
  }
}

module.exports = YourAgent;
```

## Documentation

When adding features or making changes:

1. Update the README.md if the API changes
2. Update GETTING_STARTED.md if the usage changes
3. Add JSDoc comments to new methods
4. Update examples if needed

## Release Process

Releases are handled by maintainers. The process includes:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag
4. Publish to npm (if applicable)

## Questions?

If you have questions:
- Open an issue for discussion
- Check existing issues and pull requests
- Review the documentation

## License

By contributing to pw-agents, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to pw-agents! 🎉
