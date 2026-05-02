# Ambitious Mobile implementation plan

## Product direction

Ambitious Mobile should feel calm, focused, and trustworthy.

The app is split into two layers:

1. **Public discovery layer**
   - scholarships and opportunities
   - searchable, shareable, indexable content
   - no authentication required

2. **Member layer**
   - community feed/forum
   - messages
   - profile and saved items
   - requires authentication

## Foundation choices

### UI and design system

**Chosen:** React Native Paper on top of Expo Router.

Why:
- stable with Expo
- good accessibility defaults
- clean Material 3 primitives without forcing a loud visual style
- easy token-driven theming for user-customizable colors
- fast to scale into forms, menus, dialogs, chips, lists, and settings

### Backend and auth direction

**Chosen direction:** Supabase.

Why:
- email auth built in
- Google OAuth supported
- Apple auth supported
- Postgres tables fit opportunities + forum + messages well
- realtime is useful for chat and feed updates
- row-level security is the right baseline for private data

## Phase plan

### Phase 1 — done in this starter
- Expo Router app shell
- bottom tab navigation
- public opportunities tab
- auth-gated feed/messages/profile tabs
- profile settings entry point
- local theme preferences with customizable accent colors
- preview auth UI for email / Google / Apple
- implementation roadmap documentation
- EAS preview build config

### Phase 2 — real authentication
- connect Supabase project
- implement email/password and magic link flows
- implement Google sign-in through AuthSession
- implement Apple sign-in on iOS
- store user profile in `profiles`
- replace preview auth state with real session handling

### Phase 3 — public opportunities module
- `opportunities` table
- filters: country, level, deadline, type, subject
- bookmarking for signed-in users
- detail page per opportunity
- admin ingestion path for adding/editing entries
- optional scraping/import pipeline later

### Phase 4 — community feed/forum
- `posts`, `comments`, `likes`, `communities`
- posting, replying, reporting, moderation queue
- saved posts and subscribed communities
- ranked + chronological feed modes

### Phase 5 — messages
- `conversations`, `conversation_members`, `messages`
- unread counts
- typing state and delivery status
- block/report layer

### Phase 6 — profile and personalization
- profile editing
- saved opportunities
- application tracker
- notification preferences
- appearance and accessibility settings

## Suggested data model

### Public
- `opportunities`
  - id
  - title
  - summary
  - body
  - category
  - region
  - level
  - deadline_at
  - provider_name
  - source_url
  - is_published

### Private
- `profiles`
- `saved_opportunities`
- `posts`
- `comments`
- `conversations`
- `conversation_members`
- `messages`
- `notification_preferences`

## Auth rules

- opportunities: public read
- feed/messages/profile: authenticated only
- direct messages: conversation members only
- profile editing: owner only
- moderation actions: admin/mod roles only

## Preview and delivery

Use EAS build profiles:
- `development` for developer builds
- `preview` for shareable internal preview builds
- `production` for store-ready releases

Recommended first preview path:
1. log into Expo with `npx eas-cli login`
2. run `npx eas-cli build --platform android --profile preview`
3. run `npx eas-cli build --platform ios --profile preview`
4. share install links from Expo

## Next best implementation step

Wire real Supabase auth first.

That unlocks all three private tabs properly and gives the rest of the product a real backbone instead of fake local state.
