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

type ApiInit = RequestInit & { token?: string; _retry?: boolean };

export async function apiRequest<T>(
  path: string,
  init: ApiInit = {},
): Promise<T> {
  const apiUrl = requireApiUrl();
  const headers = new Headers(init.headers);

  // Don't set content-type for FormData — fetch sets it automatically with the correct multipart boundary.
  if (!headers.has('content-type') && init.body && !(init.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }

  if (init.token) {
    headers.set('authorization', `Bearer ${init.token}`);
  }

  const url = `${apiUrl}${path}`;
  console.log(`[API] ${init.method ?? 'GET'} ${url}`);
  if (init.body) console.log(`[API] body:`, init.body);

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    console.error(`[API] Network error for ${init.method ?? 'GET'} ${url}:`, err);
    throw err;
  }

  console.log(`[API] ${response.status} ${url}`);

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  console.log(`[API] response body:`, text);
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON response (e.g. HTML error page from a proxy/gateway).
      // Treat as a generic error — the status code will drive error handling below.
      if (response.ok) {
        throw new ApiClientError(`Unexpected non-JSON response from ${url}`, response.status);
      }
    }
  }

  if (!response.ok) {
    // Attempt a token refresh on 401, once per request (guard with _retry flag)
    if (response.status === 401 && !init._retry && _tokenStore) {
      const rt = _tokenStore.getRefreshToken();
      if (rt) {
        try {
          const refreshed = await apiRequest<{ accessToken: string; refreshToken: string }>(
            '/api/auth/refresh',
            { method: 'POST', body: JSON.stringify({ refreshToken: rt }), _retry: true },
          );
          _tokenStore.onRefreshed(refreshed.accessToken, refreshed.refreshToken);
          return apiRequest<T>(path, { ...init, token: refreshed.accessToken, _retry: true });
        } catch {
          // Fall through to throw the original 401
        }
      }
    }

    const errData = data as Record<string, unknown> | null;
    throw new ApiClientError(
      (errData?.error as string) || (errData?.message as string) || `Request failed with status ${response.status}`,
      response.status,
      errData?.details,
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Token store — registered by AuthProvider on mount so apiRequest can
// silently refresh the access token on a 401 without a full sign-out.
// ---------------------------------------------------------------------------

type TokenStore = {
  getRefreshToken: () => string | null;
  onRefreshed: (accessToken: string, refreshToken: string) => void;
};
let _tokenStore: TokenStore | null = null;

export function registerTokenStore(store: TokenStore) {
  _tokenStore = store;
}

export { appEnv };
