/**
 * Load .env.local before Prisma/NextAuth initialize.
 * Next.js usually does this at startup, but some dev bundles evaluate API modules first.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
