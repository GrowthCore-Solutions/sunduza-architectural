import { describe, expect, it } from "vitest";
import { pageMeta, pageOffset, totalPages } from "@/shared/lib/pagination";

describe("pageOffset", () => {
  it("is 0 for the first page", () => {
    expect(pageOffset(1, 20)).toBe(0);
  });

  it("advances by limit per page", () => {
    expect(pageOffset(2, 20)).toBe(20);
    expect(pageOffset(5, 50)).toBe(200);
  });
});

describe("totalPages", () => {
  it("rounds up partial pages", () => {
    expect(totalPages(0, 20)).toBe(1); // never below 1
    expect(totalPages(1, 20)).toBe(1);
    expect(totalPages(20, 20)).toBe(1);
    expect(totalPages(21, 20)).toBe(2);
    expect(totalPages(41, 20)).toBe(3);
  });
});

describe("pageMeta", () => {
  it("packages total, page and totalPages", () => {
    expect(pageMeta(45, 2, 20)).toEqual({ total: 45, page: 2, totalPages: 3 });
  });
});
