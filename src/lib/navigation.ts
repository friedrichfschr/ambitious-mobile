export const REDIRECT_MAP = {
  '/(tabs)/feed': '/(tabs)/feed',
  '/(tabs)/network': '/(tabs)/network',
  '/(tabs)/profile': '/(tabs)/profile',
} as const;

/** Resolves a raw redirectTo param (may be string, string[], or undefined) to a valid tab path. */
export function resolveRedirect(raw: string | string[] | undefined): string {
  const target = Array.isArray(raw) ? raw[0] : raw;
  return target && target in REDIRECT_MAP
    ? REDIRECT_MAP[target as keyof typeof REDIRECT_MAP]
    : '/(tabs)/profile';
}
