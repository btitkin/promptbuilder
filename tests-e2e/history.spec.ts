import { test, expect } from '@playwright/test';

// Utility: seed localStorage before app loads
const seedHistory = [
  'A serene landscape with mountains and a lake',
  'Cyberpunk city at night, neon lights, rain',
  'Portrait of a woman with red hair, soft light'
];

test.describe('History panel', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript((data) => {
      window.localStorage.setItem('promptHistory', JSON.stringify(data));
      window.localStorage.setItem('ageVerified', 'true');
      window.localStorage.setItem('disableSplash', 'true');
    }, seedHistory);
  });

  test('shows history, allows selecting, and can clear with confirm', async ({ page }) => {
    await page.goto('/');

    // Wait until history is rendered
    await page.waitForSelector('text=History', { state: 'visible', timeout: 15000 });

    // Entries should be visible
    for (const item of seedHistory) {
      await expect(page.getByText(new RegExp(item.split(' ').slice(0, 4).join(' '), 'i'))).toBeVisible();
    }

    // Click first entry (button with title)
    const firstEntry = page.locator('button[title="Click to use this prompt"]').first();
    await firstEntry.click();

    // The textarea should now contain the clicked prompt
    const textarea = page.locator('textarea#description');
    await expect(textarea).toHaveValue(seedHistory[0]);

    // Clear history triggers confirm
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Clear all history?');
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Clear history' }).click();

    // After clearing, the History component returns null, so header disappears
    await expect(page.getByText('History')).toHaveCount(0);
  });
});