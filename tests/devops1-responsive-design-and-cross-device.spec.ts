// spec: devops1-test-plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Responsive Design and Cross-Device Testing', () => {
  
  test('Desktop Responsiveness (1920x1080)', async ({ page }) => {
    // Set viewport to desktop resolution
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Verify navigation menu layout at desktop resolution
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Engage' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Company' })).toBeVisible();

    // Navigate to About page and verify layout
    await page.goto('https://devops1.com.au/about');
    await expect(page.getByText('We are technology obsessed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();

    // Navigate to Contact page and verify form layout
    await page.goto('https://devops1.com.au/contact');
    await expect(page.getByRole('textbox', { name: 'First Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();

    // Verify footer content organization
    await expect(page.getByRole('contentinfo').getByText('Services', { exact: true })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText('Engage', { exact: true })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText('Company', { exact: true })).toBeVisible();

    // Check for no horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1920);
  });

  test('Tablet Responsiveness (768x1024)', async ({ page }) => {
    // Set viewport to tablet resolution (iPad portrait)
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Verify navigation menu behavior
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

    // Test contact form usability on tablet
    await page.goto('https://devops1.com.au/contact');
    
    // Verify form fields are accessible and properly sized
    const firstNameField = page.getByRole('textbox', { name: 'First Name' });
    await expect(firstNameField).toBeVisible();
    await firstNameField.fill('Tablet Test');
    await expect(firstNameField).toHaveValue('Tablet Test');

    const emailField = page.getByRole('textbox', { name: 'Email address' });
    await expect(emailField).toBeVisible();
    await emailField.fill('tablet@test.com');
    await expect(emailField).toHaveValue('tablet@test.com');

    // Check team member grid layout on About page
    await page.goto('https://devops1.com.au/about');
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();
    await expect(page.getByText('Alex Rea')).toBeVisible();
    await expect(page.getByText('CEO')).toBeVisible();

    // Verify map functionality and touch interactions
    await page.goto('https://devops1.com.au/contact');
    await expect(page.getByText('Our locations')).toBeVisible();
    await expect(page.getByText('Sydney (Head office)')).toBeVisible();

    // Check content reflows without overlap
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768);
  });

  test('Mobile Responsiveness (375x667)', async ({ page }) => {
    // Set viewport to mobile resolution (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Verify mobile navigation functionality
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();
    
    // Test mobile navigation menu
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Menu' }).click();
    
    // After clicking menu, Services should be available
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await page.getByRole('link', { name: 'Services' }).click();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Build Digital Immunity' })).toBeVisible();

    // Verify contact form is usable on mobile
    await page.goto('https://devops1.com.au/contact');
    
    // Test form field interactions on mobile
    const mobileFirstName = page.getByRole('textbox', { name: 'First Name' });
    await expect(mobileFirstName).toBeVisible();
    await mobileFirstName.fill('Mobile Test');
    await expect(mobileFirstName).toHaveValue('Mobile Test');

    const mobileEmail = page.getByRole('textbox', { name: 'Email address' });
    await expect(mobileEmail).toBeVisible();
    await mobileEmail.fill('mobile@test.com');
    await expect(mobileEmail).toHaveValue('mobile@test.com');

    // Verify content stacks vertically without overlap
    await expect(page.getByText('Get in touch')).toBeVisible();
    await expect(page.getByText('Our locations')).toBeVisible();

    // Test team member profiles display on mobile
    await page.goto('https://devops1.com.au/about');
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();
    await expect(page.getByText('Alex Rea')).toBeVisible();

    // Verify footer links remain functional
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();

    // Ensure no horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);

    // Verify loading times remain reasonable (basic check)
    const startTime = Date.now();
    await page.goto('https://devops1.com.au/');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds on mobile
  });
});