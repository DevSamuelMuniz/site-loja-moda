import { ecommerceConfig } from '@/config/ecommerce';
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
import { loadCatalog, type CatalogSnapshot } from '@/lib/catalog/source';
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
 * Esta e a unica porta de entrada para produtos, categorias e colecoes. A origem e o
 * banco (`src/lib/catalog/source.ts`); a logica de busca, filtro, ordenacao e facetas
 * continua nas funcoes puras de `filters.ts`, operando sobre o snapshot.
 *
 * As funcoes sao assincronas porque a leitura vai ao banco. As paginas so precisam de
 * `await` — o que elas renderizam nao mudou.
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

function dictionariesOf(snapshot: CatalogSnapshot): CatalogDictionaries {
  return {
    categoryLabels: Object.fromEntries(
      snapshot.categories.map((category) => [category.slug, category.name]),
    ),
    collectionLabels: Object.fromEntries(
      snapshot.collections.map((collection) => [collection.slug, collection.name]),
    ),
  };
}

export async function allProducts(): Promise<Product[]> {
  const snapshot = await loadCatalog();
  return snapshot.products;
}

export async function categoryLabels(): Promise<Record<string, string>> {
  const snapshot = await loadCatalog();
  return dictionariesOf(snapshot).categoryLabels;
}

export async function collectionLabels(): Promise<Record<string, string>> {
  const snapshot = await loadCatalog();
  return dictionariesOf(snapshot).collectionLabels;
}

export async function dictionaries(): Promise<CatalogDictionaries> {
  const snapshot = await loadCatalog();
  return dictionariesOf(snapshot);
}

export async function getCategories(options: { featuredOnly?: boolean } = {}): Promise<Category[]> {
  const { categories } = await loadCatalog();
  const list = options.featuredOnly
    ? categories.filter((category) => category.featured === true)
    : categories;
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { categories } = await loadCatalog();
  return categories.find((category) => category.slug === slug);
}

export async function getCollections(
  options: { featuredOnly?: boolean } = {},
): Promise<Collection[]> {
  const { collections } = await loadCatalog();
  const list = options.featuredOnly
    ? collections.filter((collection) => collection.featured === true)
    : collections;
  return [...list].sort((a, b) => a.order - b.order);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const { collections } = await loadCatalog();
  return collections.find((collection) => collection.slug === slug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { products } = await loadCatalog();
  return products.find((product) => product.slug === slug);
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const { products } = await loadCatalog();
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is Product => product !== undefined);
}

/** Tamanhos disponiveis no catalogo, na ordem canonica. */
export async function getSizeOptions(): Promise<string[]> {
  const { products } = await loadCatalog();
  const sizes = new Set<string>();
  for (const product of products) {
    for (const size of product.sizes) sizes.add(size);
  }
  return [...sizes].sort(compareSizes);
}

/** Cores disponiveis no catalogo, com a amostra de cada uma. */
export async function getColorOptions(): Promise<
  Array<{ slug: string; name: string; hex: string; count: number }>
