import { describe, it, expect } from "vitest";
import { ContactMessageSchema } from "@/shared/types/contact";

// Regression test for the 2026-08-24 incident: an unfilled optional phone
// input submits "" (not undefined). The schema correctly accepts "" as
// "no phone provided" (that's what this test locks in) - but the empty
// string must not reach the database unchanged: it used to violate the
// phone_min_length CHECK constraint (phone IS NULL OR length >= 10), a 500
// that silently dropped the visitor's message. The actual normalization
// (empty string -> null) lives in src/backend/services/contact.ts and is
// covered by tests/e2e/contact-flow.spec.ts, which exercises the real
// database write - a schema-level unit test can't see a DB constraint.

describe("ContactMessageSchema phone validation", () => {
  const base = {
    name: "Jane Dlamini",
    email: "jane@example.com",
    message: "This is a perfectly valid enquiry message, ten-plus chars.",
  };

  it("accepts an empty-string phone as valid (means not provided)", () => {
    expect(() => ContactMessageSchema.parse({ ...base, phone: "" })).not.toThrow();
  });

  it("accepts an omitted phone as valid", () => {
    expect(() => ContactMessageSchema.parse({ ...base })).not.toThrow();
  });

  it("still rejects a too-short (but non-empty) phone", () => {
    expect(() => ContactMessageSchema.parse({ ...base, phone: "12345" })).toThrow();
  });

  it("accepts a valid phone unchanged", () => {
    const result = ContactMessageSchema.parse({ ...base, phone: "0821234567" });
    expect(result.phone).toBe("0821234567");
  });
});
