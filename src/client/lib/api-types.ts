export type ApiSuccess<T> = { success: true; data: T; message?: string };

export type ApiListSuccess<T> = {
  success: true;
  data: T[];
  count: number;
  page: number;
  totalPages: number;
};

export type ApiErrorBody = {
  success: false;
  error: { message: string; code: string; status: number };
};

export function unwrapApiData<T>(response: ApiSuccess<T> | T): T {
  if (response && typeof response === "object" && "success" in response && response.success) {
    return response.data;
  }
  return response as T;
}
