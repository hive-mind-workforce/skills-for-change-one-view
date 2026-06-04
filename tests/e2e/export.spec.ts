import { test, expect } from "@playwright/test"

test.describe("Export Page", () => {
  test("admin can access export page", async ({ page }) => {
    await page.goto("/export?role=admin")
    await expect(page.getByRole("heading", { name: /funder export/i })).toBeVisible()
  })

  test("viewer is blocked from export page", async ({ page }) => {
    await page.goto("/export?role=viewer")
    await expect(page.getByText(/access restricted/i)).toBeVisible()
  })

  test("caseworker is blocked from export page", async ({ page }) => {
    await page.goto("/export?role=caseworker")
    await expect(page.getByText(/access restricted/i)).toBeVisible()
  })

  test("all 4 funder cards are visible", async ({ page }) => {
    await page.goto("/export?role=admin")
    await expect(page.getByText("IRCC")).toBeVisible()
    await expect(page.getByText("Employment Ontario")).toBeVisible()
    await expect(page.getByText(/community foundations/i)).toBeVisible()
    await expect(page.getByText("City of Toronto")).toBeVisible()
  })

  test("selecting a funder reveals export options", async ({ page }) => {
    await page.goto("/export?role=admin")
    await page.getByText("IRCC").click()
    await expect(page.getByRole("button", { name: /download csv/i })).toBeVisible()
  })
})

test.describe("Export Page mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })
  test("export page loads on mobile", async ({ page }) => {
    await page.goto("/export?role=admin")
    await expect(page.getByText("IRCC")).toBeVisible()
  })
})
