import { NextResponse, type NextRequest } from "next/server";
import { isCsrfExempt, isSafeMethod, verifyOrigin } from "@/backend/lib/csrf";

// Edge-runtime middleware. Runs before every matched route and rejects
// state-changing /api/* requests whose Origin header does not match the
// request host (or the ALLOWED_ORIGINS allowlist).
//
// /api/auth/*     — exempt: NextAuth ships its own synchroniser-token CSRF
// /api/internal/* — exempt: server-to-server with Bearer secret

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (isSafeMethod(req.method)) return NextResponse.next();
  if (isCsrfExempt(pathname)) return NextResponse.next();

  if (!verifyOrigin(req.headers)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Cross-origin request blocked.",
          code: "FORBIDDEN",
          status: 403,
        },
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
