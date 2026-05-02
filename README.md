# Ambitious Mobile

A clean Expo + React Native starter for an opportunities platform with a public discovery layer and an authenticated community layer.

## Current starter scope

- public opportunities tab
- authenticated feed tab shell
- authenticated messages tab shell
- authenticated profile tab shell
- settings screen from profile
- customizable accent colors and light/dark/system appearance
- preview auth buttons for email, Google, and Apple
- implementation roadmap in `docs/implementation-plan.md`
- EAS preview build configuration

## Chosen stack

- **App shell:** Expo Router
- **UI system:** React Native Paper
- **Planned backend/auth:** Supabase

## Why this stack

React Native Paper gives fast, accessible primitives while still allowing a restrained minimal look. Expo Router keeps navigation simple and scalable. Supabase is the cleanest path for public data plus authenticated community features.

## Run locally

```bash
npm install
npm run start
```

Useful scripts:

```bash
npm run web
npm run typecheck
npm run preview:tunnel
```

## Preview builds with Expo

This repo includes `eas.json` with a `preview` profile.

Typical flow:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
```

## GitHub Action for PR previews

This repo also includes `.github/workflows/preview.yml`.

To make it work, add a repository secret named `EXPO_TOKEN`:

1. Create a token at `https://expo.dev/settings/access-tokens`
2. Add it in GitHub under `Settings -> Secrets and variables -> Actions`
3. Name the secret `EXPO_TOKEN`

After that, every pull request will publish an EAS Update preview and comment the result on the PR.

## Backend integration

This app is now structured to talk to a standalone Node/Express API instead of the earlier local preview-only auth state.

See:
- `docs/backend-integration.md`
- `.env.example`

Required mobile env vars:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Next implementation step

Point the app at the deployed `ambitious-server`, fill the Expo env vars, and then add a real editable profile screen on top of the new authenticated API layer.