> {
  const { products } = await loadCatalog();
  const map = new Map<string, { slug: string; name: string; hex: string; count: number }>();

  for (const product of products) {
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
export async function getTagOptions(): Promise<Array<{ value: string; count: number }>> {
  const { products } = await loadCatalog();
  const map = new Map<string, number>();
  for (const product of products) {
    for (const tag of product.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt-BR'));
}

export async function getProducts(filters: ProductFilters = emptyFilters): Promise<Product[]> {
  const snapshot = await loadCatalog();
  return sortProducts(
    filterProducts(snapshot.products, filters, dictionariesOf(snapshot)),
    filters.sort,
  );
}

/** Resultado paginado, com a contagem total antes do recorte de pagina. */
export async function queryProducts(
  filters: ProductFilters = emptyFilters,
  page = 1,
  pageSize: number = ecommerceConfig.catalog.pageSize,
): Promise<Paginated<Product>> {
  const filtered = await getProducts(filters);
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
 * Cada dimensao e contada ignorando os proprios filtros daquela dimensao, para que seja
 * possivel ver as alternativas disponiveis sem desmarcar o que ja esta ativo.
 */
export async function getFacets(filters: ProductFilters = emptyFilters): Promise<FilterFacets> {
  const snapshot = await loadCatalog();
  const { products } = snapshot;
  const dict = dictionariesOf(snapshot);

  const count = (
    dimension: Parameters<typeof filterProducts>[3],
    value: string,
    dimensionKey: string,
  ) =>
    filterProducts(
      products,
      { ...filters, [dimensionKey]: [value] } as ProductFilters,
      dict,
      dimension,
    ).length;

  const categories: FacetValue[] = (await getCategories()).map((category) => ({
    value: category.slug,
    label: category.name,
    count: count('categories', category.slug, 'categories'),
  }));

  const collections: FacetValue[] = (await getCollections()).map((collection) => ({
    value: collection.slug,
    label: collection.name,
    count: filterProducts(products, filters, dict, 'collections').filter((product) =>
      collection.slug === 'sale'
        ? productIsOnSale(product)
        : product.collection === collection.slug,
    ).length,
  }));

  const sizes: FacetValue[] = (await getSizeOptions()).map((size) => ({
    value: size,
    label: size,
    count: filterProducts(products, filters, dict, 'sizes').filter((product) =>
      product.sizes.includes(size),
    ).length,
  }));

  const colors: FacetValue[] = (await getColorOptions()).map((color) => ({
    value: color.slug,
    label: color.name,
    hex: color.hex,
    count: filterProducts(products, filters, dict, 'colors').filter((product) =>
      product.colors.some((entry) => entry.slug === color.slug),
    ).length,
  }));

  const tags: FacetValue[] = (await getTagOptions()).slice(0, 12).map((tag) => ({
    value: tag.value,
    label: tag.value,
    count: filterProducts(products, filters, dict, 'tags').filter((product) =>
      product.tags.includes(tag.value),
    ).length,
  }));

  return {
    categories,
    collections,
    sizes,
    colors,
    tags,
    priceRange: priceBounds(products),
    total: filterProducts(products, filters, dict).length,
  };
}

export function countActiveFilters(filters: ProductFilters): number {
  return activeFilterCount(filters);
}

/**
 * Produtos relacionados.
 *
 * Prioriza quem compartilha colecao e depois quem compartilha categoria ou tag, o que
 * mantem a recomendacao coerente com a peca que a pessoa esta vendo.
 */
export async function getRelatedProducts(
  product: Product,
  limit = ecommerceConfig.catalog.relatedLimit,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  const others = products.filter((entry) => entry.slug !== product.slug);

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

export async function getFeaturedProducts(
  limit = ecommerceConfig.catalog.featuredLimit,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  return sortProducts(
    products.filter((product) => product.featured === true),
    'relevancia',
  ).slice(0, limit);
}

export async function getNewArrivals(
  limit = ecommerceConfig.catalog.newArrivalsLimit,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  return sortProducts(
    products.filter((product) => product.isNew === true),
    'recentes',
  ).slice(0, limit);
}

export async function getSaleProducts(
  limit = ecommerceConfig.catalog.saleLimit,
): Promise<Product[]> {
  const { products } = await loadCatalog();
  return sortProducts(products.filter(productIsOnSale), 'maior-preco').slice(0, limit);
}

/** Documento enxuto para a busca instantanea: nao carrega a descricao completa. */
export async function getSearchDocuments(): Promise<SearchDocument[]> {
  const snapshot = await loadCatalog();
  const dict = dictionariesOf(snapshot);

  return snapshot.products.map((product) => ({
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

export async function searchProducts(query: string, limit = 12): Promise<Product[]> {
  const snapshot = await loadCatalog();
  const dict = dictionariesOf(snapshot);

  return sortProducts(
    snapshot.products.filter((product) => matchesQuery(product, query, dict)),
    query.trim() ? 'relevancia' : 'recentes',
  ).slice(0, limit);
}

/** Numeros do catalogo, usados em chamadas de texto e no rodape. */
export async function getCatalogSummary(): Promise<{
  productCount: number;
  categoryCount: number;
  collectionCount: number;
  priceRange: { min: number; max: number };
  onSaleCount: number;
}> {
  const snapshot = await loadCatalog();

  return {
    productCount: snapshot.products.length,
    categoryCount: snapshot.categories.length,
    collectionCount: snapshot.collections.length,
    priceRange: priceBounds(snapshot.products),
    onSaleCount: snapshot.products.filter(productIsOnSale).length,
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
