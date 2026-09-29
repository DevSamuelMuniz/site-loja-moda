import { getPrisma } from '@/lib/db';
import { money, toDecimalInput } from '@/lib/money';
import { buildVariantSku, ensureUniqueSlug, slugify } from '@/lib/slug';
import type { CategoryAudience, ProductStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Escrita de produto (escopo §7, §20).
 *
 * Decisoes que valem a pena explicar:
 *
 * - **Nada e excluido de verdade.** `archiveProduct` marca `deletedAt` e deixa o status
 *   `ARCHIVED`: um pedido antigo precisa continuar conseguindo referenciar a peca vendida
 *   (§13). O mesmo vale para variacao.
 * - **Estoque nao nasce no cadastro do produto.** O produto cria a grade (cor × tamanho) com
 *   saldo zero; o saldo entra pelo modulo de estoque, com movimentacao (§8). Assim existe
 *   **um** caminho para o estoque mudar, e ele sempre deixa rastro.
 * - **SKU de variacao e derivado**, `SKU-COR-TAMANHO`, e pode ser corrigido no painel. SKU
 *   duplicado na mesma loja e recusado pelo banco, nao por checagem otimista.
 */

export class ProductError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductError';
  }
}

export interface ProductInput {
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  story?: string;
  categoryId?: string | null;
  collectionId?: string | null;
  brand?: string | null;
  status: ProductStatus;
  audience: CategoryAudience;
  price: number;
  compareAtPrice?: number | null;
  cost?: number | null;
  weightGrams?: number | null;
  tags?: string[];
  composition?: string;
  care?: string[];
  details?: string[];
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  releasedAt?: Date | null;
}

export interface ColorInput {
  name: string;
  hex: string;
}

async function assertReferences(
  tx: Prisma.TransactionClient,
  input: { storeId: string; categoryId?: string | null; collectionId?: string | null },
): Promise<void> {
  if (input.categoryId) {
    const found = await tx.category.count({ where: { id: input.categoryId, storeId: input.storeId, deletedAt: null } });
    if (found === 0) throw new ProductError('Categoria não encontrada nesta loja.');
  }
  if (input.collectionId) {
    const found = await tx.collection.count({ where: { id: input.collectionId, storeId: input.storeId, deletedAt: null } });
    if (found === 0) throw new ProductError('Coleção não encontrada nesta loja.');
  }
}

function validateNumbers(input: ProductInput): void {
  if (!input.name.trim()) throw new ProductError('O produto precisa de um nome.');

  const price = money(input.price);
  if (price.isNegative() || price.isZero()) throw new ProductError('Informe um preço maior que zero.');

  if (input.compareAtPrice !== null && input.compareAtPrice !== undefined) {
    if (money(input.compareAtPrice).lessThan(price)) {
      throw new ProductError('O preço anterior precisa ser maior que o preço atual.');
    }
  }

  if (input.cost !== null && input.cost !== undefined && money(input.cost).isNegative()) {
    throw new ProductError('O custo não pode ser negativo.');
  }
}

function dataFrom(input: ProductInput) {
  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    story: input.story?.trim() || null,
    categoryId: input.categoryId || null,
    collectionId: input.collectionId || null,
    brand: input.brand?.trim() || null,
    status: input.status,
    audience: input.audience,
    price: toDecimalInput(money(input.price)),
    compareAtPrice:
      input.compareAtPrice === null || input.compareAtPrice === undefined
        ? null
        : toDecimalInput(money(input.compareAtPrice)),
    cost: input.cost === null || input.cost === undefined ? null : toDecimalInput(money(input.cost)),
    weightGrams: input.weightGrams ?? null,
    tags: input.tags ?? [],
    composition: input.composition?.trim() || null,
    care: input.care ?? [],
    details: input.details ?? [],
    featured: input.featured ?? false,
    isNew: input.isNew ?? false,
    isBestSeller: input.isBestSeller ?? false,
    releasedAt: input.releasedAt ?? null,
  };
}

