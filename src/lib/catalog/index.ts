import { ecommerceConfig } from '@/config/ecommerce';
import { categories as categoryData } from '@/data/categories';
import { collections as collectionData } from '@/data/collections';
import { products as productData } from '@/data/products';
import {
  activeFilterCount,
  emptyFilters,
  filterProducts,
  matchesQuery,
  priceBounds,
  productCompareAtPrice,
  productIsOnSale,
  productPrice,
  sortProducts,
} from '@/lib/catalog/filters';
import type {
  Category,
  Collection,
  FacetValue,
  FilterFacets,
  Product,
  ProductFilters,
} from '@/types';

/**
 * Repositorio do catalogo.
 *
 * Esta e a unica porta de entrada para produtos, categorias e colecoes. Hoje os
 * dados vem de arquivos em `src/data`, mas toda a leitura passa pelas funcoes
 * abaixo: migrar para Postgres, Supabase ou uma API significa reescrever somente
 * este modulo, mantendo as mesmas assinaturas para as paginas.
 */

export interface CatalogDictionaries {
  categoryLabels: Record<string, string>;
  collectionLabels: Record<string, string>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

/** Registro enxuto usado pela busca instantanea do header. */
export interface SearchDocument {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  collectionLabel: string | null;
  price: number;
  compareAtPrice: number | null;
  image: string;
  sizes: string[];
  tags: string[];
  sku: string;
}

/** Ordem canonica dos tamanhos, para nao exibir a grade em ordem alfabetica. */
const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'Único'];

export function compareSizes(a: string, b: string): number {
  const indexA = SIZE_ORDER.indexOf(a);
  const indexB = SIZE_ORDER.indexOf(b);
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return Number(a) - Number(b);
}

export function allProducts(): Product[] {
  return productData;
}

export function categoryLabels(): Record<string, string> {
  return Object.fromEntries(categoryData.map((category) => [category.slug, category.name]));
}

export function collectionLabels(): Record<string, string> {
  return Object.fromEntries(collectionData.map((collection) => [collection.slug, collection.name]));
}

export function dictionaries(): CatalogDictionaries {
  return { categoryLabels: categoryLabels(), collectionLabels: collectionLabels() };
}

export function getCategories(options: { featuredOnly?: boolean } = {}): Category[] {
  const list = options.featuredOnly
    ? categoryData.filter((category) => category.featured === true)
    : categoryData;
  return [...list].sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoryData.find((category) => category.slug === slug);
}

