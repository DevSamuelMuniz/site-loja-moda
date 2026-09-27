/**
 * Utilidades sem dependencias externas compartilhadas por todo o projeto.
 */

export type ClassValue = string | number | false | null | undefined | ClassValue[];

/** Concatena classes condicionais sem duplicar logica de template string. */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];

  const collect = (value: ClassValue): void => {
    if (value === null || value === undefined || value === false || value === '') return;
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    classes.push(String(value));
  };

  values.forEach(collect);
  return classes.join(' ');
}

/** Remove acentos, espacos e pontuacao; usado para slugs e comparacoes de busca. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normaliza texto para busca: sem acentos, sem caixa, espacos colapsados. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/** Primeiro item de uma lista, com fallback explicito. */
export function first<T>(values: readonly T[] | undefined, fallback: T): T {
  const [head] = values ?? [];
  return head ?? fallback;
}

/** Converte `?a=1&a=2` (que chega como array) em um valor normalizado unico. */
export function toSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((entry) => entry.split(','))
    .filter(Boolean);
}
