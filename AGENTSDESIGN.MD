#### filepath: docs/agents-architecture.md
# Playwright Agents - High-Level Architecture

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Senior Architecture Team  

---

## Executive Summary

The Playwright Agents system is a distributed AI-powered testing framework that combines Large Language Models (LLMs), Model Context Protocol (MCP) servers, and browser automation to provide intelligent, autonomous test planning, generation, debugging, and accessibility auditing capabilities.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      VS Code IDE Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Copilot    │  │    Editor    │  │   Debugger   │           │
│  │  Chat Panel  │  │   Interface  │  │   Console    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────-───────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Agent Orchestration Layer                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          GitHub Copilot + LLM Integration                │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐      │   │
│  │  │  GPT-4 │  │ Claude │  │ Gemini │  │   Other    │      │   │
│  │  │  Model │  │ Model  │  │ Model  │  │  LLMs      │      │   │
│  │  └────────┘  └────────┘  └────────┘  └────────────┘      │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Agent Chatmode Definitions                  │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────────────┐      │   │
│  │  │ 🎭   │  │ 🎭   │  │ 🎭   │  │ 🎭 Accessibility │      │   │
│  │  │Plnr  │  │ Gen  │  │Healr │  │    Auditor       │      │   │
│  │  └──┬───┘  └──┬───┘  └──┬───┘  └────────┬─────────┘      │   │
│  └─────┼─────────┼─────────┼───────────────┼────────────────┘   │
└────────┼─────────┼─────────┼───────────────┼────────────────────┘
         │         │         │               │
         ▼         ▼         ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MCP Protocol Layer                            │
│  ┌────────────────────────────┐  ┌────────────────────────┐     │
│  │   Playwright MCP Server    │  │  Lighthouse MCP Server │     │
│  │  ┌──────────────────────┐  │  │  ┌──────────────────┐  │     │
│  │  │ Test Execution Tools │  │  │  │ Audit Tools      │  │     │
│  │  │ - browser_navigate   │  │  │  │ - run_audit      │  │     │
│  │  │ - browser_click      │  │  │  │ - get_perf_score │  │     │
│  │  │ - browser_snapshot   │  │  │  │ - accessibility  │  │     │
│  │  │ - test_run           │  │  │  │   scoring        │  │     │
│  │  │ - test_debug         │  │  │  └──────────────────┘  │     │
│  │  └──────────────────────┘  │  └────────────────────────┘     │
│  └────────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Automation Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │ Chromium │  │ Firefox  │  │  WebKit  │  │  Lighthouse  │     │
│  │  Engine  │  │  Engine  │  │  Engine  │  │   Engine     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Target Application Layer                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Web Applications Under Test                      │   │
│  │  (E-commerce, Dashboards, Forms, SPAs, etc.)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. VS Code IDE Layer

**Purpose:** Provides the integrated development environment and user interface for agent interaction.

**Key Components:**
- **Copilot Chat Panel:** Primary interface for agent commands and responses
- **Editor Interface:** Code editing and review capabilities
- **Debugger Console:** Real-time test execution monitoring

**Integration Points:**
- `.vscode/mcp.json` - MCP server configuration
- `.vscode/settings.json` - Playwright-specific IDE settings
- `.vscode/launch.json` - Debug configurations

---

### 2. AI Agent Orchestration Layer

**Purpose:** Coordinates LLM reasoning, agent behavior, and tool execution.

#### 2.1 GitHub Copilot + LLM Integration

**Architecture:**
```typescript
interface LLMProvider {
  model: 'GPT-4' | 'Claude' | 'Gemini' | string;
  capabilities: {
    reasoning: boolean;
    codeGeneration: boolean;
    contextWindow: number;
  };
  invoke(prompt: string, tools: Tool[]): Promise<Response>;
}
```

**Supported LLMs:**
- **GPT-4:** Primary reasoning and code generation
- **Claude:** Advanced reasoning and long-context understanding
- **Gemini:** Multimodal capabilities (future)
- **Extensible:** Can integrate additional LLM providers

#### 2.2 Agent Chatmode Definitions

