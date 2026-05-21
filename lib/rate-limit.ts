import "server-only";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/** In-memory rate limiter — replace with Upstash in Sprint 3. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || record.resetAt < now) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}
