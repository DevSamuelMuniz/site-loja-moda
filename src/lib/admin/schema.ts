import { z } from 'zod';

/**
 * Validacao dos formularios do painel (escopo §30: validar dados).
 *
 * O `FormData` chega todo em texto — checkbox vira `"on"`, campo vazio vira `""`. Estes
 * helpers fazem essa traducao **uma vez**, para que cada action descreva apenas a regra de
 * negocio dela. A validacao aqui e a que protege o banco; a do HTML e conveniencia.
 */

const blank = (value: unknown) => value === '' || value === null || value === undefined;

export const optionalText = z
  .preprocess((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value), z.string().trim().optional());

/** Dinheiro opcional: aceita vazio, virgula decimal e espaco. */
export const optionalMoney = z.preprocess((value) => {
  if (blank(value)) return undefined;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().finite().nonnegative().optional());

export const requiredMoney = z.preprocess((value) => {
  const normalized = String(value ?? '').replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().finite().positive());

export const optionalInt = z.preprocess((value) => {
  if (blank(value)) return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().int().nonnegative().optional());

export const requiredInt = z.preprocess((value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}, z.number().int().min(0));

export const checkbox = z.preprocess(
  (value) => value === 'on' || value === 'true' || value === true,
  z.boolean(),
);

/** Data opcional no formato `YYYY-MM-DD` do `<input type="date">`. */
export const optionalDate = z.preprocess((value) => {
  if (blank(value)) return undefined;
  const parsed = new Date(`${String(value)}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}, z.date().optional());

export const idField = z.string().trim().min(1);

/** Mensagem legivel a partir do erro do zod: `preco: informe um numero maior que zero`. */
export function describeIssues(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return 'Confira os campos e tente de novo.';

  const field = first.path.join('.');
  return field ? `${field}: ${first.message}` : first.message;
}
