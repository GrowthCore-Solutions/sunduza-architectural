// Services catalogue — admin-managed lookup that backs Booking.service.
//
// Reads are cheap (single small table) but every booking submission needs one,
// so a process-local cache with a short TTL absorbs the load without any
// external dependency. The cache is invalidated on every write through this
// module; out-of-band edits via psql are reflected after the TTL expires.
// All persistence is delegated to servicesRepository.

import "server-only";

import { servicesRepository } from "@/backend/repositories/services.repository";
import type { ServiceRow } from "@/shared/types/db";

export type { ServiceRow };

const CACHE_TTL_MS = 60_000;

type Cached = { value: ServiceRow[]; expiresAt: number };
let cache: Cached | null = null;

function isFresh(c: Cached | null): c is Cached {
  return c !== null && c.expiresAt > Date.now();
}

function invalidate() {
  cache = null;
}

/** All active services, ordered for display. Cached for {@link CACHE_TTL_MS}. */
export async function getActiveServices(): Promise<ServiceRow[]> {
  if (isFresh(cache)) return cache.value;

  const rows = await servicesRepository.findActive();

  cache = { value: rows, expiresAt: Date.now() + CACHE_TTL_MS };
  return rows;
}

/**
 * Resolve a slug to its full row. Returns null for unknown or inactive slugs.
 * Used by createBooking to populate `serviceId` and to reject bookings whose
 * service has been retired between page render and form submission.
 */
export async function getActiveServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const active = await getActiveServices();
  return active.find((s) => s.slug === slug) ?? null;
}

/**
 * Admin write path. Caller is responsible for auth and audit logging.
 * Returns the newly created row.
 */
export async function createService(input: {
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
}): Promise<ServiceRow> {
  const row = await servicesRepository.create({
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    icon: input.icon ?? null,
    sortOrder: input.sortOrder ?? 0,
  });
  invalidate();
  return row;
}

export async function updateService(
  id: string,
  patch: Partial<{
    name: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    sortOrder: number;
  }>
): Promise<ServiceRow | null> {
  if (!(await servicesRepository.exists(id))) return null;

  const row = await servicesRepository.update(id, patch);
  invalidate();
  return row;
}

export async function softDeleteService(id: string): Promise<boolean> {
  if (!(await servicesRepository.exists(id))) return false;

  await servicesRepository.softDelete(id);
  invalidate();
  return true;
}
