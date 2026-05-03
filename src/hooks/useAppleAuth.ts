import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useAppleAuth() {
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    import('expo-apple-authentication')
      .then((m) => m.isAvailableAsync())
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  async function getAppleCredential() {
    const { signInAsync, AppleAuthenticationScope } = await import('expo-apple-authentication');
    const cred = await signInAsync({
      requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL],
    });
    if (!cred.identityToken) throw new Error('Apple did not return an identity token.');
    return {
      identityToken: cred.identityToken,
      firstName: cred.fullName?.givenName ?? undefined,
      lastName: cred.fullName?.familyName ?? undefined,
    };
  }

  return { appleAvailable, getAppleCredential };
}
