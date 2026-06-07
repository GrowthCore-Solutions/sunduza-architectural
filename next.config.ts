import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Sentry ingest endpoints we need to allow for connect-src. Covers the
// primary domain plus regional ingest subdomains (us, de, …).
const SENTRY_HOSTS = [
  "https://*.sentry.io",
  "https://*.ingest.sentry.io",
  "https://*.ingest.us.sentry.io",
  "https://*.ingest.de.sentry.io",
];

function buildCsp(): string {
  // Next.js injects hydration data via inline <script> blocks, which means
  // we currently need 'unsafe-inline' for scripts. The clean fix is a
  // middleware-issued per-request nonce + 'strict-dynamic' — tracked as a
  // follow-up; not done here to keep this change minimally invasive.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    // Fast Refresh and React DevTools bridge use eval() in dev only.
    isDev && "'unsafe-eval'",
  ].filter(Boolean) as string[];

  const connectSrc = [
    "'self'",
    ...SENTRY_HOSTS,
    // HMR websocket in dev only.
    isDev && "ws:",
    isDev && "wss:",
  ].filter(Boolean) as string[];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // Only force HTTPS in production. In local dev the server is HTTP-only, so
    // upgrading subrequests to https breaks RSC navigation (ERR_SSL_PROTOCOL_ERROR).
    !isDev && "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

const securityHeaders = [
  // HSTS only in production. On http://localhost it would pin the browser to
  // HTTPS-only (max-age 2y), breaking local testing well after dev stops.
  !isDev && {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: buildCsp() },
].filter(Boolean) as { key: string; value: string }[];

const nextConfig: NextConfig = {
  // Strip the `X-Powered-By: Next.js` header — no upside, just fingerprinting.
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: false,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

function wrapWithSentry(config: NextConfig): NextConfig {
  if (!process.env.SENTRY_DSN) return config;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withSentryConfig } = require("@sentry/nextjs") as typeof import("@sentry/nextjs");
    return withSentryConfig(config, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    });
  } catch {
    return config;
  }
}

export default wrapWithSentry(nextConfig);
