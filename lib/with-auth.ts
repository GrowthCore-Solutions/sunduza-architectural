import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { apiError, ErrorCode } from "@/lib/api-response";

type AuthenticatedHandler = (
  req: NextRequest,
  session: Session,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
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

    return handler(req, session, context);
  };
}
