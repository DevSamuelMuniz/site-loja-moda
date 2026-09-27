import { defaultThemeId, themes } from '@/config/theme';
import type { Theme, ThemeColors, ThemeId } from '@/types/theme';

/**
 * Theme Engine.
 *
 * Fonte unica de verdade: `src/config/theme.ts`. Este modulo converte os tokens de
 * um tema em variaveis CSS e gera o bloco de CSS injetado no `<html>` pelo layout
 * raiz. Nenhum componente conhece valores de cor, raio, sombra ou fonte.
 */

/** Converte camelCase em kebab-case: `primaryForeground` -> `primary-foreground`. */
function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function colorVariables(colors: ThemeColors): Array<[string, string]> {
  return Object.entries(colors).map(([key, value]) => [`--color-${kebab(key)}`, value]);
}

/** Variaveis CSS de um tema, na ordem em que sao declaradas. */
export function themeVariables(theme: Theme): Array<[string, string]> {
  const { radius, shadows, typography, controls } = theme;

  return [
    ...colorVariables(theme.colors),
    ...Object.entries(radius).map(([key, value]): [string, string] => [
      `--radius-${kebab(key)}`,
      value,
    ]),
    ...Object.entries(shadows).map(([key, value]): [string, string] => [
      `--shadow-${kebab(key)}`,
      value,
    ]),
    ['--font-display', typography.displayFamily],
    ['--font-body', typography.bodyFamily],
    ['--weight-display', String(typography.displayWeight)],
    ['--weight-heading', String(typography.headingWeight)],
    ['--weight-body', String(typography.bodyWeight)],
    ['--weight-label', String(typography.labelWeight)],
    ['--tracking-display', typography.displayTracking],
    ['--tracking-label', typography.labelTracking],
    ['--heading-transform', typography.headingTransform],
    ['--button-weight', String(controls.buttonWeight)],
    ['--button-tracking', controls.buttonTracking],
    ['--button-transform', controls.buttonTransform],
  ];
}

function declarations(theme: Theme, indent = '  '): string {
  return themeVariables(theme)
    .map(([property, value]) => `${indent}${property}: ${value};`)
    .join('\n');
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return typeof value === 'string' && Object.hasOwn(themes, value);
}

/** Tema ativo, lido de `NEXT_PUBLIC_THEME` com fallback para o tema padrao. */
export function getActiveThemeId(): ThemeId {
  const fromEnv = process.env.NEXT_PUBLIC_THEME;
  return isThemeId(fromEnv) ? fromEnv : defaultThemeId;
}

export function getTheme(id?: string | null): Theme {
  const theme = isThemeId(id) ? themes[id] : themes[defaultThemeId];
  return theme;
}

/** Lista de temas disponiveis, util para um seletor de tema. */
export function listThemes(): Theme[] {
  return Object.values(themes);
}

/**
 * CSS completo do sistema de temas: o tema padrao em `:root` e um bloco por tema em
 * `[data-theme="<id>"]`, permitindo trocar de tema em runtime apenas alterando o
 * atributo no elemento `<html>`.
 */
export function themeCss(activeId: ThemeId = getActiveThemeId()): string {
  const active = getTheme(activeId);
  const blocks = [`:root {\n${declarations(active)}\n}`];

  for (const theme of listThemes()) {
    if (theme.id === activeId) continue;
    blocks.push(`[data-theme="${theme.id}"] {\n${declarations(theme)}\n}`);
  }

  return blocks.join('\n\n');
}

/** Atributos para a tag `<style>` que carrega o tema (React 19 eleva ao `<head>`). */
export const themeStyleProps = {
  href: 'aura-theme',
  precedence: 'high',
} as const;