export function getCollections(options: { featuredOnly?: boolean } = {}): Collection[] {
  const list = options.featuredOnly
    ? collectionData.filter((collection) => collection.featured === true)
    : collectionData;
  return [...list].sort((a, b) => a.order - b.order);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collectionData.find((collection) => collection.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return productData.find((product) => product.slug === slug);
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs
    .map((slug) => getProductBySlug(slug))
    .filter((product): product is Product => product !== undefined);
}

/** Tamanhos disponiveis no catalogo, na ordem canonica. */
export function getSizeOptions(): string[] {
  const sizes = new Set<string>();
  for (const product of productData) {
    for (const size of product.sizes) sizes.add(size);
  }
  return [...sizes].sort(compareSizes);
}

/** Cores disponiveis no catalogo, com a amostra de cada uma. */
export function getColorOptions(): Array<{
  slug: string;
  name: string;
  hex: string;
  count: number;
}> {
  const map = new Map<string, { slug: string; name: string; hex: string; count: number }>();

  for (const product of productData) {
    for (const color of product.colors) {
      const existing = map.get(color.slug);
      if (existing) {
        existing.count += 1;
        continue;
      }
      map.set(color.slug, { slug: color.slug, name: color.name, hex: color.hex, count: 1 });
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/** Tags do catalogo, ordenadas por frequencia e depois alfabeticamente. */
export function getTagOptions(): Array<{ value: string; count: number }> {
  const map = new Map<string, number>();
  for (const product of productData) {
    for (const tag of product.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt-BR'));
}

export function getProducts(filters: ProductFilters = emptyFilters): Product[] {
  return sortProducts(filterProducts(productData, filters, dictionaries()), filters.sort);
}

/** Resultado paginado, com a contagem total antes do recorte de pagina. */
export function queryProducts(
  filters: ProductFilters = emptyFilters,
  page = 1,
  pageSize: number = ecommerceConfig.catalog.pageSize,
): Paginated<Product> {
  const filtered = getProducts(filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page: current,
    pageCount,
    pageSize,
  };
}

/**
 * Contagem de resultados por valor de filtro.
 *
 * Cada dimensao e contada ignorando os proprios filtros daquela dimensao, para que
 * seja possivel ver as alternativas disponiveis sem desmarcar o que ja esta ativo.
 */
export function getFacets(filters: ProductFilters = emptyFilters): FilterFacets {
  const dict = dictionaries();
  const count = (
    dimension: Parameters<typeof filterProducts>[3],
    value: string,
    dimensionKey: string,
  ) =>
    filterProducts(
      productData,
      { ...filters, [dimensionKey]: [value] } as ProductFilters,
      dict,
      dimension,
    ).length;

  const categories: FacetValue[] = getCategories().map((category) => ({
    value: category.slug,
    label: category.name,
    count: count('categories', category.slug, 'categories'),
  }));

  const collections: FacetValue[] = getCollections().map((collection) => ({
    value: collection.slug,
    label: collection.name,
    count: filterProducts(productData, filters, dict, 'collections').filter((product) =>
      collection.slug === 'sale'
        ? productIsOnSale(product)
        : product.collection === collection.slug,
    ).length,
  }));

  const sizes: FacetValue[] = getSizeOptions().map((size) => ({
    value: size,
    label: size,
    count: filterProducts(productData, filters, dict, 'sizes').filter((product) =>
      product.sizes.includes(size),
    ).length,
  }));

  const colors: FacetValue[] = getColorOptions().map((color) => ({
    value: color.slug,
    label: color.name,
    hex: color.hex,
    count: filterProducts(productData, filters, dict, 'colors').filter((product) =>
      product.colors.some((entry) => entry.slug === color.slug),
    ).length,
  }));

  const tags: FacetValue[] = getTagOptions()
    .slice(0, 12)
    .map((tag) => ({
      value: tag.value,
      label: tag.value,
      count: filterProducts(productData, filters, dict, 'tags').filter((product) =>
        product.tags.includes(tag.value),
      ).length,
    }));

  return {
    categories,
    collections,
    sizes,
    colors,
    tags,
    priceRange: priceBounds(productData),
    total: filterProducts(productData, filters, dict).length,
  };
}

export function countActiveFilters(filters: ProductFilters): number {
  return activeFilterCount(filters);
}

/**
 * Produtos relacionados.
 *
 * Prioriza quem compartilha colecao e depois quem compartilha categoria ou tag, o
 * que mantem a recomendacao coerente com a peca que a pessoa esta vendo.
 */
export function getRelatedProducts(
  product: Product,
  limit = ecommerceConfig.catalog.relatedLimit,
): Product[] {
  const others = productData.filter((entry) => entry.slug !== product.slug);

  const scored = others.map((candidate) => {
    let score = 0;
    if (candidate.collection && candidate.collection === product.collection) score += 3;
    if (candidate.category === product.category) score += 2;
    if (candidate.audience === product.audience) score += 1;
    score += candidate.tags.filter((tag) => product.tags.includes(tag)).length;

    return { candidate, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.candidate.soldCount ?? 0) - (a.candidate.soldCount ?? 0) ||
        a.candidate.name.localeCompare(b.candidate.name, 'pt-BR'),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function getFeaturedProducts(limit = ecommerceConfig.catalog.featuredLimit): Product[] {
  return sortProducts(
    productData.filter((product) => product.featured === true),
    'relevancia',
  ).slice(0, limit);
}

export function getNewArrivals(limit = ecommerceConfig.catalog.newArrivalsLimit): Product[] {
  return sortProducts(
    productData.filter((product) => product.isNew === true),
    'recentes',
  ).slice(0, limit);
}

export function getSaleProducts(limit = ecommerceConfig.catalog.saleLimit): Product[] {
  return sortProducts(productData.filter(productIsOnSale), 'maior-preco').slice(0, limit);
}

/** Documento enxuto para a busca instantanea: nao carrega a descricao completa. */
export function getSearchDocuments(): SearchDocument[] {
  const dict = dictionaries();
  return productData.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: dict.categoryLabels[product.category] ?? product.category,
    collectionLabel: product.collection
      ? (dict.collectionLabels[product.collection] ?? null)
      : null,
    price: productPrice(product),
    compareAtPrice: productCompareAtPrice(product) ?? null,
    image: product.images[0] ?? '',
    sizes: product.sizes,
    tags: product.tags,
    sku: product.sku,
  }));
}

export function searchProducts(query: string, limit = 12): Product[] {
  const dict = dictionaries();
  return sortProducts(
    productData.filter((product) => matchesQuery(product, query, dict)),
    query.trim() ? 'relevancia' : 'recentes',
  ).slice(0, limit);
}

/** Numeros do catalogo, usados em chamadas de texto e no rodape. */
export function getCatalogSummary(): {
  productCount: number;
  categoryCount: number;
  collectionCount: number;
  priceRange: { min: number; max: number };
  onSaleCount: number;
} {
  return {
    productCount: productData.length,
    categoryCount: categoryData.length,
    collectionCount: collectionData.length,
    priceRange: priceBounds(productData),
    onSaleCount: productData.filter(productIsOnSale).length,
  };
}

export {
  emptyFilters,
  matchesQuery,
  productCompareAtPrice,
  productIsOnSale,
  productPrice,
  sortProducts,
} from '@/lib/catalog/filters';
export {
  buildHref,
  isPriceBandActive,
  pageHref,
  priceBands,
  readFilters,
  readPage,
  toggleValue,
  writeFilters,
} from '@/lib/catalog/params';
export type { PriceBand, RawSearchParams } from '@/lib/catalog/params';
