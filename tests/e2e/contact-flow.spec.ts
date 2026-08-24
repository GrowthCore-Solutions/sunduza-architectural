import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

test.afterAll(async () => {
  await db.$disconnect();
});

test("submitting the contact form creates a real message", async ({ page }) => {
  const testEmail = `e2e-contact-${Date.now()}@example.test`;

  await page.goto("/contact");

  await page.getByLabel(/full name/i).fill("Playwright Contact User");
  await page.getByLabel(/email address/i).fill(testEmail);
  // getByLabel(/message/i) also matches the aria-label="Send a message"
  // region - scope to the textbox role to get only the real field.
  await page
    .getByRole("textbox", { name: /message/i })
    .fill("End-to-end test message submission — please disregard, automated test.");

  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10000 });

  try {
    const message = await db.contactMessage.findFirst({ where: { email: testEmail } });
    expect(message).not.toBeNull();
    expect(message?.name).toBe("Playwright Contact User");
    expect(message?.read).toBe(false);
  } finally {
    await db.contactMessage.deleteMany({ where: { email: testEmail } });
  }
});

test("contact form rejects a too-short message", async ({ page }) => {
  await page.goto("/contact");

  await page.getByLabel(/full name/i).fill("Short Message User");
  await page.getByLabel(/email address/i).fill(`e2e-short-${Date.now()}@example.test`);
  await page.getByRole("textbox", { name: /message/i }).fill("too short");

  await page.getByRole("button", { name: /send message/i }).click();

  // The hint text ("At least 10 characters...") and the validation error
  // ("Message must be at least 10 characters") both match a loose
  // /at least 10 characters/ search - scope to the actual error role.
  await expect(page.getByText(/message sent/i)).not.toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: /at least 10 characters/i })).toBeVisible();
});
