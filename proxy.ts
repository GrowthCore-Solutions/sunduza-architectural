// Route protection proxy.
//
// Layer 1 — /admin/* pages: redirect to login if no session cookie present.
//           API routes still re-verify with the full auth() call against the
//           database, so this is opportunistic only.
//
// Layer 2 — /api/* state-changing requests: Origin-header CSRF check.
//           POST/PUT/PATCH/DELETE must come from our own origin (or an
//           explicitly allowed one). Auth and internal cron routes are exempt.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSafeMethod, isCsrfExempt, verifyOrigin } from "@/backend/lib/csrf";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/api/")) {
    if (!isSafeMethod(method) && !isCsrfExempt(pathname)) {
      if (!verifyOrigin(request.headers)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              message: "Request origin not allowed",
              code: "FORBIDDEN",
              status: 403,
            },
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token");

    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
