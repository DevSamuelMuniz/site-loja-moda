import { getPrisma } from '@/lib/db';
import { ensureUniqueSlug, slugify } from '@/lib/slug';
import type { CategoryAudience, CategoryKind } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Categorias e colecoes (escopo §7, §9, §20).
 *
 * Categoria tem dois eixos, como o site ja usa: `AUDIENCE` (feminino, masculino) e `PRODUCT`
 * (vestidos, jeans), e uma categoria pode ser filha de outra — subcategoria do §7.
 *
 * Arquivar nao e apagar: `deletedAt` tira a categoria da loja e do painel sem quebrar
 * produto ou pedido antigo. Uma categoria com produtos **nao** e arquivada em silencio: a
 * operacao e recusada dizendo quantos produtos dependem dela. Mover produto de categoria sem
 * querer seria pior do que o erro.
 */

export class TaxonomyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaxonomyError';
  }
}

export interface CategoryInput {
  name: string;
  slug?: string;
  kind: CategoryKind;
  audience: CategoryAudience;
  description?: string;
  image?: string | null;
  parentId?: string | null;
  featured?: boolean;
  position?: number;
}

async function assertParent(
  tx: Prisma.TransactionClient,
  input: { storeId: string; parentId?: string | null; selfId?: string },
): Promise<void> {
  if (!input.parentId) return;
  if (input.parentId === input.selfId) throw new TaxonomyError('Uma categoria não pode ser pai de si mesma.');

  const parent = await tx.category.findFirst({
    where: { id: input.parentId, storeId: input.storeId, deletedAt: null },
    select: { id: true, parentId: true },
  });

  if (!parent) throw new TaxonomyError('Categoria pai não encontrada nesta loja.');
  /* Duas categorias sendo pai uma da outra criariam ciclo: a arvore nao terminaria. */
  if (parent.parentId === input.selfId) throw new TaxonomyError('A categoria escolhida já é filha desta.');
}

export async function createCategory(payload: {
  storeId: string;
  input: CategoryInput;
}): Promise<{ id: string }> {
  const { storeId, input } = payload;
  if (!input.name.trim()) throw new TaxonomyError('A categoria precisa de um nome.');

  return getPrisma().$transaction(async (tx) => {
    await assertParent(tx, { storeId, parentId: input.parentId });

    const slug = await ensureUniqueSlug(slugify(input.slug?.trim() || input.name), async (candidate) => {
      const count = await tx.category.count({ where: { storeId, slug: candidate } });
      return count > 0;
    });

    return tx.category.create({
      data: {
        storeId,
        slug,
        name: input.name.trim(),
        kind: input.kind,
        audience: input.audience,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        parentId: input.parentId || null,
        featured: input.featured ?? false,
        position: input.position ?? 0,
      },
      select: { id: true },
    });
  });
}

export async function updateCategory(payload: {
  storeId: string;
  id: string;
  input: CategoryInput;
}): Promise<void> {
  const { storeId, id, input } = payload;
  if (!input.name.trim()) throw new TaxonomyError('A categoria precisa de um nome.');

  await getPrisma().$transaction(async (tx) => {
    const existing = await tx.category.findFirst({ where: { id, storeId }, select: { id: true, slug: true } });
    if (!existing) throw new TaxonomyError('Categoria não encontrada nesta loja.');

    await assertParent(tx, { storeId, parentId: input.parentId, selfId: id });

    const slug =
      input.slug && slugify(input.slug) !== existing.slug
        ? await ensureUniqueSlug(slugify(input.slug), async (candidate) => {
            const count = await tx.category.count({ where: { storeId, slug: candidate, id: { not: id } } });
            return count > 0;
          })
        : undefined;

    await tx.category.update({
      where: { id },
      data: {
        name: input.name.trim(),
        kind: input.kind,
        audience: input.audience,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        parentId: input.parentId || null,
        featured: input.featured ?? false,
        position: input.position ?? 0,
        ...(slug ? { slug } : {}),
      },
    });
  });
}