async function nextSlugFor(storeId: string, base: string): Promise<string> {
  const prisma = getPrisma();

  return ensureUniqueSlug(slugify(base), async (candidate) => {
    const count = await prisma.product.count({ where: { storeId, slug: candidate } });
    return count > 0;
  });
}

async function nextSkuFor(storeId: string, base: string): Promise<string> {
  const prisma = getPrisma();
  const root = base.toUpperCase().slice(0, 40) || 'SKU';

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? root : `${root}-${suffix + 1}`;
    const count = await prisma.product.count({ where: { storeId, sku: candidate } });
    if (count === 0) return candidate;
  }

  return `${root}-${Date.now().toString(36).toUpperCase()}`;
}

export interface CreateProductInput {
  storeId: string;
  input: ProductInput;
  colors: ColorInput[];
  sizes: string[];
  images: string[];
}

/** Cria o produto com a grade cor × tamanho. Saldo inicial: zero — entra por movimentacao. */
export async function createProduct(payload: CreateProductInput): Promise<{ id: string; slug: string }> {
  const { storeId, input } = payload;
  validateNumbers(input);

  const slug = await nextSlugFor(storeId, input.slug?.trim() || input.name);
  const sku = await nextSkuFor(storeId, input.sku?.trim() || slugify(input.name).replace(/-/g, ''));

  const sizes = [...new Set(payload.sizes.map((size) => size.trim()).filter(Boolean))];
  const colors = payload.colors.filter((color) => color.name.trim());

  return getPrisma().$transaction(async (tx) => {
    await assertReferences(tx, { storeId, categoryId: input.categoryId, collectionId: input.collectionId });

    const product = await tx.product.create({
      data: { storeId, slug, sku, ...dataFrom(input) },
      select: { id: true, slug: true },
    });

    const colorIds: Array<{ id: string; slug: string }> = [];

    for (const [index, color] of colors.entries()) {
      const colorSlug = await ensureUniqueSlug(slugify(color.name), async (candidate) => {
        const count = await tx.productColor.count({ where: { productId: product.id, slug: candidate } });
        return count > 0;
      });

      const created = await tx.productColor.create({
        data: { storeId, productId: product.id, name: color.name.trim(), slug: colorSlug, hex: color.hex, position: index },
        select: { id: true, slug: true },
      });
      colorIds.push(created);
    }

    await createVariants(tx, { storeId, productId: product.id, sku, sizes, colors: colorIds, startPosition: 0 });

    for (const [index, url] of payload.images.filter(Boolean).entries()) {
      await tx.productImage.create({ data: { storeId, productId: product.id, url: url.trim(), position: index } });
    }

    return product;
  });
}

/** Cria as variacoes que ainda nao existem para esta grade (idempotente por cor × tamanho). */
async function createVariants(
  tx: Prisma.TransactionClient,
  payload: {
    storeId: string;
    productId: string;
    sku: string;
    sizes: string[];
    colors: Array<{ id: string; slug: string }>;
    startPosition: number;
  },
): Promise<number> {
  const { storeId, productId, sku, sizes } = payload;

  const existing = await tx.productVariant.findMany({
    where: { productId },
    select: { colorId: true, size: true },
  });

  const seen = new Set(existing.map((variant) => `${variant.colorId ?? ''}::${variant.size}`));
  const combos: Array<{ colorId: string | null; colorSlug: string; size: string }> = [];

  if (payload.colors.length === 0) {
    for (const size of sizes) combos.push({ colorId: null, colorSlug: '', size });
  } else {
    for (const color of payload.colors) {
      for (const size of sizes) combos.push({ colorId: color.id, colorSlug: color.slug, size });
    }
  }

  let created = 0;
  let position = payload.startPosition;

  for (const combo of combos) {
    const key = `${combo.colorId ?? ''}::${combo.size}`;
    if (seen.has(key)) continue;

    const variantSku = buildVariantSku(sku, combo.colorSlug, combo.size);
    const taken = await tx.productVariant.count({ where: { storeId, sku: variantSku } });

    await tx.productVariant.create({
      data: {
        storeId,
        productId,
        colorId: combo.colorId,
        size: combo.size,
        sku: taken > 0 ? `${variantSku}-${Date.now().toString(36).toUpperCase()}` : variantSku,
        position,
        /* A linha de saldo nasce zerada: quem move estoque e a movimentacao (§8). */
        inventory: { create: { storeId, quantity: 0 } },
      },
    });

    seen.add(key);
    position += 1;
    created += 1;
  }

  return created;
}

