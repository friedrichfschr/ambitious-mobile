import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

import { appEnv } from '../config/env';

function normalizeGoogleClientId(value: string) {
  const trimmed = value.trim();
  return trimmed.endsWith('.apps.googleusercontent.com') ? trimmed : undefined;
}

const disabledPrompt = async () => ({ type: 'dismiss' as const });

export function useGoogleAuth() {
  const config = {
    clientId: normalizeGoogleClientId(appEnv.googleExpoClientId),
    iosClientId: normalizeGoogleClientId(appEnv.googleIosClientId),
    androidClientId: normalizeGoogleClientId(appEnv.googleAndroidClientId),
    webClientId: normalizeGoogleClientId(appEnv.googleWebClientId),
  };

  const platformClientId = Platform.select({
    ios: config.iosClientId,
    android: config.androidClientId,
    default: config.webClientId,
  });

  const googleEnabled = Boolean(platformClientId);
  const fallbackClientId =
    platformClientId ??
    config.clientId ??
    config.webClientId ??
    'disabled.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: fallbackClientId,
    iosClientId: config.iosClientId ?? fallbackClientId,
    androidClientId: config.androidClientId ?? fallbackClientId,
    webClientId: config.webClientId ?? fallbackClientId,
  });

  if (!googleEnabled) {
    return [null, null, disabledPrompt] as const;
  }

  return [request, response, promptAsync] as const;
}
