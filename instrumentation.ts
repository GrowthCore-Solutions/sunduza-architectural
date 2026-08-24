export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Some hosts advertise an IPv6 route that doesn't actually work (seen
    // here: outbound fetch to api.resend.com hung/failed over IPv6 while
    // IPv4 succeeded instantly) - undici's fetch tries the DNS-returned
    // order first, so a dead IPv6 route silently breaks every outbound
    // call made via fetch (Resend, etc.) until it exhausts retries. Prefer
    // IPv4 first; this is a no-op cost on hosts where IPv6 works fine.
    const { setDefaultResultOrder } = await import("dns");
    setDefaultResultOrder("ipv4first");
  }

  if (!process.env.SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
