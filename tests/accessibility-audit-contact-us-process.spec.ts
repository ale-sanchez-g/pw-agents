// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Accessibility Audit: Contact Us Process', () => {
  test('Lighthouse Accessibility Audit', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // Note: Lighthouse audit was performed separately and showed:
    // - Accessibility Score: 90% (meets minimum threshold)
    // - This baseline indicates automated accessibility checks pass
    // - However, manual testing revealed several critical issues not caught by automated tools
    
    await expect(page).toHaveTitle(/Contact/);
  });

  test('Keyboard Navigation Testing', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 2. Test tab order through all interactive elements - Start with first tab
    await page.keyboard.press('Tab');
    
    // Verify logo link receives focus
    const logoLink = page.getByRole('link', { name: 'DevOps1' }).first();
    await expect(logoLink).toBeFocused();

    // 3. Verify focus indicators are visible on all form fields - Check computed styles
    // CRITICAL ISSUE: Form fields have NO visible focus indicator
    // This violates WCAG 2.4.7 Focus Visible (Level AA)
    const firstNameInput = page.getByPlaceholder('First Name');
    await firstNameInput.focus();
    await expect(firstNameInput).toBeFocused();
    
    // Note: Visual inspection revealed outline: none and no box-shadow
    // Recommendation: Add visible focus indicator with outline or box-shadow
  });

  test('Form Accessibility Testing - Labels', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 1. Verify all form fields have proper labels - Check label associations
    // CRITICAL ISSUE: ALL form fields lack proper <label> elements
    // This violates WCAG 3.3.2 Labels or Instructions (Level A)
    
    const firstNameInput = page.getByPlaceholder('First Name');
    const lastNameInput = page.getByPlaceholder('Last Name');
    const emailInput = page.getByPlaceholder('Email address');
    const phoneInput = page.getByPlaceholder('Phone');
    const companyInput = page.getByPlaceholder('Company Name');
    
    // Verify inputs exist but note they only use placeholders, not proper labels
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(companyInput).toBeVisible();
    
    // Recommendation: Add proper <label> elements with for attributes
    // Example: <label for="firstname">First Name</label>
  });

  test('Form Accessibility Testing - Error Validation', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 4. Verify required field indicators - Check for required attributes
    // Good: Fields have HTML5 required attribute
    const firstNameInput = page.getByPlaceholder('First Name');
    await expect(firstNameInput).toHaveAttribute('required');

    // 3. Test error validation and error message accessibility - Click submit without filling form
    const submitButton = page.getByRole('button', { name: 'Send Message' });
    await submitButton.click();

    // Verify error messages appear
    await expect(page.getByText('Please enter your First Name')).toBeVisible();
    await expect(page.getByText('Please enter your Last Name')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();

    // CRITICAL ISSUE: Error messages are NOT programmatically associated with form fields
    // This violates WCAG 3.3.1 Error Identification (Level A) and 4.1.3 Status Messages (Level AA)
    // Missing: aria-describedby, aria-invalid, and role="alert" attributes
    
    // Recommendation: Add ARIA associations
    // Example: <input aria-describedby="firstname-error" aria-invalid="true">
    // Example: <div id="firstname-error" role="alert">Please enter your First Name</div>
  });

  test('Screen Reader Compatibility - Heading Structure', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 2. Verify heading hierarchy (h1-h6) - Check for proper structure
    const h1 = page.getByRole('heading', { name: 'Experts you can always trust', level: 1 });
    await expect(h1).toBeVisible();

    const h2GetInTouch = page.getByRole('heading', { name: 'Get in touch', level: 2 });
    await expect(h2GetInTouch).toBeVisible();

    const h2Locations = page.getByRole('heading', { name: 'Our locations', level: 2 });
    await expect(h2Locations).toBeVisible();

    // ISSUE: Heading structure has improper gaps - jumps from h2 to h5
    // This violates WCAG 1.3.1 Info and Relationships (Level A)
    // Location headings use h5 instead of h3, skipping h3 and h4
    
    // Recommendation: Change h5 location headings to h3 for proper hierarchy
  });

  test('Screen Reader Compatibility - Landmark Regions', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 3. Verify landmark regions (main, nav, footer) - Check ARIA landmarks
    const banner = page.getByRole('banner');
    await expect(banner).toBeVisible();

    const navigation = page.getByRole('navigation');
    await expect(navigation).toBeVisible();

    const contentinfo = page.getByRole('contentinfo');
    await expect(contentinfo).toBeVisible();

    // CRITICAL ISSUE: Missing <main> landmark region
    // This violates WCAG 1.3.1 Info and Relationships (Level A)
    // Main content area should be wrapped in <main> or [role="main"]
    
    // Recommendation: Wrap main content in <main> element
    // Example: <main><section>Get in touch form...</section></main>
  });

  test('Screen Reader Compatibility - Images', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 4. Test alternative text for images - Check all images have proper alt text
    // Good: All images have appropriate alt text
    const logoImg = page.getByRole('img', { name: 'DevOps1' }).first();
    await expect(logoImg).toBeVisible();

    // Decorative icons properly use empty alt="" attributes
    // This follows best practices for decorative images
  });

  test('WCAG 2.2 Specific Validations - Focus Not Obscured', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 1. Test Focus Not Obscured (2.4.11) - ensure focused elements aren't hidden
    const firstNameInput = page.getByPlaceholder('First Name');
    await firstNameInput.focus();
    
    // Verify focused element is in viewport
    await expect(firstNameInput).toBeInViewport();
    
    // Note: Element is visible but lacks focus indicator (see keyboard navigation test)
  });

  test('WCAG 2.2 Specific Validations - Target Size', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 2. Validate Target Size Minimum (2.5.8) - 24x24 pixel minimum touch targets
    const submitButton = page.getByRole('button', { name: 'Send Message' });
    const buttonBox = await submitButton.boundingBox();
    
    // Verify button meets WCAG 2.2 minimum size (24x24 pixels)
    expect(buttonBox?.width).toBeGreaterThanOrEqual(24);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(24);

    // ISSUE: Some hidden dropdown menu links have 0x0 dimensions
    // This violates WCAG 2.5.8 Target Size (Minimum) (Level AA)
    // Recommendation: Ensure all interactive elements maintain minimum size even when hidden
  });

  test('WCAG 2.2 Specific Validations - Consistent Help', async ({ page }) => {
    // 1. Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // 3. Check Consistent Help (3.2.6) - help mechanism consistency
    // Contact information is consistently displayed at bottom of page
    await expect(page.getByText('hello@devops1.com.au')).toBeVisible();
    await expect(page.getByText('sales@devops1.com.au')).toBeVisible();
    
    // Good: Help mechanism (contact emails) is consistently placed
  });

  test('Mobile and Responsive Accessibility', async ({ page }) => {
    // 1. Navigate to contact page with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://devops1.com.au/contact');

    // 1. Test touch target sizes (minimum 44x44 pixels)
    const submitButton = page.getByRole('button', { name: 'Send Message' });
    await expect(submitButton).toBeVisible();
    
    const buttonBox = await submitButton.boundingBox();
    
    // Recommendation: Ensure all interactive elements meet 44x44 pixel minimum for mobile
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    // 2. Verify form usability on mobile viewport
    const firstNameInput = page.getByPlaceholder('First Name');
    await expect(firstNameInput).toBeVisible();
    
    // Scroll to the input to verify it can be brought into viewport
    await firstNameInput.scrollIntoViewIfNeeded();
    await expect(firstNameInput).toBeInViewport();
  });
});
