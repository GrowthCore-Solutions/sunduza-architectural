// Origin-header CSRF protection for state-changing API requests.
//
// The browser is the only thing that controls the Origin header — an attacker's
// site cannot forge it from a victim's browser. So comparing Origin against the
// request's own host is a sufficient (and stateless) defence against classic
// CSRF on cookie-authenticated endpoints.
//
// Trusted hosts come from two sources:
//   1. The request itself (X-Forwarded-Host > Host) — covers the common
//      same-origin case, including custom domains and Vercel previews.
//   2. The ALLOWED_ORIGINS env var (comma-separated) — for cross-origin
//      consumers we explicitly trust (e.g. the public site calling the API
//      from a separately deployed admin app).

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isSafeMethod(method: string): boolean {
  return SAFE_METHODS.has(method.toUpperCase());
}

export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getRequestHost(headers: Headers): string | null {
  return headers.get("x-forwarded-host") ?? headers.get("host") ?? null;
}

function getRequestProtocol(headers: Headers): string {
  return headers.get("x-forwarded-proto") ?? "https";
}

export function verifyOrigin(
  headers: Headers,
  allowedOriginsEnv: string | undefined = process.env.ALLOWED_ORIGINS
): boolean {
  const origin = headers.get("origin");
  if (!origin) {
    // No Origin header: refuse. Modern browsers always send Origin for
    // unsafe methods; absence implies a non-browser client or a stripped
    // header, neither of which we trust for state-changing requests.
    return false;
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const requestHost = getRequestHost(headers);
  if (requestHost && originHost === requestHost) return true;

  const allowed = parseAllowedOrigins(allowedOriginsEnv);
  if (allowed.includes(origin)) return true;

  // Allow exact host match without scheme — convenience for env config
  // where the operator might list bare hosts.
  if (allowed.includes(originHost)) return true;

  return false;
}

// Path prefixes that opt out of CSRF protection.
// /api/auth/*     — NextAuth ships its own synchroniser-token CSRF guard.
// /api/internal/* — server-to-server (cron) using Bearer secret in Authorization.
const CSRF_EXEMPT_PREFIXES = ["/api/auth/", "/api/internal/"];

export function isCsrfExempt(pathname: string): boolean {
  return CSRF_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getRequestOrigin(headers: Headers): string {
  const host = getRequestHost(headers);
  const proto = getRequestProtocol(headers);
  return host ? `${proto}://${host}` : "";
}
