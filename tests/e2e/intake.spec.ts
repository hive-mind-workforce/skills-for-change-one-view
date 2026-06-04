import { test, expect } from "@playwright/test"

test.describe("Intake Form", () => {
  test("renders with required fields", async ({ page }) => {
    await page.goto("/intake")
    await expect(page.getByPlaceholder(/client full name/i)).toBeVisible()
  })

  test("program selector has all 8 options", async ({ page }) => {
    await page.goto("/intake")
    const programSelect = page.locator("select[name=program]")
    const options = await programSelect.locator("option").all()
    expect(options.length).toBe(8)
  })

  test("mental health selection shows PHI notice", async ({ page }) => {
    await page.goto("/intake")
    await page.locator("select").nth(2).selectOption("mental_health")
    await expect(page.getByText(/PHIPA/i)).toBeVisible()
  })

  test("submit with empty form shows validation", async ({ page }) => {
    await page.goto("/intake")
    await page.getByRole("button", { name: /register client/i }).click()
    await expect(page.getByText(/required/i)).toBeVisible()
  })
})
