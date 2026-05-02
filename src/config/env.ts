function normalizeApiUrl(value?: string) {
  return (value ?? '').trim().replace(/\/$/, '');
}

export const appEnv = {
  apiUrl: normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL),
  googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID?.trim() ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '',
};

export function requireApiUrl() {
  if (!appEnv.apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured. Add it to your Expo env before testing auth.');
  }

  return appEnv.apiUrl;
}
