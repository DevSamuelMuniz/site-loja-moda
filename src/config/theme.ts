import type { Theme, ThemeColors, ThemeControls, ThemeId, ThemeTypography } from '@/types/theme';

/**
 * Pilhas de fontes disponiveis.
 *
 * As fontes sao carregadas por `next/font` em `src/lib/fonts.ts`, que publica as
 * variaveis `--font-manrope` e `--font-inter`. As constantes abaixo adicionam os
 * fallbacks do sistema, para que o tema continue legivel caso a fonte nao carregue.
 */
export const fontStacks = {
  display:
    'var(--font-manrope), "Manrope", ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif',
  body: 'var(--font-inter), "Inter", ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif',
} as const;

/** Tokens de cor do tema padrao, conforme a identidade visual do briefing. */
const minimalColors: ThemeColors = {
  primary: '#111111',
  primaryForeground: '#FFFFFF',
  background: '#FAFAF8',
  foreground: '#111111',
  muted: '#666666',
  surface: '#FFFFFF',
  border: '#E5E5E5',
  accent: '#C9A35A',
  accentForeground: '#1A1712',
  success: '#2E7D51',
  danger: '#B3261E',
  overlay: 'rgba(17, 17, 17, 0.55)',
};

const minimalTypography: ThemeTypography = {
  displayFamily: fontStacks.display,
  bodyFamily: fontStacks.body,
  displayWeight: 300,
  headingWeight: 500,
  bodyWeight: 400,
  labelWeight: 500,
  displayTracking: '-0.025em',
  labelTracking: '0.08em',
  headingTransform: 'none',
};

const minimalControls: ThemeControls = {
  buttonWeight: 500,
  buttonTracking: '0.01em',
  buttonTransform: 'none',
};

/**
 * Registro de temas disponiveis.
 *
 * O tema `minimal` e o padrao e corresponde a identidade do briefing. Os demais
 * existem para demonstrar que a identidade visual e um dado, nao uma constante:
 * trocar de tema nao exige alterar nenhum componente.
 */
