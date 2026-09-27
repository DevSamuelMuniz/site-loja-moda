import { SALE_COLLECTION_SLUG } from '@/data/collections';
import { normalizeText } from '@/lib/utils';
import type { Product, ProductFilters, SortKey, SortOption } from '@/types';

/**
 * Regras puras do catalogo: comparacao de busca, filtragem, ordenacao e faixas.
 * Nada aqui conhece React nem o formato da URL — isso fica em `params.ts`.
 */

export const SORT_OPTIONS: SortOption[] = [
  { key: 'relevancia', label: 'Mais relevantes' },
  { key: 'recentes', label: 'Mais recentes' },
  { key: 'menor-preco', label: 'Menor preço' },
  { key: 'maior-preco', label: 'Maior preço' },
  { key: 'mais-vendidos', label: 'Mais vendidos' },
];

export const SORT_KEYS: SortKey[] = SORT_OPTIONS.map((option) => option.key);

export function isSortKey(value: string | undefined): value is SortKey {
  return value !== undefined && (SORT_KEYS as string[]).includes(value);
}

export function sortLabel(key: SortKey): string {
  return SORT_OPTIONS.find((option) => option.key === key)?.label ?? SORT_OPTIONS[0]!.label;
}

export const emptyFilters: ProductFilters = {
  query: '',
  categories: [],
  collections: [],
  sizes: [],
  colors: [],
  tags: [],
  onlyAvailable: false,
  onlySale: false,
  onlyNew: false,
  sort: 'relevancia',
};

/** Dimensoes que podem ser ignoradas ao contar resultados de um filtro. */
export type FilterDimension =
  | 'query'
  | 'categories'
  | 'collections'
  | 'sizes'
  | 'colors'
  | 'tags'
  | 'price'
  | 'availability'
  | 'sale'
  | 'new';

/** Preco exibido do produto, considerando eventual preco proprio de uma cor. */
export function productPrice(product: Product): number {
  let price = product.price;
  for (const color of product.colors) {
    if (typeof color.price === 'number' && color.price < price) price = color.price;
  }
  return price;
}

/** Preco "de" mais alto, usado para calcular o desconto exibido. */
export function productCompareAtPrice(product: Product): number | undefined {
  let compareAt = product.compareAtPrice;
  for (const color of product.colors) {
    if (
      typeof color.compareAtPrice === 'number' &&
      (compareAt === undefined || color.compareAtPrice > compareAt)
    ) {
      compareAt = color.compareAtPrice;
    }
  }
  return compareAt !== undefined && compareAt > productPrice(product) ? compareAt : undefined;
}

export function productIsOnSale(product: Product): boolean {
  return product.isSale === true || productCompareAtPrice(product) !== undefined;
}

/** Estoque total: usa o campo do produto e, na ausencia dele, soma as cores. */
export function productStock(product: Product): number {
  if (typeof product.stock === 'number') return product.stock;
  return product.colors.reduce((total, color) => total + color.stock, 0);
}

export function productIsAvailable(product: Product): boolean {
  return productStock(product) > 0;
}

export function productColors(product: Product): string[] {
  return product.colors.map((color) => color.slug);
}

export function priceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const product of products) {
    const price = productPrice(product);
    if (price < min) min = price;
    if (price > max) max = price;
  }
  return { min: Math.floor(min), max: Math.ceil(max) };
}

/**
 * Verifica se o produto casa com a colecao informada.
 * A colecao `sale` e virtual e resolvida pelo estado promocional do produto.
 */
export function matchesCollection(product: Product, collectionSlug: string): boolean {
  if (collectionSlug === SALE_COLLECTION_SLUG) return productIsOnSale(product);
  return product.collection === collectionSlug;
}

/**
 * Busca textual.
 *
 * Cobre exatamente os campos pedidos no catalogo: nome, categoria, colecao, SKU e
 * tags — alem da descricao e do publico, que ajudam a encontrar a peca por palavras
 * do dia a dia ("masculino", "linho").
 */
export function matchesQuery(
  product: Product,
  query: string,
  dictionaries: {
    categoryLabels: Record<string, string>;
    collectionLabels: Record<string, string>;
  },
): boolean {
  const normalized = normalizeText(query);
  if (!normalized) return true;

  const haystack = normalizeText(
    [
      product.name,
      product.description,
      product.story,
      product.sku,
      product.category,
      dictionaries.categoryLabels[product.category] ?? '',
      product.collection ?? '',
      dictionaries.collectionLabels[product.collection ?? ''] ?? '',
      product.audience,
      ...product.tags,
      ...product.colors.map((color) => color.name),
    ].join(' '),
  );

  // Cada termo digitado precisa aparecer, o que torna a busca previsivel.
  return normalized.split(' ').every((term) => haystack.includes(term));
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  dictionaries: {
    categoryLabels: Record<string, string>;
    collectionLabels: Record<string, string>;
  },
  ignore?: FilterDimension,
): Product[] {
  const bounds = priceBounds(products);

  return products.filter((product) => {
    if (ignore !== 'query' && !matchesQuery(product, filters.query, dictionaries)) return false;

    if (ignore !== 'categories' && filters.categories.length > 0) {
      const byCategory = filters.categories.includes(product.category);
      const byAudience = filters.categories.includes(product.audience);
      if (!byCategory && !byAudience) return false;
    }

    if (ignore !== 'collections' && filters.collections.length > 0) {
      if (!filters.collections.some((slug) => matchesCollection(product, slug))) return false;
    }

    if (ignore !== 'sizes' && filters.sizes.length > 0) {
      if (!filters.sizes.some((size) => product.sizes.includes(size))) return false;
    }

    if (ignore !== 'colors' && filters.colors.length > 0) {
      if (!filters.colors.some((color) => productColors(product).includes(color))) return false;
    }

    if (ignore !== 'tags' && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => product.tags.includes(tag))) return false;
    }

    if (ignore !== 'price') {
      const price = productPrice(product);
      const min = filters.minPrice ?? bounds.min;
      const max = filters.maxPrice ?? bounds.max;
      if (price < min || price > max) return false;
    }

    if (ignore !== 'availability' && filters.onlyAvailable && !productIsAvailable(product))
      return false;
    if (ignore !== 'sale' && filters.onlySale && !productIsOnSale(product)) return false;
    if (ignore !== 'new' && filters.onlyNew && product.isNew !== true) return false;

    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'recentes':
      return sorted.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    case 'menor-preco':
      return sorted.sort((a, b) => productPrice(a) - productPrice(b));
    case 'maior-preco':
      return sorted.sort((a, b) => productPrice(b) - productPrice(a));
    case 'mais-vendidos':
      return sorted.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    case 'relevancia':
    default:
      return sorted.sort((a, b) => {
        const featured = Number(b.featured === true) - Number(a.featured === true);
        if (featured !== 0) return featured;
        const rating = (b.rating ?? 0) - (a.rating ?? 0);
        if (rating !== 0) return rating;
        return (b.soldCount ?? 0) - (a.soldCount ?? 0);
      });
  }
}

/** Quantidade de filtros ativos, usada no contador do botao de filtros no mobile. */
export function activeFilterCount(filters: ProductFilters): number {
  return (
    filters.categories.length +
    filters.collections.length +
    filters.sizes.length +
    filters.colors.length +
    filters.tags.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.onlyAvailable ? 1 : 0) +
    (filters.onlySale ? 1 : 0) +
    (filters.onlyNew ? 1 : 0)
  );
}