export async function archiveCategory(payload: { storeId: string; id: string }): Promise<void> {
  const { storeId, id } = payload;

  await getPrisma().$transaction(async (tx) => {
    const category = await tx.category.findFirst({
      where: { id, storeId },
      select: { id: true, _count: { select: { products: true, children: true } } },
    });
    if (!category) throw new TaxonomyError('Categoria não encontrada nesta loja.');

    if (category._count.products > 0) {
      throw new TaxonomyError(
        `Esta categoria tem ${category._count.products} produto(s). Mova os produtos antes de arquivar.`,
      );
    }
    if (category._count.children > 0) {
      throw new TaxonomyError(
        `Esta categoria tem ${category._count.children} subcategoria(s). Arquive as filhas antes.`,
      );
    }

    await tx.category.update({ where: { id }, data: { deletedAt: new Date() } });
  });
}

export interface CollectionInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  image?: string | null;
  badge?: string | null;
  featured?: boolean;
  position?: number;
  releasedAt?: Date | null;
}

export async function createCollection(payload: {
  storeId: string;
  input: CollectionInput;
}): Promise<{ id: string }> {
  const { storeId, input } = payload;
  if (!input.name.trim()) throw new TaxonomyError('A coleção precisa de um nome.');

  return getPrisma().$transaction(async (tx) => {
    const slug = await ensureUniqueSlug(slugify(input.slug?.trim() || input.name), async (candidate) => {
      const count = await tx.collection.count({ where: { storeId, slug: candidate } });
      return count > 0;
    });

    return tx.collection.create({
      data: {
        storeId,
        slug,
        name: input.name.trim(),
        tagline: input.tagline?.trim() || null,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        badge: input.badge?.trim() || null,
        featured: input.featured ?? false,
        position: input.position ?? 0,
        releasedAt: input.releasedAt ?? null,
      },
      select: { id: true },
    });
  });
}

export async function updateCollection(payload: {
  storeId: string;
  id: string;
  input: CollectionInput;
}): Promise<void> {
  const { storeId, id, input } = payload;
  if (!input.name.trim()) throw new TaxonomyError('A coleção precisa de um nome.');

  await getPrisma().$transaction(async (tx) => {
    const existing = await tx.collection.findFirst({ where: { id, storeId }, select: { id: true, slug: true } });
    if (!existing) throw new TaxonomyError('Coleção não encontrada nesta loja.');

    const slug =
      input.slug && slugify(input.slug) !== existing.slug
        ? await ensureUniqueSlug(slugify(input.slug), async (candidate) => {
            const count = await tx.collection.count({ where: { storeId, slug: candidate, id: { not: id } } });
            return count > 0;
          })
        : undefined;

    await tx.collection.update({
      where: { id },
      data: {
        name: input.name.trim(),
        tagline: input.tagline?.trim() || null,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        badge: input.badge?.trim() || null,
        featured: input.featured ?? false,
        position: input.position ?? 0,
        releasedAt: input.releasedAt ?? null,
        ...(slug ? { slug } : {}),
      },
    });
  });
}

export async function archiveCollection(payload: { storeId: string; id: string }): Promise<void> {
  const { storeId, id } = payload;

  await getPrisma().$transaction(async (tx) => {
    const collection = await tx.collection.findFirst({
      where: { id, storeId },
      select: { id: true, _count: { select: { products: true } } },
    });
    if (!collection) throw new TaxonomyError('Coleção não encontrada nesta loja.');

    if (collection._count.products > 0) {
      throw new TaxonomyError(
        `Esta coleção tem ${collection._count.products} produto(s). Tire os produtos dela antes de arquivar.`,
      );
    }

    await tx.collection.update({ where: { id }, data: { deletedAt: new Date() } });
  });
}
