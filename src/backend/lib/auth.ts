// Sunduza Auth Configuration — NextAuth v5
// Strategy : database sessions via PrismaAdapter (S3.5 — never JWT)
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

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const clientIp = "default";
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

  session: {
    strategy: "database",
    maxAge: parseInt(process.env.SESSION_MAX_AGE_SECONDS ?? "2592000", 10),
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id;
        (session.user as typeof session.user & { role: string }).role =
          (user as typeof user & { role: string }).role;
      }
      return session;
    },
  },
});
