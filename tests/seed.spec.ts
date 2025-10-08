import { test } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Navigate to https://devops1.com.au
    await page.goto('https://devops1.com.au');
  });
});
