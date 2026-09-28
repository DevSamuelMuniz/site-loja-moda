/**
 * Funde a configuracao gravada na loja sobre o padrao do projeto.
 *
 * A coluna `settings.value` e `Json`: nao ha garantia de forma. Em vez de confiar nela, o
 * valor guardado e sobreposto ao padrao campo a campo:
 *
 * - objeto sobre objeto entra campo a campo, entao uma loja pode gravar so o que mudou;
 * - lista substitui a lista inteira (nao faz sentido fundir item a item);
 * - **chave que nao existe no padrao e ignorada**, para que um valor estranho no banco nao
 *   consiga injetar campo novo na interface;
 * - tipo diferente do padrao mantem o padrao, em vez de deixar um numero virar texto.
 *
 * Assim uma linha ausente, parcial ou de formato antigo nunca derruba a pagina: no pior caso
 * ela mostra o padrao.
 */

const MAX_DEPTH = 6;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeSetting<T>(base: T, override: unknown, depth = 0): T {
  if (override === undefined || override === null) return base;
  if (depth >= MAX_DEPTH) return base;

  if (isRecord(base)) {
    if (!isRecord(override)) return base;

    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (!(key in base)) continue;
      merged[key] = mergeSetting((base as Record<string, unknown>)[key], value, depth + 1);
    }
    return merged as T;
  }

  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;

  return (typeof base === typeof override ? override : base) as T;
}
