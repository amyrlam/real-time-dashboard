import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end keyboard-accessibility checks against the real built app.
 *
 * These run in a real browser because that's the only place a genuine tab
 * order exists: jsdom has no layout and only approximates focus navigation,
 * and axe (see `.storybook/test-runner.ts`) audits a static snapshot rather
 * than walking the page the way a keyboard user does.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Test the production build, not the dev server — that's what users get.
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
