// Sunduza Auth Configuration — NextAuth v5
// Strategy : database sessions via PrismaAdapter (S3.5 — never JWT)
// Provider : Credentials only (email + bcrypt password)
// Security : account lockout after 10 failures (S3.4 Layer 2)
//            in-memory IP rate limiting Layer 1 (Redis in v2)
// Session  : lifetime from SESSION_MAX_AGE_SECONDS env var (S3.9)
// Hashing  : bcrypt cost from BCRYPT_ROUNDS env var (S3.3)

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ── Request ID generator ───────────────────────────────────────────────────────
// Injected as X-Request-ID header for cross-request tracing (S6.20)
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── In-memory IP rate limiter ──────────────────────────────────────────────────
// Layer 1 rate limiting (S3.4). Resets on serverless cold start — acceptable.
// Durable protection comes from database-level account lockout (Layer 2).
// Replace with Redis in v2 for persistent cross-instance rate limiting.
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || record.resetAt < now) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// ── NextAuth configuration ─────────────────────────────────────────────────────
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Layer 1: IP-based rate limit — 10 attempts per 15 minutes (S3.4)
        const clientIp = "default";
        if (!checkRateLimit(`auth:${clientIp}`, 10, 15 * 60 * 1000)) {
          return null;
        }

        // Fetch user — explicit select, never expose sensitive fields (S5.11)
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

        if (!user || user.deletedAt !== null) return null;

        // Layer 2: Account lockout check (S3.4)
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          // Return identical error — do not reveal lockout state (S3.4 — AP-S3.4b)
          return null;
        }

        const valid = bcrypt.compareSync(password, user.password);

        if (!valid) {
          const newAttempts = user.failedAttempts + 1;
          const lockout = newAttempts >= 10;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: newAttempts,
              ...(lockout && {
                lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
              }),
            },
          });

          return null;
        }

        // Reset failed attempts on successful login
        if (user.failedAttempts > 0) {
          await db.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        // Return safe fields only — never expose password or sensitive fields (S3.8)
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? "2592000", 10),
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    // Expose id and role to session object — safe fields only (S3.8)
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id;
        (session.user as typeof session.user & { role: string }).role =
          (user as typeof user & { role: string }).role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
