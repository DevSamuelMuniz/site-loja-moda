/**
 * Parametros de URL do painel.
 *
 * `searchParams` e entrada externa: vem do navegador e pode conter qualquer coisa. Toda
 * leitura aqui valida antes de usar — pagina negativa, `pageSize` gigante ou filtro fora da
 * lista caem no padrao em vez de virar consulta cara ou erro de tela (§30).
 */

export const DEFAULT_PAGE_SIZE = 20;

export function readPage(value: string | string[] | undefined, pageSize = DEFAULT_PAGE_SIZE) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? '', 10);

  return {
    page: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
    pageSize,
  };
}

export function readText(value: string | string[] | undefined, maxLength = 120): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  return trimmed.slice(0, maxLength);
}

export function readEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw !== undefined && (allowed as readonly string[]).includes(raw) ? (raw as T) : undefined;
}

export function pageCount(total: number, pageSize = DEFAULT_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Codigo de aviso vindo da URL (`?ok=salvo`), pronto para `FlashNotice`. */
export function readFlash(value: string | string[] | undefined): string | undefined {
  return readText(value, 40);
}

/** Monta a query string preservando os filtros ativos, trocando so o que muda. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}
