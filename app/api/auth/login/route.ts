// Credentials sign-in HTTP boundary — parses the request, applies rate
// limiting, and shapes the response. All persistence and business rules
// (bcrypt check, lockout, session creation) live in
// src/backend/services/auth.ts, per docs/design/DATA_ACCESS.md — this route
// must not import @/backend/lib/db directly.

import { NextResponse } from "next/server";
import { checkAuthRateLimit } from "@/backend/lib/rate-limit";
import { authenticateWithCredentials, createUserSession } from "@/backend/services/auth";

function fail(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { message, code: status === 429 ? "RATE_LIMIT_EXCEEDED" : "UNAUTHORIZED", status } },
    { status }
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: { message: "Email and password are required", code: "VALIDATION_ERROR", status: 400 } },
      { status: 400 }
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") ?? undefined;

  if (!(await checkAuthRateLimit(clientIp))) {
    return fail("Too many attempts. Please try again later.", 429);
  }

  const result = await authenticateWithCredentials(email, password, {
    ipAddress: clientIp,
    userAgent,
  });

  if (!result.ok) {
    return fail(
      result.reason === "locked"
        ? "Account temporarily locked. Please try again later."
        : "Invalid email or password",
      401
    );
  }

  const { sessionToken, expires } = await createUserSession(result.user.id);

  // Match @auth/core's own secure-cookie determination exactly (see
  // node_modules/@auth/core/lib/init.js: `useSecureCookies ?? url.protocol
  // === "https:"`) - it decides per-request from the actual protocol, never
  // from NODE_ENV. A build+start production run served over plain HTTP
  // (e.g. CI, or a reverse proxy that doesn't forward x-forwarded-proto)
  // has NODE_ENV=production but no TLS - a NODE_ENV-based check would set
  // Secure on the cookie, the browser silently drops it over HTTP, and
  // login bounces back with no error (found via CI running a real
  // production build over HTTP - passed identical local `next dev` tests).
  // Getting this wrong the other way (never secure) would ship an
  // unencrypted session cookie to production, so mirror Auth.js exactly
  // rather than hardcode either direction.
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isSecure = forwardedProto ? forwardedProto === "https" : new URL(request.url).protocol === "https:";
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";

  const response = NextResponse.json({
    success: true,
    data: result.user,
  });
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecure,
    expires,
  });
  return response;
}
