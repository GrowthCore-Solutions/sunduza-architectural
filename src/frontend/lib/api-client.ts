// Thin fetch wrapper with built-in timeout, error classification, and
// signal merging. Every consumer (React Query, form submits) should use
// `api` instead of calling fetch directly so we have one place to evolve
// resilience policy.

const DEFAULT_TIMEOUT_MS = 15_000;

// Machine-readable codes a caller can switch on. Backend-supplied error
// codes (VALIDATION_ERROR, UNAUTHORIZED, …) flow through unchanged on
// the .code field — these constants only cover failures that originate
// in the client itself.
export const ApiErrorCode = {
  TIMEOUT: "TIMEOUT",
  ABORTED: "ABORTED",
  NETWORK: "NETWORK",
  UNKNOWN: "UNKNOWN_ERROR",
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  /** Per-request override of the default 15s timeout. */
  timeoutMs?: number;
};

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

// Build a single AbortSignal that fires when either the user cancels
// (e.g. React Query unmounts the consuming component) or the request
// times out — whichever happens first.
function combineSignals(
  userSignal: AbortSignal | null | undefined,
  timeoutMs: number
): { signal: AbortSignal; timeoutSignal: AbortSignal } {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!userSignal) return { signal: timeoutSignal, timeoutSignal };
  return {
    signal: AbortSignal.any([userSignal, timeoutSignal]),
    timeoutSignal,
  };
}

function buildUrl(url: string, params?: Record<string, string>): string {
  if (!params) return url;
  const search = new URLSearchParams(params).toString();
  if (!search) return url;
  return url.includes("?") ? `${url}&${search}` : `${url}?${search}`;
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  const {
    params,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: userSignal,
    headers: userHeaders,
    ...rest
  } = options ?? {};

  const { signal, timeoutSignal } = combineSignals(userSignal, timeoutMs);

  try {
    const res = await fetch(buildUrl(url, params), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...userHeaders,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      ...rest,
      signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = json?.error?.message ?? json?.message ?? res.statusText;
      const code = json?.error?.code ?? ApiErrorCode.UNKNOWN;
      const status = json?.error?.status ?? res.status;
      throw new ApiClientError(message, code, status);
    }

    return json as T;
  } catch (err) {
    if (err instanceof ApiClientError) throw err;

    // AbortSignal.timeout produces a DOMException with name "TimeoutError";
    // explicit controller.abort() (or React Query unmount) produces
    // "AbortError". Distinguish by checking whether the timeout signal
    // actually fired.
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiClientError(
        "Request timed out. Please try again.",
        ApiErrorCode.TIMEOUT,
        408
      );
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      // Could be either: caller cancelled us, OR the timeout's
      // .any-combined signal won the race. timeoutSignal.aborted tells us.
      if (timeoutSignal.aborted) {
        throw new ApiClientError(
          "Request timed out. Please try again.",
          ApiErrorCode.TIMEOUT,
          408
        );
      }
      throw new ApiClientError(
        "Request cancelled.",
        ApiErrorCode.ABORTED,
        499
      );
    }

    // fetch() throws TypeError for actual network failures (DNS, CORS,
    // server unreachable). Surface a friendly message rather than the
    // browser's raw "TypeError: Failed to fetch".
    if (err instanceof TypeError) {
      throw new ApiClientError(
        "Network error. Please check your connection and try again.",
        ApiErrorCode.NETWORK,
        0
      );
    }

    throw new ApiClientError(
      err instanceof Error ? err.message : "Unknown error",
      ApiErrorCode.UNKNOWN,
      0
    );
  }
}

export const api = {
  get<T>(url: string, options?: FetchOptions) {
    return request<T>("GET", url, undefined, options);
  },
  post<T>(url: string, body: unknown, options?: FetchOptions) {
    return request<T>("POST", url, body, options);
  },
  patch<T>(url: string, body: unknown, options?: FetchOptions) {
    return request<T>("PATCH", url, body, options);
  },
  delete<T>(url: string, options?: FetchOptions) {
    return request<T>("DELETE", url, undefined, options);
  },
};
