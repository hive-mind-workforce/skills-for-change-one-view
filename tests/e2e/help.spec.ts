import { test, expect } from "@playwright/test"

test.describe("Help Screen", () => {
  test("all 6 tabs present", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByRole("tab", { name: /about/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /architecture/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /journey/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /integrations/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /privacy/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /ai agents/i })).toBeVisible()
  })

  test("about tab shows GitHub link", async ({ page }) => {
    await page.goto("/help")
    await expect(page.getByRole("link", { name: /github/i })).toBeVisible()
  })

  test("architecture tab shows diagram", async ({ page }) => {
    await page.goto("/help")
    await page.getByRole("tab", { name: /architecture/i }).click()
    await expect(page.getByText(/Sources/i)).toBeVisible()
  })

  test("journey tab shows amara story", async ({ page }) => {
    await page.goto("/help")
    await page.getByRole("tab", { name: /journey/i }).click()
    await expect(page.getByText(/Amara/i)).toBeVisible()
  })

  test("privacy tab shows PHI wall", async ({ page }) => {
    await page.goto("/help")
    await page.getByRole("tab", { name: /privacy/i }).click()
    await expect(page.getByText(/PHI Wall/i)).toBeVisible()
  })
})
