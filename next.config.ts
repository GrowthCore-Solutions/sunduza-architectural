import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: false,
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
