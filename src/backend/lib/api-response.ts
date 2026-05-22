// Sunduza API Response Helpers
// Constitutional response shapes (S2.19, S2.20, S2.21, S2.22, S6.21)
// All API routes use these helpers — never return raw objects

// ── Success shapes ─────────────────────────────────────────────────────────────

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiListSuccess<T = unknown> = {
  success: true;
  data: T[];
  count: number;
  page: number;
  totalPages: number;
};

// ── Error shape ────────────────────────────────────────────────────────────────
// S2.22 + S6.21: error is nested under 'error' key, never at root level

export type ApiError = {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    status: number;
    details?: unknown;
  };
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
export type ApiListResponse<T = unknown> = ApiListSuccess<T> | ApiError;

// ── Error codes ────────────────────────────────────────────────────────────────
// S2.22 — machine-readable constants, never freeform strings

export const ErrorCode = {
  VALIDATION_ERROR:     "VALIDATION_ERROR",     // 400 — Zod validation failure
  BAD_REQUEST:          "BAD_REQUEST",           // 400 — malformed request
  UNAUTHORIZED:         "UNAUTHORIZED",          // 401 — not authenticated
  FORBIDDEN:            "FORBIDDEN",             // 403 — authenticated but not allowed
  NOT_FOUND:            "NOT_FOUND",             // 404 — resource does not exist
  CONFLICT:             "CONFLICT",              // 409 — duplicate or constraint violation
  RATE_LIMIT_EXCEEDED:  "RATE_LIMIT_EXCEEDED",   // 429 — too many requests
  INTERNAL_ERROR:       "INTERNAL_SERVER_ERROR", // 500 — unexpected server error
  SERVICE_UNAVAILABLE:  "SERVICE_UNAVAILABLE",   // 503 — database or external service down
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ── Helpers ────────────────────────────────────────────────────────────────────

export const apiSuccess = <T>(data: T, message?: string): ApiSuccess<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

export const apiList = <T>(
  data: T[],
  count: number,
  page: number,
  pageSize: number
): ApiListSuccess<T> => ({
  success: true,
  data,
  count,
  page,
  totalPages: Math.ceil(count / pageSize),
});

export const apiError = (
  message: string,
  code: ErrorCode,
  status = 400,
  details?: unknown
): ApiError => ({
  success: false,
  error: {
    message,
    code,
    status,
    ...(details !== undefined && { details }),
  },
});
