import { test, expect } from '@playwright/test';

// Helper to select option by visible text
async function selectByText(select, text: string) {
  await select.selectOption({ label: text });
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem('ageVerified', 'true');
    window.localStorage.setItem('disableSplash', 'true');
  });
});

test('Random/Enhance/Generate buttons enable/disable logic', async ({ page }) => {
  await page.goto('/');

  // Wait for app to finish initial splash/animation and render textarea
  await page.waitForSelector('textarea#description', { state: 'visible', timeout: 15000 });

  const textarea = page.locator('textarea#description');
  const btnRandom = page.getByTestId('btn-random');
  const btnEnhance = page.getByTestId('btn-enhance');
  const btnGenerate = page.getByTestId('btn-generate');

  // Ensure Random button has rendered
  await btnRandom.waitFor({ state: 'visible', timeout: 10000 });

  // Initially textarea empty -> Enhance/Generate disabled, Random enabled
  await expect(textarea).toBeVisible();
  await expect(btnRandom).toBeEnabled();
  await expect(btnEnhance).toBeDisabled();
  await expect(btnGenerate).toBeDisabled();

  // Type something -> Enhance/Generate enabled
  await textarea.fill('a photorealistic portrait of a woman with red hair');
  await expect(btnEnhance).toBeEnabled();
  await expect(btnGenerate).toBeEnabled();

  // Do not assert API-dependent results to keep test stable without backend
});

// Keep this scenario skipped, but update selectors for consistency when/if enabled later.
test.skip('Random/Enhance/Generate buttons enable/disable logic and actions', async ({ page }) => {
  await page.goto('/');

  const textarea = page.locator('textarea#description');
  const btnRandom = page.getByTestId('btn-random');
  const btnEnhance = page.getByTestId('btn-enhance');
  const btnGenerate = page.getByTestId('btn-generate');

  // Initially textarea empty -> Enhance/Generate disabled, Random enabled
  await expect(textarea).toBeVisible();
  await expect(btnRandom).toBeEnabled();
  await expect(btnEnhance).toBeDisabled();
  await expect(btnGenerate).toBeDisabled();

  // Type something -> Enhance/Generate enabled
  await textarea.fill('a photorealistic portrait of a woman with red hair');
  await expect(btnEnhance).toBeEnabled();
  await expect(btnGenerate).toBeEnabled();

  // Click Enhance; since it calls API, we don't assert final text but can assert loading state toggles
  await Promise.all([
    page.waitForTimeout(100), // allow any state changes to start
    btnEnhance.click()
  ]);

  // Random can be clicked any time; we click it and expect textarea to change from previous content eventually
  const previous = await textarea.inputValue();
  await btnRandom.click();
  await expect(async () => {
    const current = await textarea.inputValue();
    expect(current).not.toBe(previous);
  }).toPass({ timeout: 5000 });
});

test.describe('Prompt generation with Advanced Settings (MidJourney)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open API Settings and set provider to custom_local (default) is fine, model MidJourney is selected via ModelSelector
  });

  test('Applies aspect ratio and seed, appends --no for negative prompt, blocks duplicate flags', async ({ page }) => {
    // 1) Choose MidJourney model
    const modelSelect = page.locator('#model-select');
    await expect(modelSelect).toBeVisible();
    await modelSelect.selectOption({ label: 'MidJourney' });

    // 2) Enable Advanced Settings toggle
    const advToggle = page.locator('#toggle-advanced-settings');
    await expect(advToggle).toBeVisible();
    await advToggle.click();

    // 3) Fill Advanced Settings: Negative Prompt, Aspect Ratio, Seed, Additional Params
    await page.fill('#negative-prompt', 'blurry, ugly');
    await page.selectOption('#aspect-ratio', { label: '16:9' });
    await page.fill('#seed', '12345');

    // Additional Params: include blocked flag to be sanitized
    await page.fill('#additional-params', '--style raw --chaos 10 --ar 4:3');

    // 4) Enter scene description
    await page.fill('#description', 'A majestic dragon flying over a medieval castle at sunset');

    // 5) Click Generate
    const genBtn = page.getByTestId('btn-generate');
    await expect(genBtn).toBeEnabled();
    await genBtn.click();

    // 6) Wait for prompt to render
    const variation = page.getByRole('textbox', { name: /Prompt variation 1/i });
    await expect(variation).toBeVisible();
    const text = await variation.textContent();
    expect(text).toBeTruthy();

    // 7) Assert prompt contains validated flags and excludes blocked duplicates
    expect(text!).toMatch(/--ar\s+16:9/);
    expect(text!).toMatch(/--seed\s+12345/);
    expect(text!).toMatch(/--style\s+raw/);
    expect(text!).toMatch(/--chaos\s+10/);
    // The blocked duplicate --ar 4:3 from additional-params must NOT appear
    expect(text!).not.toMatch(/--ar\s+4:3/);

    // 8) Assert negative prompt appears as separate section (header text-red-400 present) and flagged with --no in main prompt (MidJourney param style)
    const negBox = page.getByRole('textbox', { name: /Negative prompt/i });
    await expect(negBox).toBeVisible();
    const negText = await negBox.textContent();
    expect(negText).toContain('blurry');
    expect(negText).toContain('ugly');
    expect(text!).toMatch(/--no\s+blurry,\s*ugly/);
  });

  test('Shows error alert when invalid aspect ratio or negative includes flags', async ({ page }) => {
    await page.goto('/');

    // Select MidJourney
    await page.locator('#model-select').selectOption({ label: 'MidJourney' });

    // Enable Advanced Settings
    await page.locator('#toggle-advanced-settings').click();

    // Invalid AR
    await page.selectOption('#aspect-ratio', { label: '4:3' });
    // Put an illegal flag into negative
    await page.fill('#negative-prompt', 'bad anatomy --ar 1:1');

    // Provide description
    await page.fill('#description', 'Portrait of a warrior in detailed armor');

    // Generate
    const genBtn = page.getByTestId('btn-generate');
    await genBtn.click();

    // Expect alert rendered
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    const alertText = await alert.textContent();
    expect(alertText).toMatch(/Negative Prompt must not contain parameter flags/i);
  });
});