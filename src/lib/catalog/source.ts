import { cache } from 'react';
import { getPrisma } from '@/lib/db';
import type {
  Category,
  Collection,
  Product,
  ProductColor,
  ProductMeasurement,
  ProductVariant,
} from '@/types';

/**
 * Leitura do catalogo no banco.
 *
 * Esta e a unica camada que fala com o Prisma. O resto do repositorio
 * (`src/lib/catalog/index.ts`) trabalha sobre o snapshot devolvido aqui, mantendo intacta
 * toda a logica pura de busca, filtro, ordenacao e facetas — que e o que garante que as
 * paginas continuem identicas depois da troca de origem.
 *
 * `cache()` do React deduplica a leitura dentro de uma mesma renderizacao: uma pagina que
 * chama `getProductBySlug`, `getRelatedProducts` e `generateMetadata` faz uma ida ao banco,
 * nao tres.
 *
 * Escala: com 14 produtos, carregar o catalogo ativo e classificar em memoria e o caminho
 * mais simples e mais fiel ao comportamento atual. Quando o catalogo crescer, o proximo
 * passo e empurrar filtro, ordenacao, paginacao e contagem de facetas para o SQL
 * (`where`/`orderBy`/`skip`/`take` e `groupBy`) — este modulo e o lugar dessa mudanca.
 */

export interface CatalogStore {
  id: string;
  slug: string;
  name: string;
  currency: string;
  locale: string;
}

export interface CatalogSnapshot {
  store: CatalogStore;
  products: Product[];
  categories: Category[];
  collections: Collection[];
}

type DecimalLike = { toNumber: () => number } | number | string | null | undefined;

function toNumber(value: DecimalLike): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return value.toNumber();
}

function toMeasurements(value: unknown): ProductMeasurement[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const { label, value: text } = entry as { label?: unknown; value?: unknown };
    return typeof label === 'string' && typeof text === 'string' ? [{ label, value: text }] : [];
  });
}

function toAudience(
  value: 'FEMININO' | 'MASCULINO' | 'UNISSEX',
): 'feminino' | 'masculino' | 'unissex' {
  if (value === 'FEMININO') return 'feminino';
  if (value === 'MASCULINO') return 'masculino';
  return 'unissex';
}

/**
 * Resolve a loja do tenant.
 *
 * Na FASE 1 existe uma loja ativa. Com multi-tenant (FASE 5), o host da requisicao resolve
 * a loja na loja publica e a sessao resolve no painel — nunca o cliente informando
 * `storeId` (escopo §22).
 */
async function loadStore() {
  const store = await getPrisma().store.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });

  if (!store) {
    throw new Error(
      'Nenhuma loja ativa no banco. Rode as migrations e o seed: `npm run db:migrate` e `npm run db:seed`.',
    );
  }

  return store;
}

export const loadCatalog = cache(async (): Promise<CatalogSnapshot> => {
  const prisma = getPrisma();
  const store = await loadStore();

  const [categories, collections, products] = await Promise.all([
    prisma.category.findMany({
      where: { storeId: store.id, deletedAt: null },
      orderBy: { position: 'asc' },
    }),
    prisma.collection.findMany({
      where: { storeId: store.id, deletedAt: null },
      orderBy: { position: 'asc' },
    }),
    /* Somente produto publicado e nao excluido chega na loja publica. */
    prisma.product.findMany({
      where: { storeId: store.id, deletedAt: null, status: 'ACTIVE' },
      orderBy: { releasedAt: 'desc' },
      include: {
        colors: { orderBy: { position: 'asc' } },
        images: { orderBy: { position: 'asc' } },
        variants: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: { inventory: true, color: { select: { slug: true } } },
        },
      },
    }),
  ]);

  const categoryBySlug = new Map(categories.map((category) => [category.id, category.slug]));
  const collectionById = new Map(collections.map((collection) => [collection.id, collection.slug]));

  const mappedProducts: Product[] = products.map((row) => {
    const variants: ProductVariant[] = row.variants.map((variant) => ({
      id: variant.id,
      colorSlug: variant.color?.slug ?? '',
      size: variant.size,
      sku: variant.sku,
      stock: variant.inventory?.quantity ?? 0,
      price: toNumber(variant.price),
    }));

    /* A ordem vem do `position` da variacao, que o seed gravou na ordem da grade. */
    const sizes = [...new Set(row.variants.map((variant) => variant.size))];

    const colors: ProductColor[] = row.colors.map((color) => {
      const colorVariants = row.variants.filter((variant) => variant.colorId === color.id);

      return {
        name: color.name,
        slug: color.slug,
        hex: color.hex,
        image: color.image ?? undefined,
        /* O SKU pertence a variacao; a cor nao tem SKU proprio no modelo. */
        stock: colorVariants.reduce(
          (total, variant) => total + (variant.inventory?.quantity ?? 0),
          0,
        ),
      };
    });

    const stock = variants.reduce((total, variant) => total + variant.stock, 0);
    const price = toNumber(row.price) ?? 0;
    const compareAtPrice = toNumber(row.compareAtPrice);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? '',
      story: row.story ?? '',
      category: row.categoryId ? (categoryBySlug.get(row.categoryId) ?? '') : '',
      collection: row.collectionId ? collectionById.get(row.collectionId) : undefined,
      audience: toAudience(row.audience),
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
      images: row.images.map((image) => image.url),
      colors,
      sizes,
      tags: row.tags,
      featured: row.featured,
      isNew: row.isNew,
      stock,
      sku: row.sku,
      composition: row.composition ?? '',
      care: row.care,
      details: row.details,
      measurements: toMeasurements(row.measurements),
      rating: toNumber(row.ratingAvg),
      reviewCount: row.reviewCount,
      soldCount: row.soldCount,
      releasedAt: (row.releasedAt ?? row.createdAt).toISOString(),
      variants,
    };
  });

  return {
    store: {
      id: store.id,
      slug: store.slug,
      name: store.name,
      currency: store.currency,
      locale: store.locale,
    },
    products: mappedProducts,
    categories: categories.map((row) => ({
      slug: row.slug,
      name: row.name,
      kind: row.kind === 'AUDIENCE' ? 'audience' : 'product',
      description: row.description ?? '',
      image: row.image ?? '',
      audience: toAudience(row.audience),
      featured: row.featured,
      order: row.position,
    })),
    collections: collections.map((row) => ({
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? '',
      description: row.description ?? '',
      image: row.image ?? '',
      badge: row.badge ?? undefined,
      featured: row.featured,
      order: row.position,
      releasedAt: (row.releasedAt ?? row.createdAt).toISOString(),
    })),
  };
});
