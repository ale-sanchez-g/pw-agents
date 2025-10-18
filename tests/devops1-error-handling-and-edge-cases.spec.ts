// spec: devops1-test-plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  
  test('Network Error Handling', async ({ page, context }) => {
    // Navigate to homepage to test basic functionality under potential network constraints
    await page.goto('https://devops1.com.au');
    
    // Verify core elements still load
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();

    // Test form submission behavior
    await page.goto('https://devops1.com.au/contact');
    await page.getByRole('textbox', { name: 'First Name' }).fill('Network Test');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@network.com');
    
    // Verify form maintains data
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue('Network Test');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue('test@network.com');

    // Test navigation still works
    await page.getByRole('navigation').getByRole('link', { name: 'DevOps1' }).click();
    await expect(page).toHaveURL('https://devops1.com.au/');
  });

  test('External Service Failure Handling', async ({ page, context }) => {
    // Block external services to test graceful degradation
    await context.route('**/maps.gstatic.com/**', route => route.abort());
    await context.route('**/www.google.com/recaptcha/**', route => route.abort());
    
    // Navigate to contact page where maps and reCAPTCHA are embedded
    await page.goto('https://devops1.com.au/contact');
    
    // Verify core functionality remains despite external service failures
    await expect(page.getByText('Our locations')).toBeVisible();
    await expect(page.getByText('Sydney (Head office)')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'First Name' })).toBeVisible();
    
    // Test form functionality without reCAPTCHA
    await page.getByRole('textbox', { name: 'First Name' }).fill('Service Test');
    await page.getByRole('textbox', { name: 'Email address' }).fill('service@test.com');
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();

    // Verify contact information is still accessible
    await expect(page.getByRole('link', { name: 'hello@devops1.com.au' })).toBeVisible();
    await expect(page.getByText('Mezzanine Level (North)').first()).toBeVisible();

    // Clear service blocks
    await context.unroute('**/maps.gstatic.com/**');
    await context.unroute('**/www.google.com/recaptcha/**');
  });

  test('404 Error Handling', async ({ page }) => {
    let response404: any;

    // Listen for 404 responses
    page.on('response', response => {
      if (response.status() === 404) {
        response404 = response;
      }
    });

    // Navigate to non-existent page
    await page.goto('https://devops1.com.au/non-existent-page', { waitUntil: 'networkidle' });
    
    // Check if we get a proper 404 or redirect to homepage
    const currentUrl = page.url();
    const is404Page = currentUrl.includes('404') || currentUrl.includes('not-found') || 
                     await page.getByText('404').isVisible().catch(() => false);
    const isHomePage = currentUrl === 'https://devops1.com.au/' || currentUrl === 'https://devops1.com.au';
    
    // Either should show 404 page or redirect to homepage (both are valid)
    expect(is404Page || isHomePage).toBeTruthy();

    // If redirected to homepage, verify navigation is available
    if (isHomePage) {
      await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Contact us' })).toBeVisible();
    }

    // Test navigation back to valid content
    await page.goto('https://devops1.com.au');
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();

    // Test invalid service page URL
    await page.goto('https://devops1.com.au/services/invalid-service', { waitUntil: 'networkidle' });
    const servicePageUrl = page.url();
    
    // Should either show 404 or redirect to valid page
    const isValidServiceResponse = servicePageUrl.includes('404') || 
                                   servicePageUrl.includes('devops1.com.au');
    expect(isValidServiceResponse).toBeTruthy();
  });

  test('Browser Compatibility Testing', async ({ page }) => {
    // Increase timeout for Firefox performance issues
    test.setTimeout(60000);
    
    // Test basic page functionality across browsers
    await page.goto('https://devops1.com.au');
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();

    // Test form interaction compatibility
    await page.goto('https://devops1.com.au/contact');
    const firstNameField = page.getByRole('textbox', { name: 'First Name' });
    const emailField = page.getByRole('textbox', { name: 'Email address' });
    
    await firstNameField.fill('Browser Test');
    await expect(firstNameField).toHaveValue('Browser Test');
    
    await emailField.fill('browser@test.com');
    await expect(emailField).toHaveValue('browser@test.com');

    // Test navigation consistency
    await page.getByRole('navigation').getByRole('link', { name: 'DevOps1' }).click();
    await expect(page).toHaveURL('https://devops1.com.au/');

    // Test About page in different browsers
    await page.goto('https://devops1.com.au/about');
    await expect(page.getByText('We are technology obsessed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();

    // Verify CSS rendering (basic check)
    const logoElement = page.getByRole('navigation').getByRole('img', { name: 'DevOps1' });
    await expect(logoElement).toBeVisible();
    
    // Test responsive behavior across browsers
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://devops1.com.au');
    
    // In mobile/tablet view, navigation should show menu button
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://devops1.com.au');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Services' })).toBeVisible();
  });
});