export async function updateProduct(payload: {
  storeId: string;
  id: string;
  input: ProductInput;
}): Promise<void> {
  const { storeId, id, input } = payload;
  validateNumbers(input);

  await getPrisma().$transaction(async (tx) => {
    const existing = await tx.product.findFirst({ where: { id, storeId }, select: { id: true, slug: true } });
    if (!existing) throw new ProductError('Produto não encontrado nesta loja.');

    await assertReferences(tx, { storeId, categoryId: input.categoryId, collectionId: input.collectionId });

    const slug =
      input.slug && slugify(input.slug) !== existing.slug
        ? await ensureUniqueSlug(slugify(input.slug), async (candidate) => {
            const count = await tx.product.count({ where: { storeId, slug: candidate, id: { not: id } } });
            return count > 0;
          })
        : undefined;

    await tx.product.update({
      where: { id },
      data: { ...dataFrom(input), ...(slug ? { slug } : {}) },
    });
  });
}

export async function setProductStatus(payload: {
  storeId: string;
  id: string;
  status: ProductStatus;
}): Promise<void> {
  const { storeId, id, status } = payload;
  const prisma = getPrisma();

  const product = await prisma.product.findFirst({ where: { id, storeId }, select: { id: true, deletedAt: true } });
  if (!product) throw new ProductError('Produto não encontrado nesta loja.');

  await prisma.product.update({
    where: { id },
    data: {
      status,
      /* Republicar um produto arquivado tira a marca de exclusao: o lojista voltou atras. */
      ...(status === 'ARCHIVED' ? {} : { deletedAt: null }),
    },
  });
}

/** Exclusao logica: sai da loja e da lista do painel, permanece para o pedido antigo (§13). */
export async function archiveProduct(payload: { storeId: string; id: string }): Promise<void> {
  const { storeId, id } = payload;
  const prisma = getPrisma();

  const product = await prisma.product.findFirst({ where: { id, storeId }, select: { id: true } });
  if (!product) throw new ProductError('Produto não encontrado nesta loja.');

  await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED', deletedAt: new Date() } });
}

/**
 * Duplica o produto como **rascunho**, com a grade de cores e tamanhos e sem estoque.
 *
 * Copiar saldo seria inventar peca que nao existe; o novo produto nasce zerado e o estoque
 * entra quando houver peca de verdade (§8).
 */
