import { test, expect } from "@playwright/test";

test("booking page shows consultation form", async ({ page }) => {
  await page.goto("/booking");
  await expect(
    page.getByRole("heading", { name: /book a consultation/i })
  ).toBeVisible();
  await expect(page.getByLabel(/full name/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
});

test("contact page shows message form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: /conversation/i })).toBeVisible();
  await expect(page.getByLabel(/full name/i)).toBeVisible();
});
