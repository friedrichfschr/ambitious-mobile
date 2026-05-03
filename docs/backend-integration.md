# Mobile ↔ server auth integration

## What this app now expects

The mobile app is wired to a standalone API server.

Implemented client flows:
- email/password registration
- email/password login
- Google sign-in via Expo AuthSession
- Apple sign-in via native Apple auth on iOS
- access/refresh token persistence
- session restore on launch

## Required Expo env vars

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Notes

- Apple sign-in only renders on iOS when available.
- For Expo Go Apple testing, the backend must accept `host.exp.Exponent` as an Apple audience in addition to your real app bundle identifier.
- Google sign-in requires the matching OAuth client IDs from Google Cloud.
- The backend verifies Google and Apple identity tokens before creating or linking a user.
