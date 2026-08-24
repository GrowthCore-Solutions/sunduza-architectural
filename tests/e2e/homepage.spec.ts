import { test, expect } from "@playwright/test";

test("homepage shows hero and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Book Consultation" })
  ).toBeVisible();
});

test("privacy page is reachable", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page).toHaveTitle(/privacy/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
