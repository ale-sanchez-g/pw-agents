# Playwright Agents

This repository demonstrates Playwright Agents - AI-powered tools for automated web testing. Playwright comes with three agents out of the box: 🎭 planner, 🎭 generator, and 🎭 healer.

## Introduction

Playwright Agents can be used independently, sequentially, or as chained calls in an agentic loop. Using them sequentially will produce comprehensive test coverage for your product:

- **🎭 planner** explores the app and produces a Markdown test plan
- **🎭 generator** transforms the Markdown plan into Playwright Test files  
- **🎭 healer** executes the test suite and automatically repairs failing tests

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

## Additional Resources

- **[Playwright Test Agents Documentation](https://playwright.dev/docs/test-agents)**: Official documentation
- **[Playwright MCP Setup](docs/playwright-mcp-setup.md)**: Complete setup guide and troubleshooting  
- **[Chatmode Configuration](docs/chatmode-configuration.md)**: Tool mapping and configuration details
- **[VS Code Insiders](https://code.visualstudio.com/insiders/)**: Required for full agentic experience

## Troubleshooting

- **VS Code Version**: Ensure you're using VS Code v1.105+ (available in Insiders channel)
- **Agent Initialization**: Re-run `npx playwright init-agents --loop=vscode` if agents aren't working
- **Tool References**: If you encounter issues with tool references, see the [setup documentation](docs/playwright-mcp-setup.md)
- **Browser Installation**: Run `npx playwright install` if browser automation fails
