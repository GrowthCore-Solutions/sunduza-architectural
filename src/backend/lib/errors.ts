import "server-only";

import { ErrorCode } from "@/backend/lib/api-response";

/**
 * Typed error raised from the service layer. Carries the HTTP status and the
 * machine-readable code the route handler should surface — so business-rule
 * failures (a stale service slug, a forbidden status transition, a missing
 * record) don't get flattened into anonymous 500s.
 *
 * Route handlers detect this with `instanceof ServiceError` and emit
 * `apiError(err.message, err.code, err.status, err.details)`.
 */
export class ServiceError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCode,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): ServiceError {
    return new ServiceError(message, ErrorCode.BAD_REQUEST, 400, details);
  }

  static validation(message: string, details?: unknown): ServiceError {
    return new ServiceError(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static notFound(message: string, details?: unknown): ServiceError {
    return new ServiceError(message, ErrorCode.NOT_FOUND, 404, details);
  }

  static conflict(message: string, details?: unknown): ServiceError {
    return new ServiceError(message, ErrorCode.CONFLICT, 409, details);
  }
}

export function isServiceError(err: unknown): err is ServiceError {
  return err instanceof ServiceError;
}
