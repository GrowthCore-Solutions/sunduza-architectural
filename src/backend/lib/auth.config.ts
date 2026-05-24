import type { NextAuthConfig } from "next-auth";

/** Shared pages/sign-in paths for server auth (proxy.ts uses cookie check). */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
} satisfies NextAuthConfig;
