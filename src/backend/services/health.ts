import "server-only";

import { healthRepository } from "@/backend/repositories/health.repository";

/** True when the database answers a trivial query, false otherwise. */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await healthRepository.ping();
    return true;
  } catch (err) {
    console.error("[health] Database unreachable:", err);
    return false;
  }
}
