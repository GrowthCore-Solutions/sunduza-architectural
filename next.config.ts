import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: false,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
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
