# 🎭 Accessibility Auditor Agent

## Overview

The Accessibility Auditor Agent is a specialized AI agent designed for comprehensive web accessibility testing using WCAG 2.2 guidelines. It combines the power of Playwright MCP for detailed DOM analysis and manual testing with Lighthouse MCP for automated accessibility scoring and recommendations.

## Key Features

### 🔍 Comprehensive Testing Approach
- **Automated Analysis**: Lighthouse accessibility audits for baseline compliance
- **Manual Testing**: Playwright-driven keyboard navigation and screen reader simulation  
- **WCAG 2.2 Focus**: Latest accessibility guidelines including mobile and cognitive considerations
- **Real-world Scenarios**: Testing actual user workflows and assistive technology interactions

### 🎯 WCAG 2.2 Compliance Focus

The agent specifically tests for WCAG 2.2 Level AA requirements, including new success criteria:

#### New WCAG 2.2 Success Criteria
- **2.4.11 Focus Not Obscured (Minimum)**: Ensures focused elements aren't hidden
- **2.4.12 Focus Not Obscured (Enhanced)**: Verifies focus indicators are fully visible  
- **2.5.7 Dragging Movements**: Tests alternatives to drag-and-drop interactions
- **2.5.8 Target Size (Minimum)**: Validates 24x24 pixel minimum touch targets
- **3.2.6 Consistent Help**: Checks help mechanism consistency across pages
- **3.3.7 Redundant Entry**: Verifies form auto-completion capabilities
- **3.3.8 Accessible Authentication (Minimum)**: Tests login accessibility
- **3.3.9 Accessible Authentication (Enhanced)**: Validates cognitive load reduction

## Usage Scenarios

### 1. E-commerce Accessibility Audit
```
"I need a comprehensive accessibility audit of our checkout process at https://shop.example.com/checkout following WCAG 2.2 guidelines"
```

**What the agent will do:**
- Navigate through the entire checkout flow
- Test form accessibility and validation
- Verify payment form accessibility
- Test keyboard navigation throughout the process
- Check mobile touch target sizes
- Validate error handling accessibility

### 2. Dashboard & Admin Interface Testing
```
"Can you test our new dashboard for accessibility compliance? It has complex data tables and interactive charts."
```

**What the agent will do:**
- Test data table accessibility (headers, captions, navigation)
- Verify chart and graph alternative text
- Test keyboard navigation through complex UI components
- Check ARIA implementation for dynamic content
- Validate focus management in single-page applications

### 3. Form-Heavy Application Audit
```
"Please audit the accessibility of our multi-step application form with file uploads and dynamic validation"
```

**What the agent will do:**
- Test form labeling and structure
- Verify file upload accessibility
- Test dynamic validation error handling
- Check progress indicator accessibility
- Validate multi-step navigation

## Testing Methodology

### Phase 1: Automated Baseline Assessment
1. **Lighthouse Accessibility Audit**
   - Runs comprehensive automated checks
   - Identifies color contrast issues
   - Detects missing alt text and ARIA labels
   - Checks heading structure and semantic markup

### Phase 2: Manual Interaction Testing
2. **Keyboard Navigation Testing**
   - Tab order verification
   - Focus indicator visibility
   - Keyboard shortcut functionality
   - Modal and dropdown escape behavior

3. **Screen Reader Simulation**
   - ARIA label and role verification
   - Landmark region testing
   - Heading hierarchy validation
   - Dynamic content announcement testing

### Phase 3: Specialized WCAG 2.2 Testing
4. **Mobile & Touch Accessibility**
   - Touch target size validation
   - Gesture alternative testing
   - Orientation and zoom functionality

5. **Cognitive & Authentication Testing**
   - Form auto-completion verification
   - Authentication flow accessibility
   - Help system consistency checks

## Report Structure

The agent generates comprehensive reports including:

### 📊 Executive Summary
- Overall accessibility score
- WCAG 2.2 compliance level
- Critical issue count
- Recommended priority actions

### 🔴 Critical Issues
- WCAG violations preventing access
- User impact assessment
- Immediate fix requirements

### 📈 Lighthouse Results
- Automated audit findings
- Performance impact of accessibility features
- Detailed recommendations with code examples

### ⌨️ Manual Test Results
- Keyboard navigation findings
- Screen reader compatibility results
- Interactive element testing outcomes

### ✅ WCAG 2.2 Compliance Matrix
- Complete checklist of applicable success criteria
- Pass/fail status for each criterion
- Evidence and test procedures

### 🔧 Remediation Guide
- Prioritized action items
- Code examples and implementations
- Testing procedures for verification

## Integration with Existing Agents

The Accessibility Auditor Agent works seamlessly with other agents in the pw-agents ecosystem:

### 🎭 Planner Agent Integration
- Use the Planner to identify critical user journeys
- Feed these journeys to the Accessibility Auditor for targeted testing
- Create accessibility-focused test scenarios

### 🎭 Generator Agent Integration
- Convert accessibility test scenarios into automated Playwright tests
- Generate regression tests for accessibility fixes
- Create ongoing accessibility monitoring

### 🎭 Healer Agent Integration
- Fix accessibility issues identified in existing tests
- Debug accessibility-related test failures
- Maintain accessibility test suite health

## Best Practices for Accessibility Testing

### 1. Test Early and Often
- Include accessibility testing in development workflow
- Test each component as it's built
- Verify fixes before deployment

### 2. Focus on User Experience
- Test with real assistive technology considerations
- Consider diverse user needs and abilities
- Prioritize issues by user impact

### 3. Maintain Accessibility Standards
- Regular audits of existing features
- Accessibility regression testing
- Team training and awareness

### 4. Document and Share Findings
- Create reusable accessibility patterns
- Share knowledge across development teams
- Build institutional accessibility expertise

## Getting Started

1. **Activate the Agent**: Use the accessibility auditor agent when you need WCAG 2.2 compliance testing
2. **Provide Target URL**: Specify the website or application to test
3. **Define Scope**: Indicate specific features or user flows to focus on
4. **Review Results**: Examine the comprehensive accessibility report
5. **Implement Fixes**: Follow the remediation guide for priority issues
6. **Retest**: Verify fixes meet accessibility standards

## Technical Requirements

### Prerequisites
- Playwright MCP configured and available
- Lighthouse MCP configured and available  
- Target website accessible for testing
- Modern browser environment

### Supported Testing Types
- ✅ Static page accessibility
- ✅ Single-page applications (SPAs)
- ✅ Form-heavy applications
- ✅ E-commerce and checkout flows
- ✅ Dashboard and admin interfaces
- ✅ Mobile-responsive designs
- ✅ Progressive web applications

The Accessibility Auditor Agent represents a comprehensive solution for modern web accessibility testing, ensuring your applications are truly accessible to all users while meeting the latest WCAG 2.2 standards.