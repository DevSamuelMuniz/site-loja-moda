import { getPrisma } from '@/lib/db';
import { LOW_STOCK_THRESHOLD } from '@/lib/inventory/queries';
import { toNumber } from '@/lib/money';
import type { CategoryAudience, ProductStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Leitura de produtos para o painel (escopo §20: criar, editar, excluir, duplicar,
 * ativar/desativar, gerenciar imagens e variacoes).
 *
 * A lista do painel mostra **todos** os status — rascunho e arquivado inclusive. A loja
 * publica so ve `ACTIVE` (`src/lib/catalog/source.ts`); aqui o lojista precisa ver o que
 * ainda nao publicou.
 */

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  sku: string;
  status: ProductStatus;
  audience: CategoryAudience;
  price: number;
  compareAtPrice: number | null;
  categoryName: string | null;
  collectionName: string | null;
  variants: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  updatedAt: Date;
}

export interface AdminProductFilter {
  storeId: string;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  collectionId?: string;
  /** `low` = variacao no corte de estoque baixo; `out` = variacao zerada. */
  stockLevel?: 'all' | 'low' | 'out';
  page?: number;
  pageSize?: number;
}

function productWhere({ storeId, search, status, categoryId, collectionId, stockLevel }: AdminProductFilter): Prisma.ProductWhereInput {
  const term = search?.trim();
  const and: Prisma.ProductWhereInput[] = [];

  if (term) {
    and.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  if (stockLevel === 'out') {
    and.push({
      variants: {
        some: {
          deletedAt: null,
          OR: [{ inventory: { quantity: { lte: 0 } } }, { inventory: { is: null } }],
        },
      },
    });
  }
  if (stockLevel === 'low') {
    and.push({
      variants: {
        some: {
          deletedAt: null,
          OR: [
            { inventory: { quantity: { lte: LOW_STOCK_THRESHOLD } } },
            { inventory: { is: null } },
          ],
        },
      },
    });
  }

  return {
    storeId,
    /* Produto excluido no painel sai da lista, mas continua existindo para o pedido antigo. */
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(collectionId ? { collectionId } : {}),
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

export async function listAdminProducts(filter: AdminProductFilter): Promise<AdminProductRow[]> {
  const { page = 1, pageSize = 20 } = filter;

  const rows = await getPrisma().product.findMany({
    where: productWhere(filter),
    orderBy: { updatedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      status: true,
      audience: true,
      price: true,
      compareAtPrice: true,
      featured: true,
      isNew: true,
      updatedAt: true,
      category: { select: { name: true } },
      collection: { select: { name: true } },
      _count: { select: { variants: true } },
      variants: {
        where: { deletedAt: null },
        select: { inventory: { select: { quantity: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    status: row.status,
    audience: row.audience,
    price: toNumber(row.price),
    compareAtPrice: row.compareAtPrice ? toNumber(row.compareAtPrice) : null,
    categoryName: row.category?.name ?? null,
    collectionName: row.collection?.name ?? null,
    variants: row._count.variants,
    stock: row.variants.reduce((total, variant) => total + (variant.inventory?.quantity ?? 0), 0),
    featured: row.featured,
    isNew: row.isNew,
    updatedAt: row.updatedAt,
  }));
}

export async function countAdminProducts(filter: AdminProductFilter): Promise<number> {
  return getPrisma().product.count({ where: productWhere(filter) });
}

export interface AdminColorRow {
  id: string;
  name: string;
  slug: string;
  hex: string;
  image: string | null;
  position: number;
}

export interface AdminVariantRow {
  id: string;
  sku: string;
  size: string;
  colorId: string | null;
  colorName: string | null;
  price: number | null;
  compareAtPrice: number | null;
  quantity: number;
  allowBackorder: boolean;
  position: number;
}

export interface AdminImageRow {
  id: string;
  url: string;
  alt: string | null;
  colorId: string | null;
  position: number;
}

export interface AdminProductDetail {
  id: string;
  slug: string;
  name: string;
  sku: string;
  description: string;
  story: string;
  status: ProductStatus;
  audience: CategoryAudience;
  categoryId: string | null;
  collectionId: string | null;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  weightGrams: number | null;
  tags: string[];
  composition: string;
  care: string[];
  details: string[];
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  releasedAt: Date | null;
  colors: AdminColorRow[];
  variants: AdminVariantRow[];
  images: AdminImageRow[];
  /** Pedidos que referenciam o produto: o que impede a exclusao definitiva (§13). */
  orderItems: number;
}

export async function getAdminProduct(input: {
  storeId: string;
  id: string;
}): Promise<AdminProductDetail | null> {
  const row = await getPrisma().product.findFirst({
    where: { id: input.id, storeId: input.storeId },
    include: {
      colors: { orderBy: { position: 'asc' } },
      variants: { where: { deletedAt: null }, orderBy: [{ position: 'asc' }, { size: 'asc' }], include: { inventory: true } },
      images: { orderBy: { position: 'asc' } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    description: row.description ?? '',
    story: row.story ?? '',
    status: row.status,
    audience: row.audience,
    categoryId: row.categoryId,
    collectionId: row.collectionId,
    brand: row.brand,
    price: toNumber(row.price),
    compareAtPrice: row.compareAtPrice ? toNumber(row.compareAtPrice) : null,
    cost: row.cost ? toNumber(row.cost) : null,
    weightGrams: row.weightGrams,
    tags: row.tags,
    composition: row.composition ?? '',
    care: row.care,
    details: row.details,
    featured: row.featured,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    releasedAt: row.releasedAt,
    colors: row.colors.map((color) => ({
      id: color.id,
      name: color.name,
      slug: color.slug,
      hex: color.hex,
      image: color.image,
      position: color.position,
    })),
    variants: row.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      colorId: variant.colorId,
      colorName: row.colors.find((color) => color.id === variant.colorId)?.name ?? null,
      price: variant.price ? toNumber(variant.price) : null,
      compareAtPrice: variant.compareAtPrice ? toNumber(variant.compareAtPrice) : null,
      quantity: variant.inventory?.quantity ?? 0,
      allowBackorder: variant.inventory?.allowBackorder ?? false,
      position: variant.position,
    })),
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      colorId: image.colorId,
      position: image.position,
    })),
    orderItems: row._count.orderItems,
  };
}

export interface Option {
  id: string;
  name: string;
}

export async function listCategoryOptions(storeId: string): Promise<Option[]> {
  return getPrisma().category.findMany({
    where: { storeId, deletedAt: null },
    orderBy: [{ kind: 'asc' }, { position: 'asc' }],
    select: { id: true, name: true },
  });
}

export async function listCollectionOptions(storeId: string): Promise<Option[]> {
  return getPrisma().collection.findMany({
    where: { storeId, deletedAt: null },
    orderBy: { position: 'asc' },
    select: { id: true, name: true },
  });
}

export interface ProductSummary {
  total: number;
  active: number;
  draft: number;
  archived: number;
  variants: number;
}

export async function productSummary(storeId: string): Promise<ProductSummary> {
  const prisma = getPrisma();

  const [total, active, draft, archived, variants] = await Promise.all([
    prisma.product.count({ where: { storeId, deletedAt: null } }),
    prisma.product.count({ where: { storeId, deletedAt: null, status: 'ACTIVE' } }),
    prisma.product.count({ where: { storeId, deletedAt: null, status: 'DRAFT' } }),
    prisma.product.count({ where: { storeId, deletedAt: null, status: 'ARCHIVED' } }),
    prisma.productVariant.count({ where: { storeId, deletedAt: null } }),
  ]);

  return { total, active, draft, archived, variants };
}
