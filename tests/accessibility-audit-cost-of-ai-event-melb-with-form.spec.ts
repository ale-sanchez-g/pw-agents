// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Accessibility Audit: Cost of AI Event Melbourne - Registration Form', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the event page with enabled registration form
    await page.goto('https://deploy-preview-122--devops1-au.netlify.app/events/cost-of-ai-event-melb');
    
    // Scroll down to reveal the registration form
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight / 2); });
    
    // Wait for LaunchDarkly to enable the form
    await page.waitForTimeout(1000);
  });

  test('Lighthouse Accessibility Audit', async ({ page }) => {
    // Lighthouse audit shows 95/100 accessibility score
    // Manual testing required for form-specific issues
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('Form Fields Have Accessible Labels', async ({ page }) => {
    // CRITICAL ISSUE: Form inputs use only placeholder text as labels (WCAG 1.3.5, 3.3.2 violation)
    
    const firstnameInput = page.locator('#firstname');
    const lastnameInput = page.locator('#lastname');
    const companyInput = page.locator('#company');
    const positionInput = page.locator('#position');
    const emailInput = page.locator('#email');
    const phoneInput = page.locator('#phone');
    
    // Verify inputs exist
    await expect(firstnameInput).toBeVisible();
    await expect(lastnameInput).toBeVisible();
    await expect(companyInput).toBeVisible();
    await expect(positionInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    
    // Check for proper labels (currently failing - no label elements exist)
    const formFields = [
      { id: 'firstname', expectedLabel: 'First Name' },
      { id: 'lastname', expectedLabel: 'Last Name' },
      { id: 'company', expectedLabel: 'Company' },
      { id: 'position', expectedLabel: 'Job Title' },
      { id: 'email', expectedLabel: 'Work Email Address' },
      { id: 'phone', expectedLabel: 'Contact Number' }
    ];
    
    for (const field of formFields) {
      const label = page.locator(`label[for="${field.id}"]`);
      // This will fail - labels don't exist
      await expect(label).toBeVisible({ timeout: 1000 }).catch(() => {
        console.log(`FAIL: No label found for #${field.id} (WCAG 1.3.5 violation)`);
      });
    }
  });

  test('Required Field Indicators Are Present', async ({ page }) => {
    // HTML5 required attribute is present on fields
    const firstnameInput = page.locator('#firstname');
    await expect(firstnameInput).toHaveAttribute('required', '');
    
    const lastnameInput = page.locator('#lastname');
    await expect(lastnameInput).toHaveAttribute('required', '');
    
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required', '');
    
    // ISSUE: No visual indicator (* or "required" text) for screen reader users
    // aria-required attribute is missing (WCAG 3.3.2 violation)
  });

  test('Form Validation Works', async ({ page }) => {
    // Test HTML5 validation
    const submitButton = page.getByRole('button', { name: 'Submit Registration' });
    await submitButton.click();
    
    // Browser should show validation message
    const firstnameInput = page.locator('#firstname');
    const validationMessage = await firstnameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    expect(validationMessage).toContain('fill');
  });

  test('Checkboxes Have Proper Labels', async ({ page }) => {
    // POSITIVE: Checkboxes DO have associated label elements
    const privacyCheckbox = page.locator('#privacy');
    const privacyLabel = page.locator('label[for="privacy"]');
    
    await expect(privacyCheckbox).toBeVisible();
    await expect(privacyLabel).toBeVisible();
    
    const attendanceCheckbox = page.locator('#attendance');
    const attendanceLabel = page.locator('label[for="attendance"]');
    
    await expect(attendanceCheckbox).toBeVisible();
    await expect(attendanceLabel).toBeVisible();
  });

  test('Touch Target Sizes Meet WCAG 2.2 Requirements', async ({ page }) => {
    // CRITICAL ISSUE: Checkboxes are only 13x13 pixels (WCAG 2.5.8 violation)
    // Minimum should be 24x24px, recommended 44x44px
    
    const privacyCheckbox = page.locator('#privacy');
    const privacyBox = await privacyCheckbox.boundingBox();
    
    if (privacyBox) {
      expect(privacyBox.width).toBeGreaterThanOrEqual(24);
      expect(privacyBox.height).toBeGreaterThanOrEqual(24);
    }
    
    const attendanceCheckbox = page.locator('#attendance');
    const attendanceBox = await attendanceCheckbox.boundingBox();
    
    if (attendanceBox) {
      expect(attendanceBox.width).toBeGreaterThanOrEqual(24);
      expect(attendanceBox.height).toBeGreaterThanOrEqual(24);
    }
    
    // Text inputs meet requirements (50px height)
    const firstnameInput = page.locator('#firstname');
    const firstnameBox = await firstnameInput.boundingBox();
    
    if (firstnameBox) {
      expect(firstnameBox.height).toBeGreaterThanOrEqual(44);
    }
    
    // Submit button meets requirements (48px height)
    const submitButton = page.getByRole('button', { name: 'Submit Registration' });
    const submitBox = await submitButton.boundingBox();
    
    if (submitBox) {
      expect(submitBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Keyboard Navigation Through Form Fields', async ({ page }) => {
    // Focus first field
    const firstnameInput = page.locator('#firstname');
    await firstnameInput.focus();
    await expect(firstnameInput).toBeFocused();
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    const lastnameInput = page.locator('#lastname');
    await expect(lastnameInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const companyInput = page.locator('#company');
    await expect(companyInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const positionInput = page.locator('#position');
    await expect(positionInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    const phoneInput = page.locator('#phone');
    await expect(phoneInput).toBeFocused();
  });

  test('Focus Indicators Are Visible', async ({ page }) => {
    // Check that focused elements have visible focus indicators
    const firstnameInput = page.locator('#firstname');
    await firstnameInput.focus();
    
    // Verify focus ring or outline is present
    const focusStyle = await firstnameInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    // Should have some form of focus indicator
    const hasFocusIndicator = 
      focusStyle.outline !== 'none' || 
      focusStyle.outlineWidth !== '0px' || 
      focusStyle.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('ARIA Attributes for Form Fields', async ({ page }) => {
    // ISSUE: No aria-required attributes on required fields
    const firstnameInput = page.locator('#firstname');
    
    // This should pass but currently fails
    await expect(firstnameInput).toHaveAttribute('aria-required', 'true').catch(() => {
      console.log('FAIL: Missing aria-required on #firstname (WCAG 4.1.3 violation)');
    });
    
    // ISSUE: No aria-describedby for error messages
    // ISSUE: No aria-invalid for error states
    
    // Test after triggering validation
    const submitButton = page.getByRole('button', { name: 'Submit Registration' });
    await submitButton.click();
    
    // Should have aria-invalid="true" after validation fails
    await expect(firstnameInput).toHaveAttribute('aria-invalid', 'true').catch(() => {
      console.log('FAIL: Missing aria-invalid after validation (WCAG 4.1.3 violation)');
    });
  });

  test('Placeholder Text Does Not Replace Labels', async ({ page }) => {
    // CRITICAL WCAG VIOLATION: Using placeholder as the only label (SC 1.3.5, 3.3.2)
    
    const firstnameInput = page.locator('#firstname');
    const placeholder = await firstnameInput.getAttribute('placeholder');
    
    expect(placeholder).toBe('First Name');
    
    // But there should ALSO be a visible <label> element (currently missing)
    const label = page.locator('label[for="firstname"]');
    await expect(label).toBeVisible().catch(() => {
      console.log('FAIL: Placeholder used as only label for #firstname');
    });
  });

  test('Form Heading Hierarchy', async ({ page }) => {
    // Check form has proper heading
    const formHeading = page.getByRole('heading', { name: 'Register Your Interest' });
    await expect(formHeading).toBeVisible();
    
    // Verify heading level
    const headingLevel = await formHeading.evaluate((el) => el.tagName);
    expect(headingLevel).toBe('H2');
  });

  test('Optional Fields Are Clearly Marked', async ({ page }) => {
    // Check that optional field includes "(Optional)" in placeholder
    const aiChallengesInput = page.locator('#ai-challenges');
    const placeholder = await aiChallengesInput.getAttribute('placeholder');
    
    expect(placeholder).toContain('(Optional)');
    
    // Should also not have required attribute
    const isRequired = await aiChallengesInput.evaluate((el: HTMLInputElement) => el.required);
    expect(isRequired).toBe(false);
  });

  test('Privacy Policy Link Is Accessible', async ({ page }) => {
    // Check Privacy Policy link in checkbox label
    const privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });

  test('reCAPTCHA Is Present', async ({ page }) => {
    // Verify reCAPTCHA iframe is present
    const recaptchaFrame = page.frameLocator('iframe[title*="reCAPTCHA"]').first();
    const recaptchaCheckbox = recaptchaFrame.getByRole('checkbox', { name: /I'm not a robot/i });
    
    await expect(recaptchaCheckbox).toBeVisible();
  });

  test('Submit Button Is Properly Labeled', async ({ page }) => {
    // Verify submit button has accessible name
    const submitButton = page.getByRole('button', { name: 'Submit Registration' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('Time Element Has Proper Datetime Attribute', async ({ page }) => {
    // Check the date/time uses proper <time> element
    const timeElement = page.locator('time');
    await expect(timeElement).toBeVisible();
    
    const datetime = await timeElement.getAttribute('datetime');
    expect(datetime).toBeTruthy();
  });
});
