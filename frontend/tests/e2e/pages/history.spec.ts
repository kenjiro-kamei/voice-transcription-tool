import { test, expect } from '@playwright/test';

test.describe('History Page', () => {
  test('should display page title', async ({ page }) => {
    await page.goto('/history');
    await expect(page).toHaveTitle(/音声・動画文字起こしツール/);
  });

  test('should display header', async ({ page }) => {
    await page.goto('/history');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should navigate to main page', async ({ page }) => {
    await page.goto('/history');
    await page.click('text=文字起こし');
    await expect(page).toHaveURL('/');
  });
});
