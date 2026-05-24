import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { UserRole } from "@prisma/client";
import { auth } from "@/backend/lib/auth";
import { apiError, ErrorCode } from "@/backend/lib/api-response";

type AuthenticatedHandler = (
  req: NextRequest,
  session: Session,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

type AuthOptions = {
  /**
   * Roles allowed to call this handler. Omit to allow any authenticated user
   * (read-only endpoints). Write endpoints MUST specify an explicit list.
   *
   * Conventional values used across the API:
   *   - WRITE_ROLES = [ADMIN, EDITOR] — content writes
   *   - ADMIN_ONLY  = [ADMIN]         — settings, destructive ops
   */
  requireRole?: UserRole[];
};

/** Content-write endpoints (bookings, projects, testimonials, messages). */
export const WRITE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.EDITOR];

/** Privileged endpoints (site settings, anything VIEWER/EDITOR must never touch). */
export const ADMIN_ONLY: UserRole[] = [UserRole.ADMIN];

export function withAuth(
  handler: AuthenticatedHandler,
  options?: AuthOptions
) {
  return async function (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
        { status: 401 }
      );
    }

    if (options?.requireRole && !options.requireRole.includes(session.user.role)) {
      return NextResponse.json(
        apiError(
          "You do not have permission to perform this action.",
          ErrorCode.FORBIDDEN,
          403
        ),
        { status: 403 }
      );
    }

    return handler(req, session, context);
  };
}
