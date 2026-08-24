// Credentials sign-in — bridges the Credentials provider with the
// constitutionally-locked database session strategy (S3.5, AP-S3.5a).
//
// Auth.js v5's Credentials provider cannot create a database session on its
// own (upstream limitation: authorize() has no access to set-cookie). This
// service performs the same checks Auth.js's authorize() would, then creates
// the session row by hand — src/backend/lib/auth.ts (auth()) reads it
// transparently afterward via the adapter.
//
// LOCKED_DESIGN.md Part 4.4 already specifies this endpoint
// (`POST /api/v1/auth/login`); app/api/auth/login/route.ts implements it at
// the codebase's current (unversioned) auth route location, matching
// app/api/auth/[...nextauth].
import "server-only";

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { usersRepository } from "@/backend/repositories/users.repository";
import { sessionsRepository } from "@/backend/repositories/sessions.repository";
import { writeAuditLog } from "@/backend/services/audit";

const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export type AuthenticateResult =
  | {
      ok: true;
      user: { id: string; email: string; name: string | null; role: string };
    }
  | { ok: false; reason: "invalid" | "locked" };

export async function authenticateWithCredentials(
  email: string,
  password: string,
  meta: { ipAddress: string; userAgent?: string }
): Promise<AuthenticateResult> {
  const user = await usersRepository.findByEmailForAuth(email);

  if (!user || user.deletedAt !== null) return { ok: false, reason: "invalid" };

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, reason: "locked" };
  }

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    const newAttempts = user.failedAttempts + 1;
    const lockout = newAttempts >= LOCKOUT_THRESHOLD;

    await usersRepository.recordFailedAttempt(
      user.id,
      newAttempts,
      lockout ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null
    );
    await writeAuditLog({
      action: "LOGIN_FAILURE",
      entityType: "User",
      entityId: user.id,
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { ok: false, reason: "invalid" };
  }

  if (user.failedAttempts > 0) {
    await usersRepository.clearFailedAttempts(user.id);
  }

  await writeAuditLog({
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
    userId: user.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

/** Creates the database session row that `auth()` reads via the adapter. */
export async function createUserSession(
  userId: string
): Promise<{ sessionToken: string; expires: Date }> {
  const maxAgeSeconds = parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? "2592000", 10);
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);

  await sessionsRepository.create({ sessionToken, userId, expires });

  return { sessionToken, expires };
}
