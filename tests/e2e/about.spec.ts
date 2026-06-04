import { test, expect } from "@playwright/test"

test.describe("About Screen", () => {
  test("navigates to /about", async ({ page }) => {
    await page.goto("/about")
    await expect(page).toHaveURL(/\/about/)
  })

  test("all 8 tabs present", async ({ page }) => {
    await page.goto("/about")
    await expect(page.getByRole("tab", { name: /about/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /architecture/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /journey/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /integrations/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /privacy/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /ai agents/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /migration/i })).toBeVisible()
    await expect(page.getByRole("tab", { name: /diagrams/i })).toBeVisible()
  })

  test("about tab shows GitHub link", async ({ page }) => {
    await page.goto("/about")
    await expect(page.getByRole("link", { name: /github/i })).toBeVisible()
  })

  test("architecture tab shows diagram", async ({ page }) => {
    await page.goto("/about")
    await page.getByRole("tab", { name: /architecture/i }).click()
    await expect(page.getByText(/Sources/i)).toBeVisible()
  })

  test("journey tab shows amara story", async ({ page }) => {
    await page.goto("/about")
    await page.getByRole("tab", { name: /journey/i }).click()
    await expect(page.getByText(/Amara/i)).toBeVisible()
  })

  test("privacy tab shows PHI wall", async ({ page }) => {
    await page.goto("/about")
    await page.getByRole("tab", { name: /privacy/i }).click()
    await expect(page.getByText(/PHI Wall/i)).toBeVisible()
  })

  test("migration tab shows phases", async ({ page }) => {
    await page.goto("/about")
    await page.getByRole("tab", { name: /migration/i }).click()
    await expect(page.getByText(/Phase/i).first()).toBeVisible()
  })

  test("diagrams tab shows mermaid diagrams", async ({ page }) => {
    await page.goto("/about")
    await page.getByRole("tab", { name: /diagrams/i }).click()
    await expect(page.getByText(/Entity/i).first()).toBeVisible()
  })
})
