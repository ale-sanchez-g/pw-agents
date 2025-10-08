// spec: devops1-test-plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Interactive Elements and External Links', () => {
  
  test('External Partner Links', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Verify client logos section
    await expect(page.getByText('Our trusted clients')).toBeVisible();
    
    // Verify specific client logos are visible
    await expect(page.getByRole('img', { name: 'Reserve Bank of Australia' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'ACS' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Digital Health' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Optus' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Macquarie' })).toBeVisible();

    // Verify Technology Partners section
    await expect(page.getByText('Technology Partners')).toBeVisible();
    
    // Verify technology partner logos
    await expect(page.getByRole('img', { name: 'GitLab' }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: 'Atlassian' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'AWS' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'dynatrace' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'HashiCorp' })).toBeVisible();

    // Verify View all partners link
    await expect(page.getByRole('link', { name: 'View all partners' })).toBeVisible();

    // Verify Buy in AWS button functionality
    const buyInAwsLink = page.getByRole('link', { name: 'Buy in AWS' });
    await expect(buyInAwsLink).toBeVisible();
    await expect(buyInAwsLink).toHaveAttribute('href', 'https://aws.amazon.com/marketplace/seller-profile?id=0e63f3e3-6942-4852-aee5-973e4559d60b');

    // Verify partner award links
    await expect(page.getByText('DevOps1 is proud to share that we\'ve been named the 2024 GitLab APAC Partner of the Year')).toBeVisible();
  });

  test('Digital Immunity System Interaction', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Locate Digital Immune System section
    await expect(page.getByRole('heading', { name: 'Digital Immune System' })).toBeVisible();

    // Verify all four pillars are clickable and visible
    const anticipatePillar = page.locator('.pillar').filter({ hasText: 'Anticipate' }).first();
    await expect(anticipatePillar).toBeVisible();

    const secureAssurePillar = page.locator('.pillar').filter({ hasText: 'Secure' }).filter({ hasText: 'Assure' }).first();
    await expect(secureAssurePillar).toBeVisible();

    const adaptEvolvePillar = page.locator('.pillar').filter({ hasText: 'Adapt' }).filter({ hasText: 'Evolve' }).first();
    await expect(adaptEvolvePillar).toBeVisible();

    const cloudPlatformPillar = page.getByRole('heading', { name: 'Digital Immune System' }).locator('..').getByText('Cloud & Platform').first();
    await expect(cloudPlatformPillar).toBeVisible();

    // Test clicking on different pillars to verify navigation works
    await anticipatePillar.click();
    
    // Verify we're on the Anticipate page with expected content
    await expect(page).toHaveURL('https://devops1.com.au/services/anticipate');
    await expect(page.getByRole('heading', { name: 'Anticipate', exact: true })).toBeVisible();
    await expect(page.getByText('What it is')).toBeVisible();
    await expect(page.getByText('Why it matters')).toBeVisible();
    
    // Navigate back to homepage for the next test sections
    await page.goto('https://devops1.com.au');

    // Verify Digital Immunity Services section with detailed service lists
    await expect(page.getByText('Digital Immunity Services')).toBeVisible();
    await expect(page.getByText('Observability & SRE')).toBeVisible();
    await expect(page.getByText('Quality Engineering').first()).toBeVisible();
    await expect(page.getByText('Data Excellence')).toBeVisible();
  });

  test('Engagement Model Navigation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://devops1.com.au');

    // Verify Tailored engagement models section
    await expect(page.getByText('Tailored engagement models to suit your needs')).toBeVisible();

    // Verify Advise engagement model
    await expect(page.getByRole('heading', { name: 'Advise' })).toBeVisible();
    await expect(page.getByText('Providing expert advice to optimise and transform your business operations.')).toBeVisible();
    
    // Verify Optimise engagement model
    await expect(page.getByRole('heading', { name: 'Optimise' })).toBeVisible();
    await expect(page.getByText('Maximising efficiency, security, and agility in digital solution delivery')).toBeVisible();

    // Verify Accelerate engagement model
    await expect(page.getByRole('heading', { name: 'Accelerate' })).toBeVisible();
    await expect(page.getByText('These programs are designed to empower organisations to stay competitive')).toBeVisible();

    // Test navigation to Advise page
    const adviseLink = page.getByRole('link', { name: 'devops_1 way' }).first();
    await expect(adviseLink).toHaveAttribute('href', '/engage/advise');

    // Test navigation to Optimise page
    const optimiseLink = page.getByRole('link', { name: 'devops_1 way' }).nth(1);
    await expect(optimiseLink).toHaveAttribute('href', '/engage/optimise');

    // Test navigation to Accelerate page
    const accelerateLink = page.getByRole('link', { name: 'devops_1 way' }).nth(2);
    await expect(accelerateLink).toHaveAttribute('href', '/services/accelerate');

    // Test navigation back to homepage using logo
    await accelerateLink.click();
    await page.getByRole('navigation').getByRole('link', { name: 'DevOps1' }).click();
    await expect(page).toHaveURL('https://devops1.com.au/');
  });
});