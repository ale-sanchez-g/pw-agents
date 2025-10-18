// spec: devops1-test-plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Website Navigation and Content Exploration', () => {
  
  test('Homepage Content Verification', async ({ page }) => {
    // Navigate to https://devops1.com.au
    await page.goto('https://devops1.com.au');

    // Verify the DevOps1 logo is displayed in navigation
    await expect(page.getByRole('navigation').getByRole('img', { name: 'DevOps1' })).toBeVisible();

    // Verify Services link in navigation menu
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();

    // Verify Engage link in navigation menu
    await expect(page.getByRole('link', { name: 'Engage' })).toBeVisible();

    // Verify Projects button in navigation menu
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();

    // Verify Company link in navigation menu
    await expect(page.getByRole('link', { name: 'Company' })).toBeVisible();

    // Verify FluxQE button in navigation menu
    await expect(page.getByRole('button', { name: 'FluxQE' })).toBeVisible();

    // Verify Contact us button in top right
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Contact us' })).toBeVisible();

    // Verify Buy in AWS button in top right
    await expect(page.getByRole('link', { name: 'Buy in AWS' })).toBeVisible();

    // Verify Digital Immune System section heading
    await expect(page.getByRole('heading', { name: 'Digital Immune System' })).toBeVisible();

    // Verify Anticipate pillar is visible
    await expect(page.locator('.pillar').filter({ hasText: 'Anticipate' }).first()).toBeVisible();

    // Verify Secure & Assure pillar is visible
    await expect(page.locator('.pillar').filter({ hasText: 'Secure' }).filter({ hasText: 'Assure' }).first()).toBeVisible();

    // Verify Adapt & Evolve pillar is visible
    await expect(page.locator('.pillar').filter({ hasText: 'Adapt' }).filter({ hasText: 'Evolve' }).first()).toBeVisible();

    // Verify Cloud & Platform pillar is visible
    await expect(page.getByRole('heading', { name: 'Digital Immune System' }).locator('..').getByText('Cloud & Platform').first()).toBeVisible();
  });

  test('Services Navigation and Content', async ({ page }) => {
    // Navigate to https://devops1.com.au
    await page.goto('https://devops1.com.au');

    // Click on Services in main navigation to open dropdown
    await page.getByRole('link', { name: 'Services' }).click();

    // Verify Build Digital Immunity appears in Services dropdown
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Build Digital Immunity' })).toBeVisible();

    // Verify Cloud & Platform Engineering appears in Services dropdown
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Cloud & Platform Engineering' })).toBeVisible();

    // Verify Security Engineering appears in Services dropdown
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Security Engineering' })).toBeVisible();

    // Verify Quality & Observability appears in Services dropdown
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Quality & Observability' })).toBeVisible();

    // Navigate to Build Digital Immunity service page
    await page.getByRole('navigation').getByRole('link', { name: 'Build Digital Immunity' }).click();

    // Verify Digital Immunity page heading
    await expect(page.getByRole('heading', { name: 'Digital Immunity' })).toBeVisible();

    // Verify Choose your path to immunity section
    await expect(page.getByText('Choose your path to immunity')).toBeVisible();
  });

  test('Company Information Navigation', async ({ page }) => {
    // Navigate to the About page to test company information
    await page.goto('https://devops1.com.au/about');

    // Verify We are technology obsessed heading on About page
    await expect(page.getByText('We are technology obsessed')).toBeVisible();

    // Verify Our team section is visible
    await expect(page.getByRole('heading', { name: 'Our team' })).toBeVisible();

    // Verify Our core values section is visible
    await expect(page.getByText('Our core values')).toBeVisible();
  });
});