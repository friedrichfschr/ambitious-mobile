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
  const safeConfig =
    (Platform.OS === 'ios' && !config.iosClientId) ||
    (Platform.OS === 'android' && !config.androidClientId)
      ? {}
      : config;
  return Google.useIdTokenAuthRequest(safeConfig);
}
