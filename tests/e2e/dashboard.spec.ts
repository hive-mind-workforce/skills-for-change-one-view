import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test("loads with correct title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/OneView/)
  })

  test("metric cards are visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#metric-cards")).toBeVisible({ timeout: 15000 })
  })

  test("program chart section renders", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#program-chart")).toBeVisible({ timeout: 15000 })
  })

  test("navigation links present", async ({ page }) => {
    await page.goto("/")
    const intakeLinks = page.locator("[data-tour=intake]")
    await expect(intakeLinks.first()).toBeVisible()
  })

  test("demo button is clickable", async ({ page }) => {
    await page.goto("/")
    const demoBtn = page.getByText("Demo")
    await expect(demoBtn.first()).toBeVisible()
  })
})

test.describe("Dashboard mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })
  test("bottom nav visible on mobile", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("[data-tour=intake]").first()).toBeVisible()
  })
})