export async function duplicateProduct(payload: {
  storeId: string;
  id: string;
}): Promise<{ id: string }> {
  const { storeId, id } = payload;

  return getPrisma().$transaction(async (tx) => {
    const source = await tx.product.findFirst({
      where: { id, storeId },
      include: { colors: { orderBy: { position: 'asc' } }, images: { orderBy: { position: 'asc' } } },
    });

    if (!source) throw new ProductError('Produto não encontrado nesta loja.');

    const name = `${source.name} (cópia)`;
    const slug = await ensureUniqueSlug(slugify(name), async (candidate) => {
      const count = await tx.product.count({ where: { storeId, slug: candidate } });
      return count > 0;
    });
    const sku = await ensureUniqueSlug(slugify(source.sku).replace(/-/g, '').toUpperCase() || 'SKU', async (candidate) => {
      const count = await tx.product.count({ where: { storeId, sku: candidate } });
      return count > 0;
    });

    const copy = await tx.product.create({
      data: {
        storeId,
        slug,
        sku,
        name,
        description: source.description,
        story: source.story,
        categoryId: source.categoryId,
        collectionId: source.collectionId,
        brand: source.brand,
        status: 'DRAFT',
        audience: source.audience,
        price: source.price,
        compareAtPrice: source.compareAtPrice,
        cost: source.cost,
        weightGrams: source.weightGrams,
        widthCm: source.widthCm,
        heightCm: source.heightCm,
        lengthCm: source.lengthCm,
        tags: source.tags,
        composition: source.composition,
        care: source.care,
        details: source.details,
        measurements: source.measurements ?? undefined,
        featured: false,
        isNew: source.isNew,
        isBestSeller: source.isBestSeller,
      },
      select: { id: true },
    });

    const colorMap = new Map<string, { id: string; slug: string }>();

    for (const color of source.colors) {
      const created = await tx.productColor.create({
        data: {
          storeId,
          productId: copy.id,
          name: color.name,
          slug: color.slug,
          hex: color.hex,
          image: color.image,
          position: color.position,
        },
        select: { id: true, slug: true },
      });
      colorMap.set(color.id, created);
    }

    const variants = await tx.productVariant.findMany({
      where: { productId: source.id, deletedAt: null },
      orderBy: { position: 'asc' },
      select: { colorId: true, size: true, price: true, compareAtPrice: true, position: true },
    });

    for (const variant of variants) {
      const color = variant.colorId ? colorMap.get(variant.colorId) : undefined;

      await tx.productVariant.create({
        data: {
          storeId,
          productId: copy.id,
          colorId: color?.id ?? null,
          size: variant.size,
          sku: buildVariantSku(sku, color?.slug ?? '', variant.size),
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          position: variant.position,
          inventory: { create: { storeId, quantity: 0 } },
        },
      });
    }

    for (const image of source.images) {
      await tx.productImage.create({
        data: {
          storeId,
          productId: copy.id,
          url: image.url,
          alt: image.alt,
          position: image.position,
          colorId: image.colorId ? (colorMap.get(image.colorId)?.id ?? null) : null,
        },
      });
    }

    return copy;
  });
}

/** Adiciona uma cor. */
export async function addColor(payload: {
  storeId: string;
  productId: string;
  color: ColorInput;
}): Promise<void> {
  const { storeId, productId, color } = payload;

  await getPrisma().$transaction(async (tx) => {
    const product = await tx.product.findFirst({ where: { id: productId, storeId }, select: { id: true } });
    if (!product) throw new ProductError('Produto não encontrado nesta loja.');

    const slug = await ensureUniqueSlug(slugify(color.name), async (candidate) => {
      const count = await tx.productColor.count({ where: { productId, slug: candidate } });
      return count > 0;
    });
    const count = await tx.productColor.count({ where: { productId } });

    await tx.productColor.create({
      data: { storeId, productId, name: color.name.trim(), slug, hex: color.hex.toUpperCase(), position: count },
    });
  });
}

/** Remove a cor e as variacoes dela. */
export async function removeColor(payload: {
  storeId: string;
  productId: string;
  colorId: string;
}): Promise<void> {
  const { storeId, productId, colorId } = payload;

  await getPrisma().$transaction(async (tx) => {
    const color = await tx.productColor.findFirst({ where: { id: colorId, productId, storeId }, select: { id: true } });
    if (!color) throw new ProductError('Cor não encontrada neste produto.');

    const variants = await tx.productVariant.findMany({ where: { productId, colorId }, select: { id: true } });
    await dropVariants(tx, { storeId, variantIds: variants.map((variant) => variant.id) });
    await tx.productColor.delete({ where: { id: colorId } });
  });
}