export const themes: Record<ThemeId, Theme> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Base clara, preto tipografico e dourado discreto. Identidade padrao da marca.',
    colors: minimalColors,
    radius: { sm: '2px', md: '2px', lg: '4px', xl: '6px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(17, 17, 17, 0.08)',
      card: '0 1px 2px 0 rgba(17, 17, 17, 0.06)',
      lifted: '0 12px 32px -18px rgba(17, 17, 17, 0.35)',
      overlay: '0 24px 60px -30px rgba(17, 17, 17, 0.45)',
    },
    typography: minimalTypography,
    controls: minimalControls,
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description:
      'Papel quente, filetes finos e tipografia muito leve. Para colecoes de alto valor.',
    colors: {
      primary: '#1A1712',
      primaryForeground: '#F7F3EC',
      background: '#F7F3EC',
      foreground: '#1A1712',
      muted: '#7A6F5F',
      surface: '#FFFDF8',
      border: '#E0D6C4',
      accent: '#8C6A3F',
      accentForeground: '#F7F3EC',
      success: '#3F6B4A',
      danger: '#8C3A2B',
      overlay: 'rgba(26, 23, 18, 0.6)',
    },
    radius: { sm: '0', md: '0', lg: '0', xl: '0', pill: '0' },
    shadows: {
      hairline: '0 1px 0 0 rgba(26, 23, 18, 0.12)',
      card: '0 0 0 1px rgba(26, 23, 18, 0.08)',
      lifted: '0 18px 40px -28px rgba(26, 23, 18, 0.55)',
      overlay: '0 30px 70px -40px rgba(26, 23, 18, 0.6)',
    },
    typography: {
      ...minimalTypography,
      displayWeight: 200,
      headingWeight: 400,
      labelTracking: '0.16em',
      headingTransform: 'uppercase',
    },
    controls: { buttonWeight: 400, buttonTracking: '0.14em', buttonTransform: 'uppercase' },
  },
  streetwear: {
    id: 'streetwear',
    name: 'Streetwear',
    description:
      'Tipografia pesada, alto contraste e laranja de sinalizacao. Para drops e capsulas.',
    colors: {
      primary: '#0B0B0F',
      primaryForeground: '#FFFFFF',
      background: '#F2F2F0',
      foreground: '#0B0B0F',
      muted: '#5C5C63',
      surface: '#FFFFFF',
      border: '#D9D9DE',
      accent: '#FF4D1C',
      accentForeground: '#FFFFFF',
      success: '#1F8A5B',
      danger: '#D62B18',
      overlay: 'rgba(11, 11, 15, 0.62)',
    },
    radius: { sm: '4px', md: '8px', lg: '14px', xl: '20px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(11, 11, 15, 0.14)',
      card: '0 2px 0 0 rgba(11, 11, 15, 0.9)',
      lifted: '0 16px 34px -20px rgba(11, 11, 15, 0.5)',
      overlay: '0 26px 60px -30px rgba(11, 11, 15, 0.6)',
    },
    typography: {
      ...minimalTypography,
      displayWeight: 800,
      headingWeight: 700,
      labelWeight: 700,
      displayTracking: '-0.04em',
      labelTracking: '0.05em',
      headingTransform: 'uppercase',
    },
    controls: { buttonWeight: 700, buttonTracking: '0.04em', buttonTransform: 'uppercase' },
  },
  feminine: {
    id: 'feminine',
    name: 'Feminine',
    description: 'Blush suave, rosas empoeirados e cantos generosos. Para colecoes femininas.',
    colors: {
      primary: '#3B2A2E',
      primaryForeground: '#FFF8F6',
      background: '#FDF6F4',
      foreground: '#3B2A2E',
      muted: '#8A7378',
      surface: '#FFFFFF',
      border: '#F0DEDB',
      accent: '#C4707F',
      accentForeground: '#FFFFFF',
      success: '#4C7A5C',
      danger: '#A33B4A',
      overlay: 'rgba(59, 42, 46, 0.55)',
    },
    radius: { sm: '8px', md: '12px', lg: '20px', xl: '28px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(59, 42, 46, 0.08)',
      card: '0 6px 20px -14px rgba(59, 42, 46, 0.35)',
      lifted: '0 20px 44px -26px rgba(59, 42, 46, 0.45)',
      overlay: '0 28px 66px -34px rgba(59, 42, 46, 0.5)',
    },
    typography: { ...minimalTypography, displayWeight: 400, headingWeight: 500 },
    controls: { buttonWeight: 500, buttonTracking: '0.02em', buttonTransform: 'none' },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Violeta eletrico sobre branco puro. Para campanhas de impacto.',
    colors: {
      primary: '#100C1A',
      primaryForeground: '#FFFFFF',
      background: '#FFFFFF',
      foreground: '#100C1A',
      muted: '#6A6480',
      surface: '#F6F4FF',
      border: '#E2DEF2',
      accent: '#6D3BFF',
      accentForeground: '#FFFFFF',
      success: '#0F8A55',
      danger: '#C61E45',
      overlay: 'rgba(16, 12, 26, 0.6)',
    },
    radius: { sm: '2px', md: '4px', lg: '8px', xl: '12px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(16, 12, 26, 0.12)',
      card: '0 4px 14px -8px rgba(16, 12, 26, 0.35)',
      lifted: '0 18px 40px -24px rgba(109, 59, 255, 0.5)',
      overlay: '0 28px 64px -32px rgba(16, 12, 26, 0.6)',
    },
    typography: {
      ...minimalTypography,
      displayWeight: 700,
      headingWeight: 600,
      displayTracking: '-0.035em',
    },
    controls: { buttonWeight: 600, buttonTracking: '0.01em', buttonTransform: 'none' },
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    description: 'Cinza tecnico com verde de performance. Para linhas funcionais e activewear.',
    colors: {
      primary: '#0D1418',
      primaryForeground: '#FFFFFF',
      background: '#F1F4F5',
      foreground: '#0D1418',
      muted: '#5A666D',
      surface: '#FFFFFF',
      border: '#DCE3E6',
      accent: '#00B37E',
      accentForeground: '#04231A',
      success: '#00B37E',
      danger: '#D64545',
      overlay: 'rgba(13, 20, 24, 0.55)',
    },
    radius: { sm: '6px', md: '10px', lg: '16px', xl: '22px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(13, 20, 24, 0.1)',
      card: '0 2px 10px -6px rgba(13, 20, 24, 0.3)',
      lifted: '0 16px 36px -22px rgba(13, 20, 24, 0.45)',
      overlay: '0 26px 60px -32px rgba(13, 20, 24, 0.55)',
    },
    typography: {
      ...minimalTypography,
      displayWeight: 600,
      headingWeight: 600,
      labelTracking: '0.1em',
    },
    controls: { buttonWeight: 600, buttonTracking: '0.03em', buttonTransform: 'uppercase' },
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Azul institucional e cinzas frios. Para uma operacao mais formal.',
    colors: {
      primary: '#10233A',
      primaryForeground: '#FFFFFF',
      background: '#F5F7FA',
      foreground: '#10233A',
      muted: '#5B6B7C',
      surface: '#FFFFFF',
      border: '#DCE3EB',
      accent: '#1F6FEB',
      accentForeground: '#FFFFFF',
      success: '#1B7F4D',
      danger: '#B3261E',
      overlay: 'rgba(16, 35, 58, 0.55)',
    },
    radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(16, 35, 58, 0.08)',
      card: '0 1px 3px 0 rgba(16, 35, 58, 0.12)',
      lifted: '0 14px 30px -20px rgba(16, 35, 58, 0.4)',
      overlay: '0 24px 56px -30px rgba(16, 35, 58, 0.5)',
    },
    typography: { ...minimalTypography, displayWeight: 500, headingWeight: 600 },
    controls: { buttonWeight: 500, buttonTracking: '0.01em', buttonTransform: 'none' },
  },
  /**
   * Ponto de partida para uma identidade propria: copie `minimal` e substitua os
   * valores. O tema e aplicado por `NEXT_PUBLIC_THEME=custom` ou pelo atributo
   * `data-theme="custom"` no elemento `<html>`.
   */
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Modelo vazio para a identidade da sua loja. Edite em src/config/theme.ts.',
    colors: { ...minimalColors },
    radius: { sm: '2px', md: '4px', lg: '8px', xl: '12px', pill: '999px' },
    shadows: {
      hairline: '0 1px 0 0 rgba(17, 17, 17, 0.08)',
      card: '0 1px 2px 0 rgba(17, 17, 17, 0.06)',
      lifted: '0 12px 32px -18px rgba(17, 17, 17, 0.35)',
      overlay: '0 24px 60px -30px rgba(17, 17, 17, 0.45)',
    },
    typography: { ...minimalTypography },
    controls: { ...minimalControls },
  },
};

/** Tema aplicado quando nada mais e informado. */
export const defaultThemeId: ThemeId = 'minimal';
