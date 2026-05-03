import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

import { appEnv } from '../config/env';

export function useGoogleAuth() {
  const config = {
    clientId: appEnv.googleExpoClientId || undefined,
    iosClientId: appEnv.googleIosClientId || undefined,
    androidClientId: appEnv.googleAndroidClientId || undefined,
    webClientId: appEnv.googleWebClientId || undefined,
  };
  const missingId =
    (Platform.OS === 'ios' && !config.iosClientId) ||
    (Platform.OS === 'android' && !config.androidClientId);
  // Pass null to disable the request rather than passing an incomplete config,
  // which would throw "iosClientId must be defined" at runtime.
  return Google.useIdTokenAuthRequest(missingId ? null : config);
}
