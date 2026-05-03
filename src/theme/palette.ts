export const accentOptions = [
  {
    name: 'indigo',
    label: 'Indigo',
    description: 'Clean, focused',
    primary: '#4F46E5',
    secondary: '#7C3AED',
    tertiary: '#0EA5E9',
    swatch: '#4F46E5',
  },
  {
    name: 'ocean',
    label: 'Ocean',
    description: 'Calm, trustworthy',
    primary: '#0369A1',
    secondary: '#0891B2',
    tertiary: '#0D9488',
    swatch: '#0369A1',
  },
  {
    name: 'forest',
    label: 'Forest',
    description: 'Grounded, natural',
    primary: '#166534',
    secondary: '#15803D',
    tertiary: '#0F766E',
    swatch: '#166534',
  },
  {
    name: 'sunset',
    label: 'Sunset',
    description: 'Energetic, warm',
    primary: '#C2410C',
    secondary: '#EA580C',
    tertiary: '#DC2626',
    swatch: '#C2410C',
  },
  {
    name: 'rose',
    label: 'Rose',
    description: 'Soft, approachable',
    primary: '#BE185D',
    secondary: '#DB2777',
    tertiary: '#7C3AED',
    swatch: '#BE185D',
  },
  {
    name: 'amber',
    label: 'Amber',
    description: 'Bold, optimistic',
    primary: '#B45309',
    secondary: '#D97706',
    tertiary: '#059669',
    swatch: '#B45309',
  },
] as const;

export type AccentName = (typeof accentOptions)[number]['name'];

export function getAccent(name: AccentName) {
  return accentOptions.find((option) => option.name === name) ?? accentOptions[0];
}
