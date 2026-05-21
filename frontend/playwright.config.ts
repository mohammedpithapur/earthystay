import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results/playwright/output',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/playwright/results.xml' }],
    ['html', { outputFolder: 'test-results/playwright/html', open: 'never' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --hostname 0.0.0.0 --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
