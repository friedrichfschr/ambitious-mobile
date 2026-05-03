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

  if (!headers.has('content-type') && init.body) {
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
  const data = text ? JSON.parse(text) : null;

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

    throw new ApiClientError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
      data?.details,
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
