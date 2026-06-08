// Pagination helpers — shared by every admin list endpoint so the offset and
// page-count arithmetic lives in exactly one place. Pure functions, no I/O.

/** Zero-based offset for a 1-based page. */
export function pageOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/** Total page count for `total` rows at `limit` per page (never below 1). */
export function totalPages(total: number, limit: number): number {
  return Math.ceil(total / limit) || 1;
}

export interface PageMeta {
  total: number;
  page: number;
  totalPages: number;
}

/** Standard pagination envelope shared across list responses. */
export function pageMeta(total: number, page: number, limit: number): PageMeta {
  return { total, page, totalPages: totalPages(total, limit) };
}
