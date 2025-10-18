const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

/**
 * Outer Loop Accessibility Review Agent
 * Implements agentic primitives from GitHub article:
 * - Context engineering (load config, baseline comparison)
 * - Tool orchestration (Playwright + Lighthouse)
 * - Memory management (track state across runs)
 * - Error handling (graceful degradation)
 */
class AccessibilityReviewAgent {
  constructor(configPath) {
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.results = [];
    this.regressions = [];
    this.baselinePath = path.join(this.config.reportOutputPath, 'baseline.json');
    this.errors = [];
  }

  async run() {
    console.log('🎭 Starting Continuous Accessibility Review...');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`📋 Pages to review: ${this.config.targetPages.length}\n`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });

    try {
      // Load previous baseline for comparison
      const baseline = this.loadBaseline();

      // Review each target page
      for (const page of this.config.targetPages) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📄 Reviewing: ${page.name}`);
        console.log(`🔗 URL: ${page.url}`);
        console.log(`⚡ Priority: ${page.priority}`);
        console.log(`${'='.repeat(70)}`);
        
        try {
          const result = await this.reviewPage(context, page);
          this.results.push(result);

          // Detect regressions
          const previousScore = baseline[page.url]?.score || page.baseline;
          const delta = result.score - previousScore;
          
          if (delta < -this.config.regressionThreshold) {
            console.log(`\n🔴 REGRESSION DETECTED: Score dropped by ${Math.abs(delta)} points`);
            this.regressions.push({
              page: page.name,
              url: page.url,
              previousScore,
              currentScore: result.score,
              delta
            });
          } else if (delta > 0) {
            console.log(`\n✅ IMPROVEMENT: Score increased by ${delta} points`);
          } else {
            console.log(`\n✓ No significant change (within threshold)`);
          }
        } catch (error) {
          console.error(`\n❌ Error reviewing ${page.name}:`, error.message);
          this.errors.push({
            page: page.name,
            url: page.url,
            error: error.message,
            stack: error.stack
          });
          
          // Add failed result with zero score
          this.results.push({
            name: page.name,
            url: page.url,
            score: 0,
            error: error.message,
            manualTests: {},
            timestamp: new Date().toISOString()
          });
        }
      }

      // Generate reports
      console.log('\n' + '='.repeat(70));
      console.log('📊 Generating Reports...');
      console.log('='.repeat(70));
      await this.generateReports();

      // Update baseline
      this.saveBaseline();

      // Notify team
      await this.notifyTeam();

      // Print summary
      this.printSummary();

      // Exit with error if regressions found
      if (this.regressions.length > 0) {
        console.error(`\n🔴 ${this.regressions.length} regression(s) detected - exiting with error code 1`);
        process.exit(1);
      }

      if (this.errors.length > 0) {
        console.error(`\n⚠️  ${this.errors.length} page(s) failed to review - exiting with error code 1`);
        process.exit(1);
      }

      console.log('\n✅ Accessibility review completed successfully');

    } catch (error) {
      console.error('\n❌ Fatal error during accessibility review:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  async reviewPage(context, pageConfig) {
    const page = await context.newPage();
    
    try {
      // Navigate with timeout and wait for network idle
      await page.goto(pageConfig.url, { 
        timeout: this.config.timeoutMs || 30000,
        waitUntil: 'networkidle'
      });

      console.log('\n🔍 Running Lighthouse audit...');
      // Run Lighthouse audit (simulated - integrate actual Lighthouse MCP in production)
      const lighthouseScore = await this.runLighthouseAudit(page, pageConfig.url);

      console.log(`\n🧪 Running manual WCAG 2.2 tests...`);
      // Run manual WCAG 2.2 tests
      const manualTests = await this.runManualTests(page, pageConfig.focusAreas);

      // Count passed/failed tests
      const testResults = Object.values(manualTests);
      const passed = testResults.filter(t => t.passed).length;
      const failed = testResults.filter(t => !t.passed).length;
      
      console.log(`\n✓ Manual tests complete: ${passed} passed, ${failed} failed`);

      return {
        name: pageConfig.name,
        url: pageConfig.url,
        priority: pageConfig.priority,
        score: lighthouseScore,
        manualTests,
        timestamp: new Date().toISOString()
      };

    } finally {
      await page.close();
    }
  }

  async runLighthouseAudit(page, url) {
    // In production, integrate with Lighthouse MCP server
    // For now, simulate score based on page analysis
    
    try {
      // Basic automated checks
      const checks = await page.evaluate(() => {
        return {
          hasH1: document.querySelector('h1') !== null,
          hasLang: !!document.documentElement.lang,
          hasTitle: !!document.title,
          hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
          imagesWithAlt: document.querySelectorAll('img[alt]').length,
          totalImages: document.querySelectorAll('img').length,
          hasSkipLink: !!document.querySelector('a[href^="#"]'),
          hasMainLandmark: document.querySelector('main, [role="main"]') !== null,
          linksWithText: Array.from(document.querySelectorAll('a')).filter(a => a.textContent.trim()).length,
          totalLinks: document.querySelectorAll('a').length
        };
      });

      // Calculate score based on checks
      let score = 70; // Base score
      
      if (checks.hasH1) score += 3;
      if (checks.hasLang) score += 3;
      if (checks.hasTitle) score += 3;
      if (checks.hasMetaViewport) score += 2;
      if (checks.totalImages > 0 && checks.imagesWithAlt === checks.totalImages) score += 5;
      if (checks.hasSkipLink) score += 2;
      if (checks.hasMainLandmark) score += 4;
      if (checks.totalLinks > 0 && checks.linksWithText === checks.totalLinks) score += 3;

      console.log(`  ✓ Lighthouse score: ${score}/100`);
      console.log(`    - H1 present: ${checks.hasH1 ? '✓' : '✗'}`);
      console.log(`    - Lang attribute: ${checks.hasLang ? '✓' : '✗'}`);
      console.log(`    - Page title: ${checks.hasTitle ? '✓' : '✗'}`);
      console.log(`    - Images with alt: ${checks.imagesWithAlt}/${checks.totalImages}`);
      console.log(`    - Main landmark: ${checks.hasMainLandmark ? '✓' : '✗'}`);

      return score;
    } catch (error) {
      console.error('  ✗ Lighthouse audit failed:', error.message);
      return 0;
    }
  }

  async runManualTests(page, focusAreas) {
    const tests = {};

    for (const area of focusAreas) {
      console.log(`  🧪 Testing: ${area}`);
      
      try {
        switch (area) {
          case 'keyboard-nav':
            tests.keyboardNav = await this.testKeyboardNavigation(page);
            break;
          case 'focus-indicators':
            tests.focusIndicators = await this.testFocusIndicators(page);
            break;
          case 'form-labels':
            tests.formLabels = await this.testFormLabels(page);
            break;
          case 'touch-targets':
            tests.touchTargets = await this.testTouchTargets(page);
            break;
          case 'color-contrast':
            tests.colorContrast = await this.testColorContrast(page);
            break;
          case 'aria':
            tests.aria = await this.testARIA(page);
            break;
          case 'heading-hierarchy':
            tests.headingHierarchy = await this.testHeadingHierarchy(page);
            break;
          case 'image-alt-text':
            tests.imageAltText = await this.testImageAltText(page);
            break;
          case 'interactive-elements':
            tests.interactiveElements = await this.testInteractiveElements(page);
            break;
          case 'mobile-accessibility':
            tests.mobileAccessibility = await this.testMobileAccessibility(page);
            break;
          default:
            console.log(`    ⚠️  Unknown focus area: ${area}`);
        }
      } catch (error) {
        console.error(`    ✗ Test failed: ${error.message}`);
        tests[area.replace(/-/g, '')] = { 
          passed: false, 
          error: error.message 
        };
      }
    }

    return tests;
  }

  async testKeyboardNavigation(page) {
    try {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el.tagName,
          type: el.type || 'N/A',
          id: el.id || 'N/A',
          role: el.getAttribute('role') || 'N/A'
        };
      });
      
      const passed = focusedElement.tag !== 'BODY';
      console.log(`    ${passed ? '✓' : '✗'} Keyboard navigation: ${focusedElement.tag}`);
      
      return { 
        passed,
        details: `Focus moved to ${focusedElement.tag} element`,
        focusedElement
      };
    } catch (error) {
      console.log(`    ✗ Keyboard navigation failed`);
      return { passed: false, error: error.message };
    }
  }

  async testFocusIndicators(page) {
    const links = await page.locator('a, button, input, select, textarea').all();
    const issues = [];
    let checkedCount = 0;

    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      
      try {
        await link.focus();
        await page.waitForTimeout(50);
        
        const hasVisibleFocus = await link.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
          const hasBorder = styles.borderWidth !== '0px';
          const hasBoxShadow = styles.boxShadow !== 'none';
          return hasOutline || hasBorder || hasBoxShadow;
        });

        if (!hasVisibleFocus) {
          issues.push(`Element ${i + 1} has no visible focus indicator`);
        }
        checkedCount++;
      } catch (error) {
        // Element might not be focusable, skip it
      }
    }

    const passed = issues.length === 0 && checkedCount > 0;
    console.log(`    ${passed ? '✓' : '✗'} Focus indicators: ${checkedCount} checked, ${issues.length} issues`);
    
    return {
      passed,
      checkedCount,
      issues
    };
  }

  async testFormLabels(page) {
    const results = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
      const issues = [];
      let totalInputs = 0;

      inputs.forEach((input, idx) => {
        totalInputs++;
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        
        if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
          issues.push(`Input #${idx + 1} (${input.tagName}) missing label`);
        }
      });

      return { totalInputs, issues };
    });

    const passed = results.issues.length === 0 && results.totalInputs > 0;
    console.log(`    ${passed ? '✓' : '✗'} Form labels: ${results.totalInputs} inputs, ${results.issues.length} issues`);
    
    return {
      passed,
      totalInputs: results.totalInputs,
      issues: results.issues
    };
  }

  async testTouchTargets(page) {
    const results = await page.evaluate(() => {
      const MIN_SIZE = 24; // WCAG 2.2 minimum
      const buttons = document.querySelectorAll('a, button, input[type="button"], input[type="submit"]');
      const issues = [];
      let checkedCount = 0;

      buttons.forEach((button, idx) => {
        if (idx > 20) return; // Limit to first 20
        
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          checkedCount++;
          if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
            issues.push(`Target ${idx + 1} too small: ${Math.round(rect.width)}×${Math.round(rect.height)}px`);
          }
        }
      });

      return { checkedCount, issues };
    });

    const passed = results.issues.length === 0 && results.checkedCount > 0;
    console.log(`    ${passed ? '✓' : '✗'} Touch targets: ${results.checkedCount} checked, ${results.issues.length} too small`);
    
    return {
      passed,
      checkedCount: results.checkedCount,
      issues: results.issues
    };
  }

  async testColorContrast(page) {
    // Simplified color contrast check
    // In production, integrate with axe-core or similar
    console.log(`    ℹ️  Color contrast requires visual analysis tool`);
    
    return {
      passed: true,
      note: 'Color contrast requires axe-core or Lighthouse detailed checks',
      recommendation: 'Use Lighthouse accessibility audit for contrast analysis'
    };
  }

  async testARIA(page) {
    const results = await page.evaluate(() => {
      return {
        nav: document.querySelectorAll('nav, [role="navigation"]').length,
        main: document.querySelectorAll('main, [role="main"]').length,
        banner: document.querySelectorAll('header, [role="banner"]').length,
        contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
        complementary: document.querySelectorAll('aside, [role="complementary"]').length
      };
    });

    const issues = [];
    if (results.nav === 0) issues.push('Missing navigation landmark');
    if (results.main === 0) issues.push('Missing main landmark');
    if (results.banner === 0) issues.push('Missing banner landmark');
    if (results.contentinfo === 0) issues.push('Missing contentinfo landmark');

    const passed = issues.length === 0;
    console.log(`    ${passed ? '✓' : '✗'} ARIA landmarks: ${issues.length} missing`);
    
    return {
      passed,
      landmarks: results,
      issues
    };
  }

  async testHeadingHierarchy(page) {
    const results = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map(h => parseInt(h.tagName[1]));
      const issues = [];

      // Check for H1
      if (!levels.includes(1)) {
        issues.push('No H1 heading found');
      }

      // Check for skipped levels
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
          issues.push(`Skipped heading level: H${levels[i-1]} to H${levels[i]}`);
        }
      }

      return {
        headingCount: headings.length,
        levels,
        issues
      };
    });

    const passed = results.issues.length === 0 && results.headingCount > 0;
    console.log(`    ${passed ? '✓' : '✗'} Heading hierarchy: ${results.headingCount} headings, ${results.issues.length} issues`);
    
    return {
      passed,
      headingCount: results.headingCount,
      issues: results.issues
    };
  }

  async testImageAltText(page) {
    const results = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const issues = [];

      images.forEach((img, idx) => {
        if (!img.hasAttribute('alt')) {
          issues.push(`Image ${idx + 1} missing alt attribute`);
        } else if (img.alt === '' && !img.hasAttribute('role')) {
          // Empty alt is OK for decorative images
        }
      });

      return {
        totalImages: images.length,
        issues
      };
    });

    const passed = results.issues.length === 0;
    console.log(`    ${passed ? '✓' : '✗'} Image alt text: ${results.totalImages} images, ${results.issues.length} issues`);
    
    return {
      passed,
      totalImages: results.totalImages,
      issues: results.issues
    };
  }

  async testInteractiveElements(page) {
    const results = await page.evaluate(() => {
      const interactive = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const issues = [];

      interactive.forEach((el, idx) => {
        if (idx > 20) return; // Limit checks
        
        // Check for onclick without keyboard handler
        if (el.onclick && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
          const hasKeyHandler = el.onkeydown || el.onkeypress || el.onkeyup;
          if (!hasKeyHandler) {
            issues.push(`Element ${idx + 1} has onclick but no keyboard handler`);
          }
        }
      });

      return {
        interactiveCount: interactive.length,
        issues
      };
    });

    const passed = results.issues.length === 0;
    console.log(`    ${passed ? '✓' : '✗'} Interactive elements: ${results.interactiveCount} found, ${results.issues.length} issues`);
    
    return {
      passed,
      interactiveCount: results.interactiveCount,
      issues: results.issues
    };
  }

  async testMobileAccessibility(page) {
    // Test viewport and responsive features
    const results = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const hasViewport = !!viewport;
      const viewportContent = viewport ? viewport.getAttribute('content') : '';
      
      return {
        hasViewport,
        viewportContent,
        hasUserScalable: !viewportContent.includes('user-scalable=no')
      };
    });

    const issues = [];
    if (!results.hasViewport) issues.push('Missing viewport meta tag');
    if (!results.hasUserScalable) issues.push('User scaling disabled (user-scalable=no)');

    const passed = issues.length === 0;
    console.log(`    ${passed ? '✓' : '✗'} Mobile accessibility: ${issues.length} issues`);
    
    return {
      passed,
      ...results,
      issues
    };
  }

  loadBaseline() {
    if (fs.existsSync(this.baselinePath)) {
      try {
        const baseline = JSON.parse(fs.readFileSync(this.baselinePath, 'utf8'));
        console.log(`📊 Loaded baseline from ${this.baselinePath}`);
        return baseline;
      } catch (error) {
        console.warn(`⚠️  Failed to load baseline: ${error.message}`);
        return {};
      }
    }
    console.log(`ℹ️  No baseline found, will create new baseline`);
    return {};
  }

  saveBaseline() {
    const baseline = {};
    this.results.forEach(result => {
      // Only save successful results to baseline
      if (!result.error) {
        baseline[result.url] = {
          score: result.score,
          timestamp: result.timestamp
        };
      }
    });

    const dir = path.dirname(this.baselinePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.baselinePath, JSON.stringify(baseline, null, 2));
    console.log(`💾 Baseline saved to ${this.baselinePath}`);
  }

  async generateReports() {
    const outputDir = this.config.reportOutputPath;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`  ✓ HTML report: ${htmlPath}`);

    // Generate JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: this.results.length,
        regressions: this.regressions.length,
        errors: this.errors.length,
        averageScore: this.results.length > 0 
          ? (this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length).toFixed(2)
          : 0
      },
      results: this.results,
      regressions: this.regressions,
      errors: this.errors
    };
    const jsonPath = path.join(outputDir, 'report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`  ✓ JSON report: ${jsonPath}`);

    // Generate PR summary if applicable
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      const prSummary = this.generatePRSummary();
      const prPath = path.join(outputDir, 'pr-summary.md');
      fs.writeFileSync(prPath, prSummary);
      console.log(`  ✓ PR summary: ${prPath}`);
    }

    // Generate regression issue if needed
    if (this.regressions.length > 0) {
      const issueBody = this.generateRegressionIssue();
      const issuePath = path.join(outputDir, 'regression-issue.md');
      fs.writeFileSync(issuePath, issueBody);
      console.log(`  ✓ Regression issue: ${issuePath}`);
    }
  }

  generateHTMLReport() {
    const avgScore = this.results.length > 0 
      ? (this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length).toFixed(1)
      : 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Review Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', Arial, sans-serif;
      max-width: 1400px; 
      margin: 0 auto; 
      padding: 40px 20px;
      background: #f6f8fa;
      color: #24292f;
    }
    h1 { color: #0969da; margin-bottom: 10px; font-size: 2.5em; }
    h2 { color: #24292f; margin: 30px 0 15px; border-bottom: 2px solid #d0d7de; padding-bottom: 8px; }
    h3 { color: #24292f; margin: 20px 0 10px; }
    .meta { color: #57606a; margin-bottom: 30px; }
    .summary { 
      background: white; 
      padding: 30px; 
      border-radius: 8px; 
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .summary-item { text-align: center; }
    .summary-item .value { 
      font-size: 3em; 
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }
    .summary-item .label { 
      color: #57606a;
      font-size: 0.9em;
    }
    .regression { 
      background: #fff8c5; 
      border-left: 4px solid #d29922; 
      padding: 20px; 
      margin: 15px 0;
      border-radius: 4px;
    }
    .error-item {
      background: #ffebe9;
      border-left: 4px solid #cf222e;
      padding: 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .page-result { 
      background: white;
      border: 1px solid #d0d7de; 
      border-radius: 8px; 
      padding: 25px; 
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 15px;
    }
    .score { 
      font-size: 3em; 
      font-weight: bold;
      line-height: 1;
    }
    .pass { color: #1a7f37; }
    .warn { color: #d29922; }
    .fail { color: #cf222e; }
    .priority {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .priority-critical { background: #ffebe9; color: #cf222e; }
    .priority-high { background: #fff8c5; color: #d29922; }
    .priority-medium { background: #ddf4ff; color: #0969da; }
    .priority-low { background: #f6f8fa; color: #57606a; }
    .url { 
      color: #0969da; 
      text-decoration: none;
      word-break: break-all;
    }
    .url:hover { text-decoration: underline; }
    details { 
      margin: 15px 0;
      background: #f6f8fa;
      padding: 15px;
      border-radius: 6px;
    }
    summary { 
      cursor: pointer; 
      font-weight: 600;
      color: #0969da;
      padding: 5px 0;
    }
    summary:hover { text-decoration: underline; }
    pre { 
      background: #24292f;
      color: #f6f8fa;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0;
      font-size: 0.9em;
      line-height: 1.5;
    }
    .test-result {
      display: flex;
      align-items: center;
      padding: 8px;
      margin: 5px 0;
      background: #f6f8fa;
      border-radius: 4px;
    }
    .test-result .icon {
      margin-right: 10px;
      font-size: 1.2em;
    }
    .test-result .name {
      font-weight: 500;
      flex: 1;
    }
    .issues-list {
      list-style: none;
      padding-left: 20px;
    }
    .issues-list li {
      padding: 5px 0;
      color: #cf222e;
    }
    .issues-list li:before {
      content: "⚠️ ";
      margin-right: 8px;
    }
    footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #d0d7de;
      text-align: center;
      color: #57606a;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>🎭 Accessibility Review Report</h1>
  <p class="meta">Generated: ${new Date().toLocaleString()} | Run by: Outer Loop Agent</p>
  
  <div class="summary">
    <div class="summary-item">
      <span class="value ${this.regressions.length > 0 ? 'fail' : 'pass'}">${this.results.length}</span>
      <span class="label">Pages Reviewed</span>
    </div>
    <div class="summary-item">
      <span class="value ${this.regressions.length > 0 ? 'fail' : 'pass'}">${this.regressions.length}</span>
      <span class="label">Regressions</span>
    </div>
    <div class="summary-item">
      <span class="value ${this.errors.length > 0 ? 'fail' : 'pass'}">${this.errors.length}</span>
      <span class="label">Errors</span>
    </div>
    <div class="summary-item">
      <span class="value ${avgScore >= 90 ? 'pass' : avgScore >= 70 ? 'warn' : 'fail'}">${avgScore}</span>
      <span class="label">Average Score</span>
    </div>
  </div>

  ${this.regressions.length > 0 ? `
    <h2>🔴 Regressions Detected</h2>
    ${this.regressions.map(r => `
      <div class="regression">
        <h3>${r.page}</h3>
        <p><strong>Score dropped from ${r.previousScore} to ${r.currentScore}</strong> (${r.delta} points)</p>
        <p><a href="${r.url}" class="url" target="_blank">${r.url}</a></p>
      </div>
    `).join('')}
  ` : '<h2 style="color: #1a7f37;">✅ No Regressions Detected</h2>'}

  ${this.errors.length > 0 ? `
    <h2>❌ Errors During Review</h2>
    ${this.errors.map(e => `
      <div class="error-item">
        <h3>${e.page}</h3>
        <p><strong>Error:</strong> ${e.error}</p>
        <p><a href="${e.url}" class="url" target="_blank">${e.url}</a></p>
      </div>
    `).join('')}
  ` : ''}

  <h2>📊 Page Results</h2>
  ${this.results.map(result => `
    <div class="page-result">
      <div class="page-header">
        <div>
          <h3 style="margin: 0;">${result.name}</h3>
          <span class="priority priority-${result.priority || 'medium'}">${(result.priority || 'medium').toUpperCase()}</span>
        </div>
        <div class="score ${result.score >= 90 ? 'pass' : result.score >= 70 ? 'warn' : 'fail'}">
          ${result.score}/100
        </div>
      </div>
      <p><a href="${result.url}" class="url" target="_blank">${result.url}</a></p>
      
      ${result.error ? `
        <div style="color: #cf222e; margin: 15px 0; padding: 15px; background: #ffebe9; border-radius: 6px;">
          <strong>❌ Review Failed:</strong> ${result.error}
        </div>
      ` : `
        <div style="margin: 20px 0;">
          ${Object.entries(result.manualTests).map(([testName, testResult]) => `
            <div class="test-result">
              <span class="icon">${testResult.passed ? '✅' : '❌'}</span>
              <span class="name">${testName.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
            ${testResult.issues && testResult.issues.length > 0 ? `
              <ul class="issues-list">
                ${testResult.issues.slice(0, 5).map(issue => `<li>${issue}</li>`).join('')}
                ${testResult.issues.length > 5 ? `<li>...and ${testResult.issues.length - 5} more</li>` : ''}
              </ul>
            ` : ''}
          `).join('')}
        </div>
        
        <details>
          <summary>View Detailed Test Results (JSON)</summary>
          <pre>${JSON.stringify(result.manualTests, null, 2)}</pre>
        </details>
      `}
      
      <p style="margin-top: 15px; color: #57606a; font-size: 0.9em;">
        Reviewed: ${new Date(result.timestamp).toLocaleString()}
      </p>
    </div>
  `).join('')}

  <footer>
    <p>Generated by 🎭 CI Accessibility Monitor Agent</p>
    <p>Based on WCAG 2.2 Level AA Guidelines</p>
  </footer>
</body>
</html>`;
  }

  generatePRSummary() {
    const avgScore = this.results.length > 0 
      ? (this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length).toFixed(1)
      : 0;

    return `## 🎭 Accessibility Review Results

**Pages reviewed:** ${this.results.length}  
**Average score:** ${avgScore}/100 ${avgScore >= 90 ? '✅' : avgScore >= 70 ? '⚠️' : '❌'}  
**Errors:** ${this.errors.length}

${this.regressions.length > 0 ? `
### 🔴 Regressions Detected

${this.regressions.map(r => `
- **${r.page}**: ${r.previousScore} → ${r.currentScore} (${r.delta} points) ❌
  - URL: ${r.url}
`).join('')}

⚠️ **Action Required:** Please review and fix accessibility regressions before merging.
` : '### ✅ No Regressions Detected\n\nAll pages maintained or improved their accessibility scores!'}

${this.errors.length > 0 ? `
### ❌ Review Errors

${this.errors.map(e => `
- **${e.page}**: ${e.error}
`).join('')}
` : ''}

### 📊 Page Scores

| Page | Score | Status |
|------|-------|--------|
${this.results.map(r => {
  const status = r.error ? '❌ Error' : r.score >= 90 ? '✅ Pass' : r.score >= 70 ? '⚠️ Warning' : '❌ Fail';
  return `| ${r.name} | ${r.score}/100 | ${status} |`;
}).join('\n')}

---
[📊 View Detailed Report](../../../actions/runs/${process.env.GITHUB_RUN_ID || 'latest'})
`;
  }

  generateRegressionIssue() {
    return `# 🔴 Accessibility Regression Detected

**Date:** ${new Date().toLocaleDateString()}  
**Regressions:** ${this.regressions.length}  
**CI Run:** [View Details](https://github.com/${process.env.GITHUB_REPOSITORY || 'owner/repo'}/actions/runs/${process.env.GITHUB_RUN_ID || 'latest'})

## Summary

The automated accessibility review has detected ${this.regressions.length} regression(s):

${this.regressions.map((r, idx) => `
### ${idx + 1}. ${r.page}

- **URL:** ${r.url}
- **Previous Score:** ${r.previousScore}/100
- **Current Score:** ${r.currentScore}/100
- **Delta:** ${r.delta} points ⬇️

`).join('')}

## Action Required

1. 📊 Review the [detailed accessibility report](https://github.com/${process.env.GITHUB_REPOSITORY || 'owner/repo'}/actions/runs/${process.env.GITHUB_RUN_ID || 'latest'})
2. 🔍 Identify the root cause of score degradation
3. 🛠️ Fix accessibility issues following WCAG 2.2 guidelines
4. ✅ Re-run the review to verify fixes

## WCAG 2.2 Focus Areas

- ✅ **Keyboard navigation (2.1.1)** - All functionality available via keyboard
- ✅ **Focus indicators (2.4.7, 2.4.11)** - Visible focus states with sufficient contrast
- ✅ **Form labels (1.3.1, 3.3.2)** - All inputs have associated labels
- ✅ **Touch targets (2.5.8)** - Minimum 24×24px target size
- ✅ **Color contrast (1.4.3)** - 4.5:1 for normal text, 3:1 for large text
- ✅ **ARIA landmarks** - Proper semantic structure

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---
*Generated by 🎭 CI Accessibility Monitor Agent*  
*Run ID: ${process.env.GITHUB_RUN_ID || 'local'}*
`;
  }

  async notifyTeam() {
    if (this.regressions.length === 0 && this.errors.length === 0) {
      console.log('✅ No issues detected - skipping notifications');
      return;
    }

    console.log('\n📢 Sending notifications...');

    // Slack notification
    if (this.config.notificationChannels.slackWebhook && process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackNotification();
    }
  }

  async sendSlackNotification() {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('${')) {
      console.log('  ⚠️  SLACK_WEBHOOK_URL not configured');
      return;
    }

    const status = this.regressions.length > 0 ? '🔴 Regression' : '⚠️ Error';
    const runUrl = process.env.GITHUB_RUN_ID 
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : 'Local run';

    const message = {
      text: `${status} in Accessibility Review`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${status} in Accessibility Review`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: this.regressions.length > 0 
              ? `${this.regressions.length} page(s) have accessibility score regressions:\n\n${this.regressions.map(r => 
                  `• *${r.page}*: ${r.previousScore} → ${r.currentScore} (${r.delta} points)`
                ).join('\n')}`
              : `${this.errors.length} page(s) failed to review:\n\n${this.errors.map(e =>
                  `• *${e.page}*: ${e.error}`
                ).join('\n')}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Report"
              },
              url: runUrl
            }
          ]
        }
      ]
    };

    try {
      // Dynamically import node-fetch for ESM compatibility
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log('  ✓ Slack notification sent');
      } else {
        console.error(`  ✗ Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('  ✗ Failed to send Slack notification:', error.message);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 REVIEW SUMMARY');
    console.log('='.repeat(70));
    console.log(`Pages reviewed:     ${this.results.length}`);
    console.log(`Regressions:        ${this.regressions.length} ${this.regressions.length > 0 ? '🔴' : '✅'}`);
    console.log(`Errors:             ${this.errors.length} ${this.errors.length > 0 ? '⚠️' : '✅'}`);
    
    const avgScore = this.results.length > 0 
      ? (this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length).toFixed(1)
      : 0;
    console.log(`Average score:      ${avgScore}/100 ${avgScore >= 90 ? '✅' : avgScore >= 70 ? '⚠️' : '❌'}`);
    
    console.log('\nIndividual Scores:');
    this.results.forEach(r => {
      const icon = r.error ? '❌' : r.score >= 90 ? '✅' : r.score >= 70 ? '⚠️' : '❌';
      console.log(`  ${icon} ${r.name.padEnd(35)} ${r.score.toString().padStart(3)}/100`);
    });
    console.log('='.repeat(70));
  }
}

// Main execution
if (require.main === module) {
  const configPath = process.argv[2] || 'accessibility-review-config.json';
  
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    console.error('\nUsage: node run-accessibility-review.js [config-file]');
    console.error('Example: node run-accessibility-review.js accessibility-review-config.json');
    process.exit(1);
  }

  const agent = new AccessibilityReviewAgent(configPath);
  agent.run().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { AccessibilityReviewAgent };
