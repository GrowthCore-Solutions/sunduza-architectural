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

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  BAD_REQUEST: "BAD_REQUEST",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
