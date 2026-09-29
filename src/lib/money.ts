import { Prisma } from '@/generated/prisma/client';

/**
 * Matematica de dinheiro.
 *
 * Regra 5 do multi-tenant (`docs/platform.md`): dinheiro e `Decimal(10, 2)`, **nunca** ponto
 * flutuante. Somar `0.1 + 0.2` em `number` da `0.30000000000000004`, e um pedido de moda soma
 * dezenas de linhas antes de fechar o total — o erro aparece no centavo, na nota e no caixa.
 *
 * Todo calculo de valor passa por aqui. O `number` so existe na borda: entrada de formulario,
 * exibicao e as funcoes de formatacao de `src/lib/format.ts`.
 *
 * Modulo **de servidor**: importar o cliente Prisma em componente cliente colocaria o
 * runtime do banco no bundle.
 */

export type Money = Prisma.Decimal;

export const ZERO: Money = new Prisma.Decimal(0);

/** Converte entrada de fora (formulario, banco, string) em `Decimal`. */
export function money(value: number | string | Prisma.Decimal | null | undefined): Money {
  if (value === null || value === undefined || value === '') return new Prisma.Decimal(0);

  const decimal = value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
  if (!decimal.isFinite()) return new Prisma.Decimal(0);

  /* Duas casas desde a entrada: `Decimal(10,2)` trunca na gravacao e o total precisa fechar
     com o que foi gravado. */
  return decimal.toDecimalPlaces(2);
}

export function multiply(value: Money, factor: number): Money {
  return value.mul(factor).toDecimalPlaces(2);
}

export function sum(values: readonly Money[]): Money {
  return values.reduce<Money>((total, value) => total.add(value), new Prisma.Decimal(0));
}

/**
 * Leitura para a interface.
 *
 * O arredondamento e na ultima casa, com o valor ja somado em `Decimal` — nunca no meio da
 * conta. `formatCurrency` espera `number`.
 */
export function toNumber(value: Prisma.Decimal | null | undefined): number {
  return value === null || value === undefined ? 0 : value.toNumber();
}

export function isNegative(value: Money): boolean {
  return value.isNegative() && !value.isZero();
}

/** Valor gravavel numa coluna `Decimal(10,2)`. */
export function toDecimalInput(value: Money): string {
  return value.toFixed(2);
}