Located in [`.github/chatmodes/`](.github/chatmodes/), each agent has a structured definition:

```markdown
---
description: Agent purpose and capabilities
tools: [list of MCP tools the agent can use]
---

Agent instructions, workflow, and behavior patterns
```

**Agent Registry:**

| Agent | Purpose | Primary Tools |
|-------|---------|---------------|
| [`🎭 Planner`](.github/chatmodes/🎭%20planner.chatmode.md) | Test plan generation | `browser_*`, `planner_setup_page` |
| [`🎭 Generator`](.github/chatmodes/🎭%20generator.chatmode.md) | Test code generation | `generator_*`, `browser_verify_*` |
| [`🎭 Healer`](.github/chatmodes/🎭%20healer.chatmode.md) | Test debugging/repair | `test_debug`, `test_run`, `edit_*` |
| [`🎭 Accessibility Auditor`](.github/chatmodes/🎭%20accessibility-auditor.chatmode.md) | WCAG 2.2 compliance | `lighthouse/*`, `browser_*`, `generator_*` |

---

### 3. MCP Protocol Layer

**Purpose:** Provides standardized communication between AI agents and testing tools.

#### 3.1 Playwright MCP Server

**Configuration:** [`.vscode/mcp.json`](.vscode/mcp.json)

```json
{
  "servers": {
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

**Tool Categories:**

| Category | Tools | Purpose |
|----------|-------|---------|
| **Navigation** | `browser_navigate`, `browser_navigate_back` | Page navigation |
| **Interaction** | `browser_click`, `browser_type`, `browser_hover` | User actions |
| **Verification** | `browser_verify_*`, `browser_snapshot` | State validation |
| **Test Execution** | `test_run`, `test_debug`, `test_list` | Test lifecycle |
| **Code Generation** | `generator_setup_page`, `generator_write_test` | Test creation |

#### 3.2 Lighthouse MCP Server

**Configuration:** [`.vscode/mcp.json`](.vscode/mcp.json)

```json
{
  "servers": {
    "lighthouse": {
      "command": "npx",
      "args": ["lighthouse-mcp"]
    }
  }
}
```

**Tool Categories:**

| Tool | Purpose | Returns |
|------|---------|---------|
| `run_audit` | Execute Lighthouse audit | Full audit results with categories |
| `get_performance_score` | Performance metrics | Score + core web vitals |
| Accessibility scoring | WCAG compliance | Issues + recommendations |

---

### 4. Browser Automation Layer

**Purpose:** Executes browser interactions and audits via standardized engines.

**Components:**
- **Chromium Engine:** Primary browser for testing (Chrome/Edge)
- **Firefox Engine:** Cross-browser validation
- **WebKit Engine:** Safari compatibility testing
- **Lighthouse Engine:** Performance and accessibility auditing

**Configuration:** [`playwright.config.ts`](playwright.config.ts)

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## Agent Workflows

### 🎭 Planner Agent Architecture

```
User Request → Planner Agent
    ↓
1. Setup: planner_setup_page (from seed test)
    ↓
2. Exploration:
   - browser_navigate (explore pages)
   - browser_snapshot (capture structure)
   - browser_click (interact with elements)
    ↓
3. Planning:
   - Analyze user flows
   - Identify test scenarios
   - Map edge cases
    ↓
