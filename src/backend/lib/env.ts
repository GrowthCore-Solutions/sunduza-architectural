import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(1, "NEXTAUTH_SECRET is required")
    .refine(
      (val) => process.env.NODE_ENV !== "production" || val.length >= 32,
      "NEXTAUTH_SECRET must be at least 32 characters in production"
    ),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(2592000),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email").optional(),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validates env on first access (not at import) so `next build` can run without secrets. */
export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `\n\nEnvironment validation failed. Fix the following:\n\n${missing}\n\nSee .env.example for reference.\n`
    );
  }

  cached = parsed.data;
  return cached;
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? getEnv().ADMIN_EMAIL ?? "admin@sunduza.co.za";
}
