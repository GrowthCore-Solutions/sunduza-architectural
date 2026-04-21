// ApiResponse<T> — Standardised API response wrapper
// Backend Constitution B11: All API responses use this shape
// Error codes match Backend Constitution B9: 9 error codes only in v1

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  code: string;
  status: number;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export const apiSuccess = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
});

export const apiError = (
  message: string,
  code: string,
  status = 400
): ApiError => ({
  success: false,
  message,
  code,
  status,
});

// v1 Error codes (Backend B9) — 9 codes total
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR", // 400 — Zod/validation failure
  NOT_FOUND: "NOT_FOUND", // 404 — resource not found
  UNAUTHORIZED: "UNAUTHORIZED", // 401 — not logged in
  FORBIDDEN: "FORBIDDEN", // 403 — wrong role
  INTERNAL_ERROR: "INTERNAL_ERROR", // 500 — unexpected server error
  RATE_LIMITED: "RATE_LIMITED", // 429 — too many requests
  CONFLICT: "CONFLICT", // 409 — duplicate resource
  BAD_REQUEST: "BAD_REQUEST", // 400 — malformed request
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE", // 503 — DB or external service down
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
