import { expect, test } from '@playwright/test';

test('basic test example', async ({ page }) => {
  // Navigate to a webpage
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('example AI agent test', async ({ page }) => {
  // This is a placeholder for AI agent testing
  await page.goto('https://example.com');
  
  // Check if page loaded successfully
  await expect(page).toHaveTitle(/Example/);
  
  // Example of form interaction that could be used for AI agents
  const searchBox = page.locator('input[type="search"], input[name="q"], input[placeholder*="search" i]');
  if (await searchBox.count() > 0) {
    await searchBox.fill('AI agent test');
    await page.keyboard.press('Enter');
  }
});