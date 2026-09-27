/**
 * Tipos do design system configuravel.
 * Os valores concretos de cada tema ficam em `src/config/theme.ts`.
 */

export type ThemeId =
  'minimal' | 'luxury' | 'streetwear' | 'feminine' | 'bold' | 'sport' | 'corporate' | 'custom';

/** Tokens de cor. Cada chave vira a variavel CSS `--color-<kebab-case>`. */
export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  accent: string;
  accentForeground: string;
  success: string;
  danger: string;
  overlay: string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  pill: string;
}

export interface ThemeShadows {
  hairline: string;
  card: string;
  lifted: string;
  overlay: string;
}

export interface ThemeTypography {
  /** Pilha de fontes para titulos e elementos tipograficos de destaque. */
  displayFamily: string;
  /** Pilha de fontes para texto corrido e interface. */
  bodyFamily: string;
  displayWeight: number;
  headingWeight: number;
  bodyWeight: number;
  labelWeight: number;
  displayTracking: string;
  labelTracking: string;
  headingTransform: 'none' | 'uppercase';
}

export interface ThemeControls {
  buttonWeight: number;
  buttonTracking: string;
  buttonTransform: 'none' | 'uppercase';
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  controls: ThemeControls;
}
