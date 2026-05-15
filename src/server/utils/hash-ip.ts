import "server-only";
import { createHash } from "crypto";

// Hash IP address with SHA-256 before storing — never raw (POPIA + locked design)
// One-way — cannot be reversed back to the original IP
const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "sunduza-ip-salt-v1";

export function hashIpAddress(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(`${IP_HASH_SALT}:${ip}`)
    .digest("hex")
    .slice(0, 64);
}
