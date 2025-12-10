import { test, expect } from '@playwright/test';

test.describe('Transcription Main Page', () => {
  test('should display page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/音声・動画文字起こしツール/);
  });

  test('should display header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('音声・動画文字起こしツール');
  });

  test('should navigate to history page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=履歴');
    await expect(page).toHaveURL('/history');
  });
});
