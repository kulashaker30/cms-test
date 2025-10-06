import { test, expect } from '@playwright/test';

test('register, login, header reflects auth', async ({ page }) => {
    await page.goto('/auth/register');
    const email = `ui${Date.now()}@test.com`;

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('Passw0rd!');
    await page.getByRole('button', { name: /create account/i }).click();

    // redirected home (or login if that’s your flow). Go to login explicitly:
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('Passw0rd!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/');
    // Header should show user menu (no "Sign in")
    await expect(page.getByText(/sign in/i)).toHaveCount(0);
});