/** Gera as variacoes que faltam para a grade informada. */
export async function generateVariants(payload: {
  storeId: string;
  productId: string;
  sizes: string[];
  colorIds: string[];
}): Promise<number> {
  const { storeId, productId, sizes, colorIds } = payload;
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true, sku: true },
    });
    if (!product) throw new ProductError('Produto não encontrado nesta loja.');

    const colors = await tx.productColor.findMany({
      where: { productId, ...(colorIds.length > 0 ? { id: { in: colorIds } } : {}) },
      orderBy: { position: 'asc' },
      select: { id: true, slug: true },
    });

    const count = await tx.productVariant.count({ where: { productId } });

    return createVariants(tx, {
      storeId,
      productId,
      sku: product.sku,
      sizes,
      colors,
      startPosition: count,
    });
  });
}

export async function updateVariant(payload: {
  storeId: string;
  variantId: string;
  size?: string;
  sku?: string;
  price?: number | null;
  compareAtPrice?: number | null;
}): Promise<void> {
  const { storeId, variantId } = payload;
  const prisma = getPrisma();

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, storeId },
    select: { id: true },
  });
  if (!variant) throw new ProductError('Variação não encontrada nesta loja.');

  const price = payload.price === null || payload.price === undefined ? null : money(payload.price);
  if (price?.isNegative()) throw new ProductError('Preço da variação não pode ser negativo.');

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(payload.size?.trim() ? { size: payload.size.trim() } : {}),
      ...(payload.sku?.trim() ? { sku: payload.sku.trim().toUpperCase() } : {}),
      ...(payload.price !== undefined ? { price: price ? toDecimalInput(price) : null } : {}),
      ...(payload.compareAtPrice !== undefined
        ? {
            compareAtPrice:
              payload.compareAtPrice === null ? null : toDecimalInput(money(payload.compareAtPrice)),
          }
        : {}),
    },
  });
}

/**
 * Remove variacoes: saida logica mais limpeza da sacola.
 *
 * A linha do pedido aponta para a variacao por copia (nome, SKU, tamanho), entao ela sobrevive.
 * O que nao pode sobreviver e um item de carrinho apontando para peca que nao existe mais.
 */
async function dropVariants(
  tx: Prisma.TransactionClient,
  payload: { storeId: string; variantIds: string[] },
): Promise<void> {
  if (payload.variantIds.length === 0) return;

  await tx.cartItem.deleteMany({ where: { storeId: payload.storeId, variantId: { in: payload.variantIds } } });
  await tx.productVariant.updateMany({
    where: { storeId: payload.storeId, id: { in: payload.variantIds } },
    data: { deletedAt: new Date() },
  });
}

export async function removeVariant(payload: { storeId: string; variantId: string }): Promise<void> {
  await getPrisma().$transaction(async (tx) => {
    await dropVariants(tx, { storeId: payload.storeId, variantIds: [payload.variantId] });
  });
}

export async function addImage(payload: {
  storeId: string;
  productId: string;
  url: string;
  alt?: string | null;
  colorId?: string | null;
}): Promise<void> {
  const { storeId, productId, url } = payload;
  const trimmed = url.trim();

  if (!trimmed) throw new ProductError('Informe a URL da imagem.');
  if (!/^(https?:\/\/|\/)/i.test(trimmed)) {
    throw new ProductError('A imagem precisa ser uma URL (http/https) ou um caminho começando com "/".');
  }

  const prisma = getPrisma();
  const product = await prisma.product.findFirst({ where: { id: productId, storeId }, select: { id: true } });
  if (!product) throw new ProductError('Produto não encontrado nesta loja.');

  const count = await prisma.productImage.count({ where: { productId } });

  await prisma.productImage.create({
    data: {
      storeId,
      productId,
      url: trimmed,
      alt: payload.alt?.trim() || null,
      colorId: payload.colorId || null,
      position: count,
    },
  });
}

export async function removeImage(payload: { storeId: string; imageId: string }): Promise<void> {
  const { storeId, imageId } = payload;
  const prisma = getPrisma();

  const image = await prisma.productImage.findFirst({ where: { id: imageId, storeId }, select: { id: true } });
  if (!image) throw new ProductError('Imagem não encontrada nesta loja.');

  await prisma.productImage.delete({ where: { id: imageId } });
}
