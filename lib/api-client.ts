// Typed API client wrapper
// Mirrors the design doc's API contracts

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options ?? {};

  let targetUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    targetUrl = `${url}?${searchParams.toString()}`;
  }

  const res = await fetch(targetUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...fetchOptions,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
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
