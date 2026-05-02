export const accentOptions = [
  { name: 'indigo', label: 'Indigo minimal', primary: '#4F46E5', secondary: '#7C3AED', tertiary: '#0EA5E9' },
  { name: 'forest', label: 'Forest calm', primary: '#166534', secondary: '#15803D', tertiary: '#0F766E' },
  { name: 'sunset', label: 'Sunset warm', primary: '#C2410C', secondary: '#EA580C', tertiary: '#DC2626' },
  { name: 'rose', label: 'Rose soft', primary: '#BE185D', secondary: '#DB2777', tertiary: '#7C3AED' },
] as const;

export type AccentName = (typeof accentOptions)[number]['name'];

export function getAccent(name: AccentName) {
  return accentOptions.find((option) => option.name === name) ?? accentOptions[0];
}
