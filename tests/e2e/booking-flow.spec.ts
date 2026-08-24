import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Exercises the actual revenue-critical path: a visitor submits the booking
// form and a real row lands in the database with lead scoring applied. The
// smoke tests in homepage.spec.ts/booking.spec.ts only check the form is
// visible - this checks it actually works end to end.

const db = new PrismaClient();

test.afterAll(async () => {
  await db.$disconnect();
});

test("submitting the booking form creates a real booking with a lead score", async ({ page }) => {
  const testEmail = `e2e-booking-${Date.now()}@example.test`;

  await page.goto("/booking");

  // The native radio input is visually hidden (zero-size, pointer-events:
  // none) - the styled label is the real click target, same as a sighted
  // mouse user would use.
  await page.locator('label[for="service-house_planning"]').click();
  await page.getByLabel(/full name/i).fill("Playwright Test User");
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/phone/i).fill("0821234567");
  await page.getByLabel(/project location/i).fill("Polokwane");
  await page
    .getByLabel(/project description/i)
    .fill("End-to-end test submission — a four bedroom family home on a large stand, please disregard.");
  await page.getByRole("checkbox", { name: /consent/i }).check();

  await page.getByRole("button", { name: /request consultation/i }).click();

  await expect(page.getByText(/consultation.*request submitted/i)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/reference:/i)).toBeVisible();

  try {
    const booking = await db.booking.findFirst({ where: { email: testEmail } });
    expect(booking).not.toBeNull();
    expect(booking?.name).toBe("Playwright Test User");
    expect(booking?.service).toBe("house_planning");
    expect(booking?.status).toBe("PENDING");
    expect(booking?.consentGiven).toBe(true);
    // Lead score: house_planning (25) + no budget (0) + no meeting date (0)
    // + description under 50 words (5) = 30. Asserting it's a positive,
    // computed value rather than pinning the exact formula here.
    expect(booking?.leadScore).toBeGreaterThan(0);
  } finally {
    await db.booking.deleteMany({ where: { email: testEmail } });
    await db.lead.deleteMany({ where: { email: testEmail } });
  }
});

test("booking form rejects submission without POPIA consent", async ({ page }) => {
  await page.goto("/booking");

  await page.locator('label[for="service-house_planning"]').click();
  await page.getByLabel(/full name/i).fill("No Consent User");
  await page.getByLabel(/email/i).fill(`e2e-noconsent-${Date.now()}@example.test`);
  await page.getByLabel(/phone/i).fill("0821234567");
  await page.getByLabel(/project location/i).fill("Polokwane");
  await page
    .getByLabel(/project description/i)
    .fill("Testing that the form blocks submission when consent is not given.");

  await page.getByRole("button", { name: /request consultation/i }).click();

  // Client-side Zod validation should block the request entirely - no
  // success screen, and the consent error message shown.
  await expect(page.getByText(/consultation.*request submitted/i)).not.toBeVisible();
  await expect(page.getByText(/accept the privacy policy/i)).toBeVisible();
});
