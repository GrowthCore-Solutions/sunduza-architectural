import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, ApiErrorCode } from "@/frontend/lib/api-client";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

beforeEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api.get — happy path", () => {
  it("returns parsed JSON on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { id: "abc" } }))
    );

    const res = await api.get<{ success: true; data: { id: string } }>("/api/x");
    expect(res.data.id).toBe("abc");
  });

  it("encodes query params", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    await api.get("/api/projects", { params: { featured: "true" } });
    expect(fetchSpy.mock.calls[0][0]).toBe("/api/projects?featured=true");
  });

  it("preserves existing query string when adding params", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    await api.get("/api/projects?cursor=1", { params: { limit: "20" } });
    expect(fetchSpy.mock.calls[0][0]).toBe("/api/projects?cursor=1&limit=20");
  });

  it("sets Content-Type: application/json on POST", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, data: {} }));
    vi.stubGlobal("fetch", fetchSpy);

    await api.post("/api/x", { name: "y" });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(
      (init.headers as Record<string, string>)["Content-Type"]
    ).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ name: "y" }));
  });
});

describe("api — server error handling", () => {
  it("throws ApiClientError when response is non-ok with structured error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            success: false,
            error: {
              message: "Phone too short",
              code: "VALIDATION_ERROR",
              status: 400,
            },
          },
          { status: 400 }
        )
      )
    );

    await expect(api.post("/api/x", {})).rejects.toMatchObject({
      name: "ApiClientError",
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Phone too short",
    });
  });

  it("falls back to status text when response body is unparseable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("not json", { status: 500, statusText: "Internal Server Error" })
      )
    );

    await expect(api.get("/api/x")).rejects.toMatchObject({
      status: 500,
      code: ApiErrorCode.UNKNOWN,
    });
  });
});

describe("api — timeout", () => {
  it("aborts the request and throws TIMEOUT after timeoutMs", async () => {
    // fetch that respects the AbortSignal — resolves only after a long delay
    // unless the signal aborts first, in which case it rejects with the spec
    // DOMException("TimeoutError").
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            // The combined signal's reason mirrors AbortSignal.timeout's reason.
            const reason = init.signal?.reason;
            reject(
              reason instanceof DOMException
                ? reason
                : new DOMException("Aborted", "AbortError")
            );
          });
        });
      })
    );

    const start = Date.now();
    await expect(api.get("/api/slow", { timeoutMs: 50 })).rejects.toMatchObject({
      name: "ApiClientError",
      code: ApiErrorCode.TIMEOUT,
      status: 408,
    });
    // Loose upper bound — the timeout should fire close to 50ms, definitely
    // not wait for the default 15s.
    expect(Date.now() - start).toBeLessThan(2000);
  });
});

describe("api — caller-initiated abort", () => {
  it("surfaces ABORTED when the caller's signal fires before the timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const reason = init.signal?.reason;
            reject(
              reason instanceof DOMException
                ? reason
                : new DOMException("Aborted", "AbortError")
            );
          });
        });
      })
    );

    const controller = new AbortController();
    const promise = api.get("/api/slow", { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({
      name: "ApiClientError",
      code: ApiErrorCode.ABORTED,
      status: 499,
    });
  });
});

describe("api — network error", () => {
  it("classifies fetch TypeError as NETWORK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(api.get("/api/x")).rejects.toMatchObject({
      name: "ApiClientError",
      code: ApiErrorCode.NETWORK,
      status: 0,
    });
  });
});
