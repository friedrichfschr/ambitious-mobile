import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

import { appEnv } from '../config/env';

function normalizeGoogleClientId(value: string) {
  const trimmed = value.trim();
  return trimmed.endsWith('.apps.googleusercontent.com') ? trimmed : undefined;
}

export function useGoogleAuth() {
  const config = {
    clientId: normalizeGoogleClientId(appEnv.googleExpoClientId),
    iosClientId: normalizeGoogleClientId(appEnv.googleIosClientId),
    androidClientId: normalizeGoogleClientId(appEnv.googleAndroidClientId),
    webClientId: normalizeGoogleClientId(appEnv.googleWebClientId),
  };
  const missingId =
    (Platform.OS === 'ios' && !config.iosClientId) ||
    (Platform.OS === 'android' && !config.androidClientId);
  // Pass null to disable the request rather than passing an incomplete config,
  // which would throw "iosClientId must be defined" at runtime.
  return Google.useIdTokenAuthRequest(missingId ? null : config);
}
