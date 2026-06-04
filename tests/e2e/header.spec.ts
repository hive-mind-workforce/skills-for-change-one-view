import { test, expect } from "@playwright/test"

test.describe("Header — desktop", () => {
  test("shows full role labels", async ({ page }) => {
    await page.goto("/?role=admin")
    await expect(page.getByRole("button", { name: "Admin" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Caseworker" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Viewer" })).toBeVisible()
  })

  test("reset button visible for admin", async ({ page }) => {
    await page.goto("/?role=admin")
    await expect(page.getByRole("button", { name: /reset/i })).toBeVisible()
  })

  test("reset button hidden for viewer", async ({ page }) => {
    await page.goto("/?role=viewer")
    await expect(page.getByRole("button", { name: /reset/i })).not.toBeVisible()
  })

  test("role switching updates active state", async ({ page }) => {
    await page.goto("/?role=admin")
    await page.getByRole("button", { name: "Caseworker" }).click()
    await expect(page).toHaveURL(/role=caseworker/)
  })

  test("llms.txt link is present", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByLabel("LLMs.txt — AI agent index")).toBeVisible()
  })
})

test.describe("Header — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("shows abbreviated role labels and no overflow", async ({ page }) => {
    await page.goto("/?role=admin")
    const header = page.locator("header")
    const box = await header.boundingBox()
    // Header should not exceed viewport width
    expect(box?.width).toBeLessThanOrEqual(375)
    await expect(page.getByRole("button", { name: "Ad" })).toBeVisible()
    await expect(page.getByRole("button", { name: "CW" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Vi" })).toBeVisible()
  })

  test("bottom nav visible on mobile", async ({ page }) => {
    await page.goto("/?role=admin")
    const nav = page.locator("nav").last()
    await expect(nav).toBeVisible()
  })
})
