# 🎭 CI Accessibility Monitoring Agent

## Overview

The **CI Accessibility Monitor Agent** is an outer loop AI agent that continuously reviews your website for accessibility compliance. Built following [GitHub's agentic primitives and context engineering patterns](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/), this agent runs automatically in your CI/CD pipeline to catch accessibility regressions before they reach production.

### Key Features

- 🔄 **Continuous Monitoring**: Scheduled daily reviews + PR checks
- 📊 **WCAG 2.2 Level AA Compliance**: Automated + manual test coverage
- 🎯 **Regression Detection**: Compare scores against baseline with configurable thresholds
- 📈 **Trend Analysis**: Track accessibility improvements over time
- 🔔 **Smart Notifications**: GitHub Issues + Slack alerts for critical issues
- 📝 **Actionable Reports**: HTML reports with remediation guidance
- 🚦 **PR Blocking**: Fail CI if critical regressions detected

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Trigger                    │
│         (Schedule: Daily | Event: PR | Manual)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Outer Loop Agent Orchestrator                   │
│         (scripts/run-accessibility-review.js)                │
└───────────────┬──────────────────────────────────┬──────────┘
                │                                  │
                ▼                                  ▼
    ┌───────────────────────┐        ┌───────────────────────┐
    │   Context Engineering  │        │  Memory Management    │
    │  - Load config         │        │  - Load baseline      │
    │  - Read previous runs  │        │  - Track history      │
    │  - Priority sorting    │        │  - Save results       │
    └───────────────────────┘        └───────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────┐
    │         Tool Orchestration                │
    │                                           │
    │  For each target page:                    │
    │  1. Playwright → Navigate & Setup         │
    │  2. Lighthouse → Automated Audit (70%)    │
    │  3. Playwright → Manual WCAG Tests (30%)  │
    │     - Keyboard navigation                 │
    │     - Focus indicators                    │
    │     - Form labels                         │
    │     - Touch targets                       │
    │     - ARIA landmarks                      │
    │     - Heading hierarchy                   │
    └───────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────┐
    │         Aggregation & Analysis            │
    │  - Compare vs baseline                    │
    │  - Detect regressions (threshold: 5pts)   │
    │  - Calculate averages                     │
    │  - Categorize by severity                 │
    └───────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────┐
    │         Report Generation                 │
    │  - HTML: Visual dashboard                 │
    │  - JSON: Machine-readable                 │
    │  - Markdown: PR comments                  │
    │  - Issue: Regression tracking             │
    └───────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────┐
    │         Notification & Action             │
    │  - Create/update GitHub Issues            │
    │  - Comment on PRs                         │
    │  - Send Slack alerts                      │
    │  - Fail CI if regressions detected        │
    └───────────────────────────────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@playwright/test` - Browser automation
- `node-fetch` - HTTP client for Slack notifications
- `lighthouse` - Accessibility auditing (optional, for future integration)

### 2. Configure Target Pages

Edit `accessibility-review-config.json`:

```json
{
  "reviewSchedule": "daily",
  "targetPages": [
    {
      "url": "https://your-site.com/",
      "name": "Homepage",
      "priority": "high",
      "baseline": 95,
      "focusAreas": ["keyboard-nav", "aria", "color-contrast"]
    }
  ],
  "wcagLevel": "AA",
  "regressionThreshold": 5,
  "notificationChannels": {
    "githubIssues": true,
    "slackWebhook": "${SLACK_WEBHOOK_URL}"
  }
}
```

**Priority Levels:**
- `critical` - Forms, checkout, authentication flows
- `high` - Main navigation, key landing pages
- `medium` - Secondary pages, blog posts
- `low` - Tertiary content, archives

**Focus Areas:**
- `keyboard-nav` - Tab order, keyboard operability (WCAG 2.1.1)
- `focus-indicators` - Visible focus states (WCAG 2.4.7, 2.4.11)
- `form-labels` - Input labels and instructions (WCAG 1.3.1, 3.3.2)
- `touch-targets` - Minimum 24×24px size (WCAG 2.5.8)
- `color-contrast` - Text contrast ratios (WCAG 1.4.3)
- `aria` - Semantic landmarks and roles
- `heading-hierarchy` - Logical heading structure (WCAG 1.3.1)
- `image-alt-text` - Alternative text for images (WCAG 1.1.1)
- `interactive-elements` - Click handlers with keyboard equivalents
- `mobile-accessibility` - Viewport, zoom, responsive features

### 3. Set Up GitHub Secrets (Optional)

For Slack notifications, add to your repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

- **Name:** `SLACK_WEBHOOK_URL`
- **Value:** Your Slack webhook URL (e.g., `https://hooks.slack.com/services/...`)

## Usage

### Local Development

```bash
# Run full accessibility review
npm run accessibility-review

# View reports
open reports/accessibility/index.html
```

### CI/CD (Automatic)

The workflow runs automatically:

1. **Scheduled**: Daily at 2 AM UTC
2. **PR Trigger**: When files in `src/`, `public/`, or `tests/` change
3. **Manual**: Via GitHub Actions UI

### Manual CI Trigger

```bash
# Via GitHub CLI
gh workflow run accessibility-review.yml

# Via GitHub UI
Actions → Continuous Accessibility Review → Run workflow
```

## Understanding Results

### Score Interpretation

| Score Range | Status | Meaning |
|-------------|--------|---------|
| 90-100 | ✅ Pass | Excellent accessibility |
| 70-89 | ⚠️ Warning | Good but improvable |
| 0-69 | ❌ Fail | Critical issues present |

### Regression Detection

A regression is detected when:
- Current score < (Baseline score - Threshold)
- Default threshold: **5 points**

Example:
- Baseline: 92
- Current: 86
- Delta: -6 (**regression detected** ❌)

### Report Artifacts

After each run, the following reports are generated:

1. **`reports/accessibility/index.html`** - Visual dashboard with:
   - Executive summary
   - Per-page scores
   - Test-by-test breakdown
   - Regression highlights

2. **`reports/accessibility/report.json`** - Machine-readable data:
   ```json
   {
     "summary": { "totalPages": 5, "regressions": 1, "averageScore": 88.4 },
     "results": [...],
     "regressions": [...]
   }
   ```

3. **`reports/accessibility/baseline.json`** - Historical scores for comparison

4. **`reports/accessibility/pr-summary.md`** - Markdown for PR comments

5. **`reports/accessibility/regression-issue.md`** - GitHub Issue template (if regressions found)

## Test Coverage

### Automated Tests (via Lighthouse-style checks)
- ✅ H1 presence
- ✅ HTML lang attribute
- ✅ Page title
- ✅ Viewport meta tag
- ✅ Image alt attributes
- ✅ Main landmark
- ✅ Link text content

### Manual Tests (via Playwright)

#### Keyboard Navigation (2.1.1)
```javascript
// Tests that Tab key moves focus to interactive elements
await page.keyboard.press('Tab');
const focused = await page.evaluate(() => document.activeElement.tagName);
// Pass if focused element is not BODY
```

#### Focus Indicators (2.4.7, 2.4.11)
```javascript
// Tests that focused elements have visible outlines
const hasVisibleFocus = await element.evaluate((el) => {
  const styles = window.getComputedStyle(el);
  return styles.outline !== 'none' || styles.boxShadow !== 'none';
});
```

#### Form Labels (1.3.1, 3.3.2)
```javascript
// Tests that inputs have associated labels
<label for="email">Email</label>
<input id="email" type="email" />
// Or aria-label / aria-labelledby
```

#### Touch Targets (2.5.8)
```javascript
// Tests that interactive elements are at least 24×24px
const rect = await button.boundingBox();
const isSufficient = rect.width >= 24 && rect.height >= 24;
```

#### ARIA Landmarks
```javascript
// Tests for semantic page structure
const landmarks = {
  nav: document.querySelector('nav, [role="navigation"]'),
  main: document.querySelector('main, [role="main"]'),
  banner: document.querySelector('header, [role="banner"]'),
  contentinfo: document.querySelector('footer, [role="contentinfo"]')
};
```

#### Heading Hierarchy (1.3.1)
```javascript
// Tests for logical heading order (no skipped levels)
const headings = ['h1', 'h2', 'h3', 'h4']; // ✅ Valid
const headings = ['h1', 'h3', 'h4'];       // ❌ Skipped h2
```

## Integration with Existing Tests

You already have comprehensive accessibility tests in `tests/`. The CI agent complements these by:

1. **Running on schedule** (not just on-demand)
2. **Tracking trends** over time
3. **Comparing baselines** for regression detection
4. **Automating notifications** to the team
5. **Blocking PRs** that introduce regressions

To use your existing tests:

```javascript
// In scripts/run-accessibility-review.js
// Replace runManualTests() with:
async runManualTests(page, focusAreas) {
  // Import your existing test utilities
  const { runAccessibilityAudit } = require('../tests/accessibility-utils');
  return await runAccessibilityAudit(page, focusAreas);
}
```

## Troubleshooting

### Issue: "Configuration file not found"

```bash
# Ensure config exists
ls -la accessibility-review-config.json

# Or specify custom path
node scripts/run-accessibility-review.js custom-config.json
```

### Issue: "Slack notifications not working"

Check:
1. `SLACK_WEBHOOK_URL` secret is set in GitHub
2. Webhook URL is valid and not expired
3. Webhook URL doesn't contain `${` (template literal not replaced)

```bash
# Test locally (won't actually send without real webhook)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK npm run accessibility-review
```

### Issue: "Browser launch failed in CI"

The workflow includes `npx playwright install --with-deps chromium` which installs system dependencies. If this fails:

```yaml
# Add to .github/workflows/accessibility-review.yml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0
```

### Issue: "False positive regressions"

Adjust threshold in `accessibility-review-config.json`:

```json
{
  "regressionThreshold": 10  // More lenient (was 5)
}
```

Or update baseline after validating changes:

```bash
# Baseline is automatically updated after successful runs
# To manually reset:
rm reports/accessibility/baseline.json
npm run accessibility-review
```

## Advanced Usage

### Custom Focus Areas

Add new test methods in `scripts/run-accessibility-review.js`:

```javascript
async testCustomCriteria(page) {
  // Your custom accessibility checks
  const result = await page.evaluate(() => {
    // Check for custom pattern
    return { passed: true, details: '...' };
  });
  
  return result;
}
```

Then add to `runManualTests()`:

```javascript
case 'custom-criteria':
  tests.customCriteria = await this.testCustomCriteria(page);
  break;
```

### Integration with Real Lighthouse

Install Chrome Launcher:

```bash
npm install chrome-launcher
```

Update `runLighthouseAudit()`:

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async runLighthouseAudit(page, url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = { port: chrome.port };
  
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  
  return runnerResult.lhr.categories.accessibility.score * 100;
}
```

### Parallel Page Reviews

Modify `run()` method to process pages concurrently:

```javascript
// Replace sequential loop with:
const results = await Promise.all(
  this.config.targetPages.map(page => 
    this.reviewPage(context, page).catch(error => ({
      ...page,
      error: error.message,
      score: 0
    }))
  )
);
this.results = results;
```

### Custom Notification Channels

Add email support:

```javascript
async sendEmailNotification() {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  await transporter.sendMail({
    from: 'accessibility-agent@yourcompany.com',
    to: this.config.notificationChannels.email,
    subject: `🔴 Accessibility Regression - ${this.regressions.length} issues`,
    html: this.generateHTMLReport()
  });
}
```

## Best Practices

### 1. Start with Critical Pages

Focus on user flows that impact business:
- Sign up / login
- Checkout / payment
- Contact forms
- Primary navigation

### 2. Set Realistic Baselines

Don't aim for 100/100 immediately:
- Start with current score
- Improve incrementally
- Update baseline as you fix issues

### 3. Review Regressions Promptly

Act on issues within 24 hours:
- Prioritize by severity
- Assign to developers
- Re-run after fixes

### 4. Combine with Manual Testing

Automated tests catch ~60-70% of issues. Still need:
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Real user testing with assistive technology
- Color blindness simulation
- Keyboard-only navigation testing

### 5. Track Trends, Not Just Scores

A score of 88 isn't inherently good or bad. Track:
- Week-over-week improvement
- Regression frequency
- Time to fix issues
- Categories of failures

## References

### WCAG 2.2 Guidelines
- [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [How to Meet WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)

### Tools & Resources
- [Lighthouse Accessibility Scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### AI Workflow Patterns
- [GitHub Blog: Reliable AI Workflows](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/)
- [Agentic Primitives](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/#agentic-primitives)
- [Context Engineering](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/#context-engineering)

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review existing GitHub Issues
3. Create new issue with:
   - Error message
   - Configuration file
   - CI logs (if applicable)
   - Steps to reproduce

## Roadmap

- [ ] Integration with real Lighthouse MCP server
- [ ] Color contrast validation via axe-core
- [ ] Screen reader simulation tests
- [ ] Accessibility score trends dashboard
- [ ] Slack command for on-demand reviews
- [ ] Multi-browser testing (Firefox, Safari)
- [ ] PDF report generation
- [ ] Integration with Jira/Linear for issue tracking

---

**Built with ❤️ following [GitHub's AI workflow patterns](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/)**
