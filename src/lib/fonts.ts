import { Inter, Manrope } from 'next/font/google';

/**
 * Fontes da marca.
 *
 * Manrope conduz os titulos: e uma grotesca geometrica com pesos leves o suficiente
 * para funcionar em corpos grandes, o que da o tom editorial do site. Inter fica com
 * o texto corrido e a interface, pelo desenho neutro em tamanhos pequenos.
 *
 * Para trocar de fonte: altere os imports abaixo e depois a pilha em
 * `fontStacks` (`src/config/theme.ts`).
 */
export const displayFont = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/** Classes aplicadas ao `<html>` para publicar as variaveis das fontes. */
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;
