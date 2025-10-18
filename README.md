# Playwright Agents

This repository demonstrates Playwright Agents - AI-powered tools for automated web testing. Playwright comes with three core agents out of the box: 🎭 planner, 🎭 generator, and 🎭 healer, plus a specialized **🎭 accessibility-auditor** for comprehensive WCAG 2.2 compliance testing.

## Introduction

Playwright Agents can be used independently, sequentially, or as chained calls in an agentic loop. Using them sequentially will produce comprehensive test coverage for your product:

- **🎭 planner** explores the app and produces a Markdown test plan
- **🎭 generator** transforms the Markdown plan into Playwright Test files  
- **🎭 healer** executes the test suite and automatically repairs failing tests
- **🎭 accessibility-auditor** performs comprehensive WCAG 2.2 accessibility testing using Playwright and Lighthouse MCPs

## System Requirements

- **Node.js**: 16.x or higher
- **VS Code**: v1.105+ (available in Insiders channel)
- **Dependencies**:
  - Playwright Test for VS Code extension
  - Lighthouse (v12.8+)
  - Chrome, Firefox, and Webkit browsers (installed via Playwright)

## ✅ Current Status

- **VS Code Configuration**: Complete with optimal Playwright settings (requires VS Code v1.105+)
- **Playwright Framework**: Installed and tested (9 tests passing)
- **Playwright Agents**: Initialized with `npx playwright init-agents --loop=vscode`
- **Agent Definitions**: Generated for VS Code integration

## Getting Started

Start by ensuring you have the Playwright agents initialized in your project:

```bash
npx playwright init-agents --loop=vscode
```

