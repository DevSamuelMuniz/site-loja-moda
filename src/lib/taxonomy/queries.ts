import { getPrisma } from '@/lib/db';
import type { CategoryAudience, CategoryKind } from '@/generated/prisma/enums';

/**
 * Leitura de categorias e colecoes para o painel (escopo §20).
 *
 * Traz contagem de produtos por linha: o lojista precisa saber o que depende do registro
 * antes de mexer nele — e arquivar com produto dentro e recusado pelo servico.
 */

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  audience: CategoryAudience;
  description: string;
  image: string | null;
  parentId: string | null;
  parentName: string | null;
  featured: boolean;
  position: number;
  products: number;
  children: number;
}

export async function listCategories(storeId: string): Promise<CategoryRow[]> {
  const rows = await getPrisma().category.findMany({
    where: { storeId, deletedAt: null },
    orderBy: [{ kind: 'asc' }, { position: 'asc' }, { name: 'asc' }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    kind: row.kind,
    audience: row.audience,
    description: row.description ?? '',
    image: row.image,
    parentId: row.parentId,
    parentName: row.parent?.name ?? null,
    featured: row.featured,
    position: row.position,
    products: row._count.products,
    children: row._count.children,
  }));
}

export async function getCategory(input: { storeId: string; id: string }): Promise<CategoryRow | null> {
  const rows = await listCategories(input.storeId);
  return rows.find((row) => row.id === input.id) ?? null;
}

export interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string | null;
  badge: string | null;
  featured: boolean;
  position: number;
  releasedAt: Date | null;
  products: number;
}

export async function listCollections(storeId: string): Promise<CollectionRow[]> {
  const rows = await getPrisma().collection.findMany({
    where: { storeId, deletedAt: null },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    image: row.image,
    badge: row.badge,
    featured: row.featured,
    position: row.position,
    releasedAt: row.releasedAt,
    products: row._count.products,
  }));
}

export async function getCollection(input: { storeId: string; id: string }): Promise<CollectionRow | null> {
  const rows = await listCollections(input.storeId);
  return rows.find((row) => row.id === input.id) ?? null;
}

/** Categorias elegiveis a pai: as ativas, exceto a propria categoria. */
export async function listParentOptions(storeId: string, excludeId?: string) {
  return getPrisma().category.findMany({
    where: { storeId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: { position: 'asc' },
    select: { id: true, name: true },
  });
}
