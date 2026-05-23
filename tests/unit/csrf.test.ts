import { describe, it, expect } from "vitest";
import {
  isSafeMethod,
  isCsrfExempt,
  parseAllowedOrigins,
  verifyOrigin,
} from "@/backend/lib/csrf";

function h(record: Record<string, string>): Headers {
  const headers = new Headers();
  for (const [k, v] of Object.entries(record)) headers.set(k, v);
  return headers;
}

describe("isSafeMethod", () => {
  it.each(["GET", "get", "HEAD", "OPTIONS"])("treats %s as safe", (m) => {
    expect(isSafeMethod(m)).toBe(true);
  });
  it.each(["POST", "PUT", "PATCH", "DELETE"])("treats %s as unsafe", (m) => {
    expect(isSafeMethod(m)).toBe(false);
  });
});

describe("isCsrfExempt", () => {
  it("exempts NextAuth routes", () => {
    expect(isCsrfExempt("/api/auth/callback/credentials")).toBe(true);
    expect(isCsrfExempt("/api/auth/signin")).toBe(true);
  });
  it("exempts internal cron routes", () => {
    expect(isCsrfExempt("/api/internal/notify")).toBe(true);
  });
  it("does not exempt regular API routes", () => {
    expect(isCsrfExempt("/api/bookings")).toBe(false);
    expect(isCsrfExempt("/api/admin/bookings")).toBe(false);
    expect(isCsrfExempt("/api/contact")).toBe(false);
  });
  it("does not exempt lookalike paths", () => {
    expect(isCsrfExempt("/api/authentic-leather")).toBe(false);
    expect(isCsrfExempt("/api/internally-managed")).toBe(false);
  });
});

describe("parseAllowedOrigins", () => {
  it("returns empty for undefined or empty", () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
    expect(parseAllowedOrigins("")).toEqual([]);
  });
  it("trims and filters entries", () => {
    expect(parseAllowedOrigins("https://a.com, https://b.com ,, ")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
  });
});

describe("verifyOrigin", () => {
  it("rejects requests with no Origin header", () => {
    expect(verifyOrigin(h({ host: "sunduza.co.za" }))).toBe(false);
  });

  it("rejects malformed Origin headers", () => {
    expect(verifyOrigin(h({ origin: "not-a-url", host: "sunduza.co.za" }))).toBe(false);
  });

  it("accepts same-origin requests via Host header", () => {
    expect(
      verifyOrigin(h({ origin: "https://sunduza.co.za", host: "sunduza.co.za" }))
    ).toBe(true);
  });

  it("prefers X-Forwarded-Host over Host (proxy / Vercel)", () => {
    expect(
      verifyOrigin(
        h({
          origin: "https://sunduza.co.za",
          host: "internal-vercel-host.local",
          "x-forwarded-host": "sunduza.co.za",
        })
      )
    ).toBe(true);
  });

  it("rejects cross-origin requests by default", () => {
    expect(
      verifyOrigin(h({ origin: "https://evil.example", host: "sunduza.co.za" }))
    ).toBe(false);
  });

  it("accepts origins listed in ALLOWED_ORIGINS", () => {
    expect(
      verifyOrigin(
        h({ origin: "https://admin.sunduza.co.za", host: "sunduza.co.za" }),
        "https://admin.sunduza.co.za"
      )
    ).toBe(true);
  });

  it("accepts bare hosts listed in ALLOWED_ORIGINS", () => {
    expect(
      verifyOrigin(
        h({ origin: "https://admin.sunduza.co.za", host: "sunduza.co.za" }),
        "admin.sunduza.co.za"
      )
    ).toBe(true);
  });

  it("matches port-sensitive hosts (localhost dev)", () => {
    expect(
      verifyOrigin(h({ origin: "http://localhost:3000", host: "localhost:3000" }))
    ).toBe(true);
    expect(
      verifyOrigin(h({ origin: "http://localhost:3001", host: "localhost:3000" }))
    ).toBe(false);
  });
});