> **Note**: VS Code v1.105 (currently on the [VS Code Insiders channel](https://code.visualstudio.com/insiders/)) is needed for the agentic experience in VS Code.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Initialize agents** (if not already done):
   ```bash
   npx playwright init-agents --loop=vscode
   ```

Once the agents have been generated, you can use your AI tool of choice to command these agents to build Playwright Tests.

## Running Tests

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run tests in headed mode:**
  ```bash
  npm run test:headed
  ```

- **Run tests in debug mode:**
  ```bash
  npm run test:debug
  ```

- **Run tests with UI mode:**
  ```bash
  npm run test:ui
  ```

- **View test reports:**
  ```bash
  npm run report
  ```

- **Generate new tests with codegen:**
  ```bash
  npm run codegen
  ```

## VS Code Configuration

This project includes VS Code configuration for optimal Playwright development:

- **Settings**: Configured in `.vscode/settings.json` with Playwright-specific settings
- **Extensions**: Recommended extensions in `.vscode/extensions.json` including the Playwright extension
- **Debug**: Debug configurations in `.vscode/launch.json` for debugging Playwright tests
- **MCP Configuration**: Model Context Protocol setup in `.vscode/mcp.json` for agent functionality

### Setting up VS Code for Playwright Agents

1. **Install VS Code**: Ensure you're using VS Code v1.105+ (available in [VS Code Insiders channel](https://code.visualstudio.com/insiders/))

2. **Install Required Extensions**:
   - [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
   - [TypeScript and JavaScript Language Features](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

3. **Configure Settings**:
   - VS Code will automatically use the optimal settings from `.vscode/settings.json`
   - These settings configure Playwright for debugging, screenshots, traces, and more

4. **Import Launch Configurations**:
   - Launch configurations are automatically loaded from `.vscode/launch.json`
   - Use these for debugging Playwright tests directly from VS Code

## Playwright Agents

### 🎭 Planner

The planner agent explores your app and produces a test plan for one or many scenarios and user flows.

**Input:**
- A clear request to the planner (e.g., "Generate a plan for guest checkout.")
- A `seed test` that sets up the environment necessary to interact with your app
- (optional) A Product Requirement Document (PRD) for context

**Output:**
- A Markdown test plan saved as `specs/basic-operations.md`
- The plan is human-readable but precise enough for test generation

### 🎭 Generator

The generator agent uses the Markdown plan to produce executable Playwright Tests. It verifies selectors and assertions live as it performs the scenarios.

**Input:**
- Markdown plan from `specs/`

**Output:**
- A test suite under `tests/`
- Generated tests may include initial errors that can be healed automatically by the healer agent

### 🎭 Healer

When tests fail, the healer agent:
- Replays the failing steps
- Inspects the current UI to locate equivalent elements or flows
- Suggests a patch (e.g., locator update, wait adjustment, data fix)
- Re-runs the test until it passes or until guardrails stop the loop

**Input:**
- Failing test name

**Output:**
- A passing test, or a skipped test if the healer believes the functionality is broken

### 🎭 Accessibility Auditor ✨

The accessibility auditor agent performs comprehensive WCAG 2.2 compliance testing using both Playwright for detailed DOM analysis and Lighthouse for automated accessibility scoring.

**Key Features:**
- **WCAG 2.2 Compliance**: Tests latest accessibility guidelines including mobile and cognitive considerations
- **Automated + Manual Testing**: Combines Lighthouse audits with Playwright-driven manual testing
- **Comprehensive Coverage**: Keyboard navigation, screen reader simulation, color contrast, touch targets
- **Detailed Reporting**: Executive summaries, compliance matrices, and actionable remediation guides

**Requirements:**
- Lighthouse v12.8+ (included in devDependencies)
- Chrome browser (primary browser for accessibility testing)
- Node.js 16+ with npm

**Input:**
- Target URL or application to audit
- Specific features or user flows to focus on
- WCAG conformance level requirements (AA recommended)

**Output:**
- Comprehensive accessibility audit report
- WCAG 2.2 compliance matrix with pass/fail status
- Prioritized remediation recommendations with code examples
- Automated regression tests for accessibility fixes

**Usage Example:**
```
"I need a comprehensive accessibility audit of our checkout process at https://shop.example.com/checkout following WCAG 2.2 guidelines"
```

**📖 Detailed Documentation**: See [Accessibility Auditor Agent Guide](docs/accessibility-auditor-agent.md) for complete usage instructions and methodology.

### 🎭 CI Accessibility Monitor ✨ NEW

An **outer loop agent** that continuously monitors your website for accessibility compliance in CI/CD pipelines. Built following [GitHub's agentic primitives](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/), this agent detects regressions and maintains accessibility standards over time.

**Key Features:**
- **Continuous Monitoring**: Scheduled daily reviews + PR checks
- **Regression Detection**: Compare scores against baseline with configurable thresholds
- **Smart Notifications**: GitHub Issues + Slack alerts for critical issues
- **Trend Analysis**: Track accessibility improvements over time
- **PR Blocking**: Fail CI if critical regressions detected

**Quick Start:**
```bash
# Run accessibility review
npm run accessibility-review

# View reports
open reports/accessibility/index.html
```

**CI Integration:**
The agent runs automatically in GitHub Actions:
- **Scheduled**: Monthly on the 19th at 2 AM UTC
- **PR Trigger**: When source files change
- **Manual**: Via GitHub Actions UI

**📖 Complete Guide**: See [CI Accessibility Agent Documentation](docs/ci-accessibility-agent.md) for setup, configuration, and best practices.

## Artifacts and Conventions

The static agent definitions and generated files follow a simple, auditable structure:

```
repo/
├── .github/                    # agent definitions
├── specs/                      # human-readable test plans
│   └── basic-operations.md
├── tests/                      # generated Playwright tests
│   ├── seed.spec.ts           # seed test for environment
│   └── ...
└── playwright.config.ts
```

### Agent Definitions

Under the hood, agent definitions are collections of instructions and MCP tools. They are provided by Playwright and should be regenerated whenever Playwright is updated.

### Specs in `specs/`

Specs are structured plans describing scenarios in human-readable terms. They include steps, expected outcomes, and data. Specs can start from scratch or extend a seed test.

### Tests in `tests/`

Generated Playwright tests, aligned one-to-one with specs wherever feasible.

### Seed tests `seed.spec.ts`

Seed tests provide a ready-to-use `page` context to bootstrap execution. The planner will run this test to execute all the initialization necessary for your test including the global setup, project dependencies and all the necessary fixtures and hooks.

## Model Context Protocol (MCP) Configuration

This project uses Model Context Protocols (MCPs) to power the AI agents. The MCP configuration is defined in `.vscode/mcp.json` and includes:

- **Playwright Test MCP**: Enables interaction with Playwright's testing capabilities
- **Lighthouse MCP**: Provides accessibility testing capabilities

### MCP Server Setup

1. **Verify MCP Configuration**:
   - Ensure `.vscode/mcp.json` is properly configured with server definitions
   - The configuration connects the agents to Playwright and Lighthouse functionality

2. **Required MCP Servers**:
   - Playwright Test MCP Server: Enabled via `npx playwright run-test-mcp-server`
   - Lighthouse MCP Server: Enabled via `npx lighthouse-mcp`

3. **Agent Chatmodes**:
   - Agent definitions are stored in `.github/chatmodes/`
   - Each agent has its own chatmode file (e.g., `🎭 planner.chatmode.md`)
   - These define the agent's capabilities and tool interactions

## Additional Resources

- **[Playwright Test Agents Documentation](https://playwright.dev/docs/test-agents)**: Official documentation
- **[Accessibility Auditor Agent Guide](docs/accessibility-auditor-agent.md)**: Complete WCAG 2.2 testing methodology and usage
- **[VS Code Insiders](https://code.visualstudio.com/insiders/)**: Required for full agentic experience
- **[VS Code Insiders](https://code.visualstudio.com/insiders/)**: Required for full agentic experience
- **[Sample Accessibility Test](tests/accessibility-audit-sample.spec.ts)**: Example WCAG 2.2 test implementation

## Troubleshooting

- **VS Code Version**: Ensure you're using VS Code v1.105+ (available in Insiders channel)
- **Agent Initialization**: Re-run `npx playwright init-agents --loop=vscode` if agents aren't working
- **Tool References**: If you encounter issues with tool references, see the [setup documentation](docs/playwright-mcp-setup.md)
- **Browser Installation**: Run `npx playwright install` if browser automation fails
- **Lighthouse Integration**: Make sure Lighthouse is properly installed with `npm install -D lighthouse@latest`
- **Accessibility Testing**: If accessibility tests fail, check browser compatibility and ensure proper DOM access
- **Performance Issues**: For slow tests, consider running with the `--workers=1` flag to prevent resource contention
