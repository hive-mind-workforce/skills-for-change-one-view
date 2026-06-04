import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3010",
    trace: "on-first-retry",
    screenshot: { mode: "only-on-failure", fullPage: false },
  },
  outputDir: "tests/test-results",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 3010",
    url: "http://localhost:3010",
    reuseExistingServer: true,
    timeout: 120000,
  },
})