4. Output: Markdown test plan (specs/*.md)
```

**Key Features:**
- Autonomous web exploration
- Dynamic element discovery
- Scenario-based test planning
- Human-readable output

**Supporting Documentation:** [Planner Chatmode](.github/chatmodes/🎭%20planner.chatmode.md)

---

### 🎭 Generator Agent Architecture

```
Test Plan (MD) → Generator Agent
    ↓
1. Setup: generator_setup_page
    ↓
2. Step-by-Step Execution:
   - browser_navigate (follow plan)
   - browser_click, browser_type (interactions)
   - browser_verify_* (assertions)
    ↓
3. Logging: generator_read_log
    ↓
4. Code Generation: generator_write_test
    ↓
5. Output: TypeScript test files (tests/*.spec.ts)
```

**Key Features:**
- Real-time selector validation
- Live assertion verification
- Automatic wait handling
- Seed test integration

**Supporting Documentation:** [Generator Chatmode](.github/chatmodes/🎭%20generator.chatmode.md)

---

### 🎭 Healer Agent Architecture

```
Failing Test → Healer Agent
    ↓
1. Execution: test_run (identify failures)
    ↓
2. Debug: test_debug (pause on error)
    ↓
3. Investigation:
   - browser_snapshot (inspect DOM)
   - browser_console_messages (check logs)
   - browser_network_requests (API issues)
    ↓
4. Root Cause Analysis:
   - Selector changes
   - Timing issues
   - Data dependencies
    ↓
5. Fix: edit_files (update test code)
    ↓
6. Verification: test_run (re-run)
    ↓
7. Output: Fixed test or test.fixme() with explanation
```

**Key Features:**
- Automated failure diagnosis
- Intelligent selector repair
- Retry logic optimization
- Graceful degradation

**Supporting Documentation:** [Healer Chatmode](.github/chatmodes/🎭%20healer.chatmode.md)

---

### 🎭 Accessibility Auditor Agent Architecture

```
Target URL → Accessibility Auditor
    ↓
1. Setup: generator_setup_page
    ↓
2. Automated Analysis:
   - lighthouse/run_audit (WCAG baseline)
   - lighthouse/get_performance_score (metrics)
    ↓
3. Manual Testing (Playwright):
   - Keyboard navigation (Tab, Enter, Esc)
   - Focus indicators (browser_evaluate)
   - Screen reader simulation (ARIA validation)
   - Form accessibility (error handling)
    ↓
4. WCAG 2.2 Validation:
   - 2.4.11: Focus Not Obscured
   - 2.5.8: Target Size (24x24px)
   - 3.2.6: Consistent Help
   - 3.3.7: Redundant Entry
   - 3.3.8: Accessible Authentication
    ↓
5. Reporting:
   - Executive summary
   - Critical issues (blockers)
   - WCAG compliance matrix
   - Code examples
   - Remediation roadmap
    ↓
6. Test Generation: generator_write_test
    ↓
7. Output:
   - Audit report (docs/*.md)
   - Test suite (tests/*.spec.ts)
```

**Key Features:**
- Lighthouse + Playwright integration
- WCAG 2.2 Level AA compliance
- Automated + manual testing
- Comprehensive reporting

**Supporting Documentation:**
- [Accessibility Auditor Chatmode](.github/chatmodes/🎭%20accessibility-auditor.chatmode.md)
- [Accessibility Auditor Guide](docs/accessibility-auditor-agent.md)

---

## Data Flow Architecture

### Test Generation Flow

```
┌─────────────┐
│   User      │
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  🎭 Planner Agent   │
│  - Explore app      │
│  - Generate plan    │
└──────┬──────────────┘
       │
       │ (specs/*.md)
       ▼
┌─────────────────────┐
│ 🎭 Generator Agent  │
│  - Execute plan     │
│  - Generate code    │
└──────┬──────────────┘
       │
       │ (tests/*.spec.ts)
       ▼
┌─────────────────────┐
│  Test Execution     │
│  (Playwright)       │
└──────┬──────────────┘
       │
       ├─── Pass ✓
       │
       └─── Fail ✗
              │
              ▼
       ┌─────────────────────┐
       │  🎭 Healer Agent    │
       │  - Debug            │
       │  - Fix              │
       │  - Re-run           │
       └─────────────────────┘
```

### Accessibility Audit Flow

```
┌─────────────┐
│  Target URL │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ 🎭 Accessibility Auditor │
└──────┬───────────────────┘
       │
       ├─── Lighthouse MCP ──→ Automated Audit
       │                       (Baseline score)
       │
       └─── Playwright MCP ──→ Manual Testing
                               (Keyboard, ARIA, etc.)
       │
       ▼
┌──────────────────────────┐
│   WCAG 2.2 Validation    │
│   - Level A              │
│   - Level AA             │
│   - New 2.2 Criteria     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Comprehensive Report    │
│  - Issues by priority    │
│  - Code examples         │
│  - Remediation plan      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Test Suite Generation  │
│   (Regression tests)     │
└──────────────────────────┘
```

---

## Technology Stack

### Core Dependencies

```json
{
  "runtime": {
    "node": ">=16.0.0",
    "typescript": "^5.0.0"
  },
  "testing": {
    "@playwright/test": "^1.40.0",
    "lighthouse": "^12.8.2"
  },
  "ide": {
    "vscode": ">=1.105.0",
    "ms-playwright.playwright": "latest"
  },
  "ai": {
    "github-copilot": "integrated",
    "llm-providers": ["GPT-4", "Claude", "Gemini"]
  }
}
```

### Configuration Files

| File | Purpose | Documentation |
|------|---------|---------------|
| [`playwright.config.ts`](playwright.config.ts) | Playwright configuration | [Config](playwright.config.ts) |
| [`.vscode/mcp.json`](.vscode/mcp.json) | MCP server connections | [MCP Config](.vscode/mcp.json) |
| [`.vscode/settings.json`](.vscode/settings.json) | IDE settings | [Settings](.vscode/settings.json) |
| [`package.json`](package.json) | Dependencies | [Package](package.json) |

---

## Security & Compliance

### Security Considerations

1. **MCP Protocol Security:**
   - All MCP communication via `stdio` (no network exposure)
   - Process isolation between agents and browser engines
   - Sandboxed browser contexts

2. **Code Generation Safety:**
   - Generated tests reviewed in VS Code before execution
   - No automatic execution of untrusted code
   - Version control integration for audit trails

3. **Accessibility Testing:**
   - Read-only DOM inspection
   - No data collection or PII exposure
   - Compliance with WCAG 2.2 privacy guidelines

### Compliance Features

- **WCAG 2.2 Level AA:** Full compliance testing
- **Audit Trails:** All agent actions logged
- **Test Artifacts:** Screenshots, traces, and reports
- **Documentation:** Comprehensive test plans and reports

---

## Performance & Scalability

### Performance Characteristics

| Component | Typical Performance |
|-----------|---------------------|
| Planner exploration | 2-5 minutes per flow |
| Test generation | 30-60 seconds per test |
| Test execution | 5-15 seconds per test |
| Lighthouse audit | 10-30 seconds per page |
| Healing cycle | 1-3 minutes per fix |

### Scalability Considerations

**Horizontal Scaling:**
- Tests run in parallel (configurable workers)
- Independent browser contexts
- Distributed test execution on CI/CD

**Vertical Scaling:**
- Adjustable `workers` in [`playwright.config.ts`](playwright.config.ts)
- Browser resource pooling
- Lighthouse caching

**CI/CD Integration:**
```yaml
# Example GitHub Actions workflow
- name: Run Playwright Tests
  run: npm test
  env:
    CI: true
    PLAYWRIGHT_WORKERS: 1
```

---

## Extensibility & Integration

### Adding Custom Agents

1. **Create Chatmode Definition:**
   ```markdown
   # .github/chatmodes/🎭 custom-agent.chatmode.md
   ---
   description: Your agent description
   tools: ['playwright-test/*', 'lighthouse/*']
   ---
   
   Agent instructions and workflow
   ```

2. **Define Tool Usage:**
   - Use existing MCP tools
   - Request new tools via Playwright MCP server

3. **Integration:**
   - Agents automatically available in VS Code Copilot Chat
   - Use `@workspace /` to invoke

### Custom MCP Servers

Add new MCP servers in [`.vscode/mcp.json`](.vscode/mcp.json):

```json
{
  "servers": {
    "custom-mcp": {
      "command": "npx",
      "args": ["custom-mcp-server"]
    }
  }
}
```

### API Integration

Agents can integrate with external APIs via Playwright's network interception:

```typescript
await page.route('**/api/**', route => {
  // Custom API handling
  route.continue();
});
```

---

## Monitoring & Observability

### Built-in Monitoring

1. **Test Reports:**
   - HTML reports: [`playwright-report/index.html`](playwright-report/index.html)
   - JSON results: [`test-results/.last-run.json`](test-results/.last-run.json)

2. **Traces:**
   - Captured on failure
   - Full DOM snapshots
   - Network activity logs

3. **Screenshots & Videos:**
   - Failure evidence
   - Step-by-step execution
   - Accessibility audit visuals

### Logging Architecture

```
┌─────────────────────────────────────┐
│        Agent Execution Log          │
│  ┌───────────────────────────────┐ │
│  │ Planner: Explored 15 pages    │ │
│  │ Generator: Created 8 tests    │ │
│  │ Healer: Fixed 3 failures      │ │
│  │ Auditor: Found 5 issues       │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Playwright Test Results        │
│  ┌───────────────────────────────┐ │
│  │ 25 passed, 3 failed, 1 skipped│ │
│  │ Duration: 2m 15s              │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Lighthouse Audit Data         │
│  ┌───────────────────────────────┐ │
│  │ Accessibility: 90/100         │ │
│  │ Performance: 85/100           │ │
│  │ Issues: 8 identified          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

### Local Development

```
Developer Workstation
├── VS Code (>= 1.105)
├── Node.js (>= 16)
├── Playwright Browsers
└── MCP Servers (auto-started)
```

### CI/CD Pipeline

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Production Monitoring

```
Playwright Tests (Scheduled)
      ↓
  CI/CD Pipeline
      ↓
   Test Results
      ↓
  ┌──────────────┐
  │ Report Store │
  │ - HTML       │
  │ - JSON       │
  │ - Traces     │
  └──────────────┘
      ↓
  Notification System
  (Slack, Email, etc.)
```

---

## Future Enhancements

### Planned Features

1. **Multi-Language Support:**
   - Python test generation
   - Java test generation
   - C# test generation

2. **Advanced AI Capabilities:**
   - Visual regression testing
   - Anomaly detection
   - Predictive failure analysis

3. **Enhanced MCP Integrations:**
   - Database MCP (test data management)
   - API Testing MCP (contract testing)
   - Performance MCP (load testing)

4. **Enterprise Features:**
   - RBAC for agent execution
   - Audit logging and compliance
   - Multi-tenant support

---

## References

### Key Documentation

- **Playwright:** [https://playwright.dev](https://playwright.dev)
- **Lighthouse:** [https://developer.chrome.com/docs/lighthouse](https://developer.chrome.com/docs/lighthouse)
- **WCAG 2.2:** [https://www.w3.org/WAI/WCAG22/quickref/](https://www.w3.org/WAI/WCAG22/quickref/)
- **GitHub Copilot:** [https://github.com/features/copilot](https://github.com/features/copilot)

### Internal Documentation

- [README.md](README.md) - Project overview and setup
- [Accessibility Auditor Guide](docs/accessibility-auditor-agent.md) - Detailed agent documentation
- [Audit Summary](docs/AUDIT_SUMMARY.md) - Example audit results
- [Test Plan](devops1-test-plan.md) - Sample test planning document

---

## Appendix: Agent Comparison Matrix

| Feature | Planner | Generator | Healer | Accessibility Auditor |
|---------|---------|-----------|--------|----------------------|
| **Primary Purpose** | Test planning | Test coding | Test fixing | WCAG compliance |
| **Input** | User request | Markdown plan | Failing tests | Target URL |
| **Output** | Test plan (MD) | Test code (TS) | Fixed tests | Audit report + tests |
| **LLM Usage** | High | High | Medium | High |
| **Browser Automation** | Yes | Yes | Yes | Yes |
| **Lighthouse Integration** | No | No | No | Yes |
| **Code Generation** | No | Yes | Yes | Yes |
| **Human Review** | Recommended | Recommended | Optional | Recommended |
| **Autonomous** | Yes | Yes | Yes | Partial |

---

## Contact & Support

For questions about this architecture:
- **Technical Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Architecture Questions:** Senior Architecture Team
- **Accessibility Concerns:** [docs/accessibility-auditor-agent.md](docs/accessibility-auditor-agent.md)

---

**Document Changelog:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2025 | Initial architecture document |

---

*This document is maintained by the Senior Architecture Team and updated with each major system release.*