import { describe, it, expect } from "vitest";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";

describe("api-response", () => {
  it("apiSuccess wraps data", () => {
    const res = apiSuccess({ id: "1" });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: "1" });
  });

  it("apiError nests error shape", () => {
    const res = apiError("Bad", ErrorCode.VALIDATION_ERROR, 400);
    expect(res.success).toBe(false);
    expect(res.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(res.error.status).toBe(400);
  });
});
