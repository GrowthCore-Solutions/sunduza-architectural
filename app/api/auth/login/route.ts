// Credentials sign-in — bridges the Credentials provider with the
// constitutionally-locked database session strategy (S3.5, AP-S3.5a).
//
// Auth.js v5's Credentials provider cannot create a database session on its
// own (upstream limitation: authorize() has no access to set-cookie). This
// route performs the same checks as `authorize()` in backend/lib/auth.ts,
// then creates the session row and cookie by hand, using the exact format
// Auth.js itself uses (see @auth/core/lib/utils/cookie.js `defaultCookies`),
// so `auth()` reads it transparently everywhere else in the app.
//
// LOCKED_DESIGN.md Part 4.4 already specifies this endpoint
// (`POST /api/v1/auth/login`); this implements it at the codebase's current
// (unversioned) auth route location, matching `app/api/auth/[...nextauth]`.

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/backend/lib/db";
import { checkAuthRateLimit } from "@/backend/lib/rate-limit";
import { writeAuditLog } from "@/backend/services/audit";

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

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      failedAttempts: true,
      lockedUntil: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt !== null) return fail("Invalid email or password", 401);

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return fail("Account temporarily locked. Please try again later.", 401);
  }

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    const newAttempts = user.failedAttempts + 1;
    const lockout = newAttempts >= 10;

    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newAttempts,
        ...(lockout && { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }),
      },
    });
    await writeAuditLog({
      action: "LOGIN_FAILURE",
      entityType: "User",
      entityId: user.id,
      userId: user.id,
      ipAddress: clientIp,
      userAgent,
    });

    return fail("Invalid email or password", 401);
  }

  if (user.failedAttempts > 0) {
    await db.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  const maxAgeSeconds = parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? "2592000", 10);
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);

  await db.session.create({ data: { sessionToken, userId: user.id, expires } });
  await writeAuditLog({
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    userId: user.id,
    ipAddress: clientIp,
    userAgent,
  });

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
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
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
