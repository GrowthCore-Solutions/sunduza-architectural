type FetchOptions = RequestInit & {
  params?: Record<string, string>;
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

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.error?.message ?? json?.message ?? res.statusText;
    const code = json?.error?.code ?? "UNKNOWN_ERROR";
    const status = json?.error?.status ?? res.status;
    throw new ApiClientError(message, code, status);
  }

  return json as T;
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
