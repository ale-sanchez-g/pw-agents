// spec: devops1-test-plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Contact Form Functionality Testing', () => {
  
  test('Contact Form - Valid Submission', async ({ page }) => {
    // Navigate to contact page to test contact form functionality
    await page.goto('https://devops1.com.au/contact');

    // Fill in First Name field with valid data
    await page.getByRole('textbox', { name: 'First Name' }).fill('John');

    // Fill in Last Name field with valid data
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Smith');

    // Fill in email field with valid data
    await page.getByRole('textbox', { name: 'Email address' }).fill('john.smith@example.com');

    // Fill in phone field with valid data
    await page.getByRole('textbox', { name: 'Phone' }).fill('+61 2 1234 5678');

    // Fill in company name field with valid data
    await page.getByRole('textbox', { name: 'Company Name' }).fill('Test Company');

    // Fill in how did you hear about us field
    await page.getByRole('textbox', { name: 'How did you hear about us?' }).fill('Search Engine');

    // Verify form fields are populated correctly
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue('John');
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue('Smith');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue('john.smith@example.com');
    await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveValue('+61 2 1234 5678');
    await expect(page.getByRole('textbox', { name: 'Company Name' })).toHaveValue('Test Company');
    await expect(page.getByRole('textbox', { name: 'How did you hear about us?' })).toHaveValue('Search Engine');

    // Verify Send Message button is visible
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('Contact Form - Field Validation', async ({ page }) => {
    // Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // Verify form fields are empty initially
    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue('');

    // Test invalid email format
    await page.getByRole('textbox', { name: 'Email address' }).fill('notanemail');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue('notanemail');

    // Test clearing and re-filling fields
    await page.getByRole('textbox', { name: 'Email address' }).clear();
    await page.getByRole('textbox', { name: 'Email address' }).fill('valid@email.com');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toHaveValue('valid@email.com');

    // Test phone field with international format
    await page.getByRole('textbox', { name: 'Phone' }).fill('+1 555 123 4567');
    await expect(page.getByRole('textbox', { name: 'Phone' })).toHaveValue('+1 555 123 4567');
  });

  test('Contact Information Verification', async ({ page }) => {
    // Navigate to contact page
    await page.goto('https://devops1.com.au/contact');

    // Verify Sydney office address
    await expect(page.getByText('Mezzanine Level (North)').first()).toBeVisible();

    // Verify Sydney street address
    await expect(page.getByText('50 Carrington Street').first()).toBeVisible();

    // Verify Sydney city and state
    await expect(page.getByText('Sydney NSW 2000').first()).toBeVisible();

    // Verify Melbourne office address
    await expect(page.getByRole('heading', { name: 'Melbourne' })).toBeVisible();
    await expect(page.getByText('CBD').first()).toBeVisible();
    await expect(page.getByText('Melbourne VIC 3000').first()).toBeVisible();

    // Verify general email link is visible
    await expect(page.getByRole('link', { name: 'hello@devops1.com.au' })).toBeVisible();

    // Verify sales email link is visible
    await expect(page.getByRole('link', { name: 'sales@devops1.com.au' })).toBeVisible();

    // Verify partners email link is visible
    await expect(page.getByRole('link', { name: 'partners@devops1.com.au' })).toBeVisible();

    // Verify careers email link is visible
    await expect(page.getByRole('link', { name: 'careers@devops1.com.au' })).toBeVisible();

    // Verify location headings
    await expect(page.getByText('Sydney (Head office)')).toBeVisible();
    await expect(page.getByText('Our locations')).toBeVisible();
  });
});