import { emptyFilters, isSortKey } from '@/lib/catalog/filters';
import { toList, toSingle } from '@/lib/utils';
import type { ProductFilters } from '@/types';

/**
 * Contrato entre a URL e os filtros.
 *
 * Os nomes dos parametros sao curtos e em portugues, para que os links filtrados
 * continuem legiveis quando alguem compartilha a pagina:
 *
 *   /produtos?categoria=jeans&cor=azul&ordenar=menor-preco
 */

export const FILTER_PARAM_KEYS = [
  'busca',
  'categoria',
  'colecao',
  'tamanho',
  'cor',
  'tag',
  'min',
  'max',
  'disponivel',
  'promocao',
  'novidades',
  'ordenar',
  'pagina',
] as const;

export type RawSearchParams = Record<string, string | string[] | undefined>;

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Le os filtros da URL, ignorando valores invalidos. */
export function readFilters(params: RawSearchParams): ProductFilters {
  const sort = toSingle(params.ordenar);
  const min = toNumber(toSingle(params.min));
  const max = toNumber(toSingle(params.max));

  return {
    ...emptyFilters,
    query: toSingle(params.busca)?.trim() ?? '',
    categories: toList(params.categoria),
    collections: toList(params.colecao),
    sizes: toList(params.tamanho),
    colors: toList(params.cor),
    tags: toList(params.tag),
    ...(min !== undefined ? { minPrice: min } : {}),
    ...(max !== undefined ? { maxPrice: max } : {}),
    onlyAvailable: toSingle(params.disponivel) === '1',
    onlySale: toSingle(params.promocao) === '1',
    onlyNew: toSingle(params.novidades) === '1',
    sort: isSortKey(sort) ? sort : emptyFilters.sort,
  };
}

/** Converte filtros de volta para query string, sem o separador `?`. */
export function writeFilters(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set('busca', filters.query.trim());
  if (filters.categories.length) params.set('categoria', filters.categories.join(','));
  if (filters.collections.length) params.set('colecao', filters.collections.join(','));
  if (filters.sizes.length) params.set('tamanho', filters.sizes.join(','));
  if (filters.colors.length) params.set('cor', filters.colors.join(','));
  if (filters.tags.length) params.set('tag', filters.tags.join(','));
  if (filters.minPrice !== undefined) params.set('min', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('max', String(filters.maxPrice));
  if (filters.onlyAvailable) params.set('disponivel', '1');
  if (filters.onlySale) params.set('promocao', '1');
  if (filters.onlyNew) params.set('novidades', '1');
  if (filters.sort !== emptyFilters.sort) params.set('ordenar', filters.sort);

  return params.toString();
}

/** Alterna um valor em uma lista de filtros de selecao multipla. */
export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

/**
 * Monta o href de um filtro aplicado sobre o estado atual.
 *
 * Qualquer alteracao de filtro descarta a paginacao, para nao cair em uma pagina
 * que nao existe mais no novo resultado.
 */
export function buildHref(
  basePath: string,
  filters: ProductFilters,
  patch: Partial<ProductFilters> = {},
): string {
  const merged: ProductFilters = { ...filters, ...patch };
  const query = writeFilters(merged);
  return query ? `${basePath}?${query}` : basePath;
}

/** Href de uma pagina especifica mantendo os filtros ativos. */
export function pageHref(basePath: string, filters: ProductFilters, page: number): string {
  const query = writeFilters(filters);
  const params = new URLSearchParams(query);
  if (page > 1) params.set('pagina', String(page));
  const serialized = params.toString();
  return serialized ? `${basePath}?${serialized}` : basePath;
}

export function readPage(params: RawSearchParams): number {
  const page = Number(toSingle(params.pagina) ?? '1');
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

/** Faixas de preco sugeridas na barra de filtros. */
export interface PriceBand {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export const priceBands: PriceBand[] = [
  { id: 'ate-150', label: 'Até R$ 150', max: 150 },
  { id: '150-300', label: 'R$ 150 a R$ 300', min: 150, max: 300 },
  { id: '300-450', label: 'R$ 300 a R$ 450', min: 300, max: 450 },
  { id: 'acima-450', label: 'Acima de R$ 450', min: 450 },
];

/** Indica se a faixa informada e exatamente a que esta ativa. */
export function isPriceBandActive(filters: ProductFilters, band: PriceBand): boolean {
  return filters.minPrice === band.min && filters.maxPrice === band.max;
}
