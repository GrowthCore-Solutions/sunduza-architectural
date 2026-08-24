// Sunduza Auth Configuration — NextAuth v5
// Strategy : database sessions via PrismaAdapter (S3.5 — never JWT)
// Sign-in  : credentials sign-in happens out-of-band at
//            app/api/auth/login/route.ts, which creates the session row and
//            cookie by hand — Auth.js's Credentials provider cannot create a
//            database session itself (upstream limitation: authorize() has
//            no access to set-cookie). This module is only used to READ
//            sessions (auth()) and to sign out (adapter.deleteSession).
// Security : account lockout after 10 failures (S3.4 Layer 2)
//            in-memory IP rate limiting Layer 1 (Redis in v2)
// Session  : lifetime from SESSION_MAX_AGE_SECONDS env var (S3.9)
// Hashing  : bcrypt cost from BCRYPT_ROUNDS env var (S3.3) — see login route

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/backend/lib/db";
import { authConfig } from "@/backend/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),

  providers: [
    // Auth.js v5 requires a provider even when sign-in happens out-of-band
    // (see module comment above). Not shown in the UI, not configured with
    // real credentials — session reads/writes never touch this provider.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "not-configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "not-configured",
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
