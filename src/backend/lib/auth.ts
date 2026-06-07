// Sunduza Auth Configuration — NextAuth v5
// Strategy : JWT sessions — required for the Credentials provider in Auth.js v5
//            (credentials sign-ins cannot persist a database session). The
//            PrismaAdapter is retained for user lookup / future OAuth linking.
// Provider : Credentials only (email + bcrypt password)
// Security : account lockout after 10 failures (S3.4 Layer 2)
//            in-memory IP rate limiting Layer 1 (Redis in v2)
// Session  : lifetime from SESSION_MAX_AGE_SECONDS env var (S3.9)
// Hashing  : bcrypt cost from BCRYPT_ROUNDS env var (S3.3)

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/backend/lib/db";
import { checkAuthRateLimit } from "@/backend/lib/rate-limit";
import { authConfig } from "@/backend/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),

  providers: [
    // Auth.js v5 requires a non-credentials provider when using database sessions.
    // Google is not shown in the UI; credentials remain the only login path.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "not-configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "not-configured",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Per-IP rate limiting. The Auth.js Credentials provider passes the
        // incoming Request as the second arg, so the real client IP is taken
        // from x-forwarded-for (the same header /lib/request.ts uses).
        const forwardedFor = request?.headers.get("x-forwarded-for");
        const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
        if (!(await checkAuthRateLimit(clientIp))) {
          return null;
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

        if (!user || user.deletedAt !== null) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
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

        if (user.failedAttempts > 0) {
          await db.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],

  // The Credentials provider cannot create database sessions in Auth.js v5 —
  // a credentials sign-in always mints a JWT, never a `sessions` row. Pairing
  // it with `strategy: "database"` made /api/auth/session fail the DB lookup
  // and clear the cookie on the first request after login, bouncing the user
  // straight back to /admin/login. JWT sessions are the supported strategy for
  // credentials auth.
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? "2592000", 10),
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    // Persist id + role onto the token at sign-in (the `user` arg is only
    // present on the initial sign-in call).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Surface id + role from the token onto the session the app reads.
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role)
          session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
});
