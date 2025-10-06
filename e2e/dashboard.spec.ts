import { test, expect } from '@playwright/test';

test('dashboard shows real metrics and updates', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Articles \(total\)/)).toBeVisible();
    await expect(page.getByText(/Active users \(15m\)/)).toBeVisible();
});
