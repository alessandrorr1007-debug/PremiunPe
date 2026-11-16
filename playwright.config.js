import { defineConfig, devices } from '@playwright/test';

const mobileTests = '**/{responsive,social-links,promotions}.spec.js';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  workers: 2,
  timeout: 60000,
  expect: { timeout: 12000 },
  use: {
    baseURL: 'http://127.0.0.1:4183',
    channel: process.env.PREMIUMPE_BROWSER_CHANNEL || undefined,
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
    actionTimeout: 12000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'android', testMatch: mobileTests, use: { ...devices['Pixel 7'] } },
    { name: 'iphone', testMatch: mobileTests, use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
    { name: 'tablet', testMatch: mobileTests, use: { ...devices['iPad Mini'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run build -- --mode qa --outDir dist-qa && npm run preview -- --outDir dist-qa --host 127.0.0.1 --port 4183 --strictPort',
    timeout: 180000,
    url: 'http://127.0.0.1:4183',
    env: {
      VITE_SUPABASE_URL: 'https://premiumpe-qa.invalid',
      VITE_SUPABASE_ANON_KEY: 'fake-browser-key',
    },
  },
});
