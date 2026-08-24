import { test, expect } from "@playwright/test";

// Covers the admin auth lifecycle end to end: this is the path that was
// completely broken (silent bounce-back, no session ever created) before
// the 2026-08-24 fix in app/api/auth/login/route.ts. A regression here
// should fail CI, not get caught by a human noticing the dashboard is empty.

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@sunduza.co.za";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "DevAdmin!2026";

test("unauthenticated visitor is redirected away from a protected admin route", async ({ page }) => {
  await page.goto("/admin/bookings");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("wrong password shows an error and does not sign in", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/email address/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill("definitely-the-wrong-password");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("correct credentials sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/email address/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

  // Session must actually persist across a fresh navigation, not just the
  // client-side router push that follows a successful login.
  await page.reload();
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

  // And the session is really gone, not just the UI state.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
