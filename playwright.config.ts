import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter @cms/api dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'pnpm --filter @cms/web dev',
      url: 'http://localhost:4321',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
});
