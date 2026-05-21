import "server-only";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(key: string, limit: number, windowMs: number): boolean {
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

type Limiter = {
  limit: (id: string) => Promise<{ success: boolean }>;
};

let bookingLimiter: Limiter | null = null;
let contactLimiter: Limiter | null = null;
let authLimiter: Limiter | null = null;

async function getUpstashLimiters(): Promise<{
  booking: Limiter;
  contact: Limiter;
  auth: Limiter;
} | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });

  return {
    booking: {
      limit: async (id) => {
        const r = await new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 h"),
          prefix: "rl:booking",
        }).limit(id);
        return { success: r.success };
      },
    },
    contact: {
      limit: async (id) => {
        const r = await new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, "1 h"),
          prefix: "rl:contact",
        }).limit(id);
        return { success: r.success };
      },
    },
    auth: {
      limit: async (id) => {
        const r = await new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, "15 m"),
          prefix: "rl:auth",
        }).limit(id);
        return { success: r.success };
      },
    },
  };
}

/** @deprecated Use checkBookingRateLimit — kept for existing imports */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  return inMemoryLimit(key, limit, windowMs);
}

export async function checkBookingRateLimit(ip: string): Promise<boolean> {
  if (!bookingLimiter) {
    const upstash = await getUpstashLimiters();
    bookingLimiter = upstash?.booking ?? {
      limit: async (id) => ({ success: inMemoryLimit(`booking:${id}`, 5, 3600000) }),
    };
  }
  const { success } = await bookingLimiter.limit(ip);
  return success;
}

export async function checkContactRateLimit(ip: string): Promise<boolean> {
  if (!contactLimiter) {
    const upstash = await getUpstashLimiters();
    contactLimiter = upstash?.contact ?? {
      limit: async (id) => ({ success: inMemoryLimit(`contact:${id}`, 3, 3600000) }),
    };
  }
  const { success } = await contactLimiter.limit(ip);
  return success;
}

export async function checkAuthRateLimit(ip: string): Promise<boolean> {
  if (!authLimiter) {
    const upstash = await getUpstashLimiters();
    authLimiter = upstash?.auth ?? {
      limit: async (id) => ({ success: inMemoryLimit(`auth:${id}`, 10, 900000) }),
    };
  }
  const { success } = await authLimiter.limit(ip);
  return success;
}
