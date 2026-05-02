import { appEnv, requireApiUrl } from '../config/env';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const apiUrl = requireApiUrl();
  const headers = new Headers(init.headers);

  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }

  if (init.token) {
    headers.set('authorization', `Bearer ${init.token}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiClientError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
      data?.details,
    );
  }

  return data as T;
}

export { appEnv };
