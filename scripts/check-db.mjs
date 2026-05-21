import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

nextEnv.loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local and set it.");
  process.exit(1);
}

const db = new PrismaClient();

try {
  await db.$queryRaw`SELECT 1`;
  console.log("Database connection OK.");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Database connection FAILED.");
  if (message.includes("Authentication failed")) {
    console.error(
      "PostgreSQL rejected the username/password in DATABASE_URL. Update .env.local and restart npm run dev."
    );
  } else {
    console.error(message);
  }
  process.exit(1);
} finally {
  await db.$disconnect();
}
