import { apiRequest } from './api';
import type { AuthResponse, AuthUser } from '../types/auth';

export const authApi = {
  // Step 1: validates input, stores pending registration, sends 4-digit code email.
  // Returns { email } with 202 — user is NOT created yet.
  register(input: { email: string; password: string; displayName: string }) {
    return apiRequest<{ email: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Step 2: verify the 4-digit code. Creates the real user and returns a session.
  confirmRegistration(input: { email: string; code: string }) {
    return apiRequest<AuthResponse>('/api/auth/confirm-registration', {
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
    return apiRequest<{ profile: import('../types/auth').UserProfile }>('/api/profiles/me', {
      method: 'GET',
      token: accessToken,
    });
  },
};
