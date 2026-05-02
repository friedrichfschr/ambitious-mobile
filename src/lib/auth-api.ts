import { apiRequest } from './api';
import type { AuthResponse, AuthUser, UserProfile } from '../types/auth';

export const authApi = {
  register(input: { email: string; password: string; displayName: string }) {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  loginWithGoogle(idToken: string) {
    return apiRequest<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  loginWithApple(input: { identityToken: string; firstName?: string; lastName?: string }) {
    return apiRequest<AuthResponse>('/api/auth/apple', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  me(accessToken: string) {
    return apiRequest<{ user: AuthUser }>('/api/auth/me', {
      method: 'GET',
      token: accessToken,
    });
  },

  logout(accessToken: string) {
    return apiRequest<void>('/api/auth/logout', {
      method: 'POST',
      token: accessToken,
    });
  },

  getMyProfile(accessToken: string) {
    return apiRequest<{ profile: UserProfile }>('/api/profiles/me', {
      method: 'GET',
      token: accessToken,
    });
  },
};
