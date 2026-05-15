// Route protection middleware — S3.7 (Layer 1 of double-layer auth)
// Verifies session on every request to /admin/* at the routing layer.
// API routes perform a second independent session check (double-layer protection).
// An unauthenticated request never reaches an admin page or admin API handler.

export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
