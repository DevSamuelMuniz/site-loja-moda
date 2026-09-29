'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { describeIssues, checkbox, idField, optionalDate, optionalInt, optionalMoney, optionalText, requiredMoney } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import {
  ProductError,
  addColor,
  addImage,
  archiveProduct,
  createProduct,
  duplicateProduct,
  generateVariants,
  removeColor,
  removeImage,
  removeVariant,
  updateProduct,
  updateVariant,
} from '@/lib/products/service';
import { parseColors, parseList } from '@/lib/slug';

/**
 * Acoes do modulo de produtos (escopo §7, §20).
 *
 * Toda action comeca por `requirePermission`: e a autorizacao que vale (§23). O formulario so
 * mostra o botao; quem decide e o servidor.
 *
 * Sucesso redireciona para a lista (aviso por `?ok=`), falha de regra de negocio volta para o
 * formulario com a mensagem — nada de "salvo" que nao gravou.
 */

const AUDIENCES = ['FEMININO', 'MASCULINO', 'UNISSEX'] as const;
const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

const productSchema = z.object({
  name: z.string().trim().min(2, 'informe o nome'),
  slug: optionalText,
  sku: optionalText,
  description: optionalText,
  story: optionalText,
  composition: optionalText,
  brand: optionalText,
  categoryId: optionalText,
  collectionId: optionalText,
  audience: z.enum(AUDIENCES),
  status: z.enum(STATUSES),
  price: requiredMoney,
  compareAtPrice: optionalMoney,
  cost: optionalMoney,
  weightGrams: optionalInt,
  releasedAt: optionalDate,
});

function parseProductForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) return { error: describeIssues(parsed.error) } as const;

  const data = parsed.data;

  return {
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description ?? '',
      story: data.story ?? '',
      composition: data.composition ?? '',
      brand: data.brand ?? null,
      categoryId: data.categoryId ?? null,
      collectionId: data.collectionId ?? null,
      audience: data.audience,
      status: data.status,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      cost: data.cost ?? null,
      weightGrams: data.weightGrams ?? null,
      releasedAt: data.releasedAt ?? null,
      tags: parseList(String(raw.tags ?? '')),
      care: parseList(String(raw.care ?? '')),
      details: parseList(String(raw.details ?? '')),
      featured: checkbox.safeParse(raw.featured).data ?? false,
      isNew: checkbox.safeParse(raw.isNew).data ?? false,
      isBestSeller: checkbox.safeParse(raw.isBestSeller).data ?? false,
    },
  } as const;
}

function fail(error: unknown, fallback: string): FormState {
  if (error instanceof ProductError) return { ok: false, message: error.message };
  return { ok: false, message: fallback };
}

export async function createProductAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('products', 'create');
  const parsed = parseProductForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  const raw = Object.fromEntries(formData.entries());
  const { colors, invalid } = parseColors(String(raw.colors ?? ''));

  if (invalid.length > 0) {
    return { ok: false, message: `Cor sem hexadecimal válido: ${invalid.join(' | ')}` };
  }

  const sizes = parseList(String(raw.sizes ?? ''));
  const images = parseList(String(raw.images ?? ''));

  try {
    const created = await createProduct({
      storeId: user.storeId,
      input: parsed.data,
      colors: colors.map((color) => ({ name: color.name, hex: color.hex })),
      sizes,
      images,
    });

    revalidatePath('/admin/produtos');
    revalidatePath('/produtos');
    redirect(`/admin/produtos/${created.id}?ok=criado`);
  } catch (error) {
    if (isRedirect(error)) throw error;
    return fail(error, 'Não foi possível criar o produto.');
  }
}

export async function updateProductAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('products', 'update');
  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, message: 'Produto não informado.' };

  const parsed = parseProductForm(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  try {
    await updateProduct({ storeId: user.storeId, id, input: parsed.data });
  } catch (error) {
    if (isRedirect(error)) throw error;
    return fail(error, 'Não foi possível salvar o produto.');
  }

  revalidatePath('/admin/produtos');
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath('/produtos');
  return { ok: true, message: 'Produto salvo.' };
}

/**
 * Acoes de um clique (duplicar, arquivar, mudar status).
 *
 * Assinatura `(formData) => Promise<void>`: sao usadas direto em `<form action={...}>` e
 * terminam com `redirect` — o aviso sai por `?ok=`/`?erro=`, nao por mensagem na linha da
 * tabela. As acoes de formulario longo usam `(state, formData)`, porque precisam devolver
 * erro **no lugar** sem perder o que foi digitado.
 */
export async function duplicateProductAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'create');
  const id = String(formData.get('id') ?? '');

  const created = await duplicateProduct({ storeId: user.storeId, id }).catch(() => null);
  if (!created) redirect('/admin/produtos?erro=dados');

  revalidatePath('/admin/produtos');
  redirect(`/admin/produtos/${created.id}?ok=duplicado`);
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'delete');
  const id = String(formData.get('id') ?? '');

  try {
    await archiveProduct({ storeId: user.storeId, id });
  } catch {
    redirect('/admin/produtos?erro=dados');
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/produtos');
  redirect('/admin/produtos?ok=excluido');
}

export async function addColorAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('products', 'update');
  const productId = idField.safeParse(formData.get('productId'));
  if (!productId.success) return { ok: false, message: 'Produto não informado.' };

  const name = String(formData.get('colorName') ?? '').trim();
  const hex = String(formData.get('colorHex') ?? '').trim();

  if (!name) return { ok: false, message: 'Informe o nome da cor.' };
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
    return { ok: false, message: 'Informe a cor no formato hexadecimal (#A1B2C3).' };
  }

  try {
    await addColor({ storeId: user.storeId, productId: productId.data, color: { name, hex } });
  } catch (error) {
    return fail(error, 'Não foi possível adicionar a cor.');
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  return { ok: true, message: 'Cor adicionada. Gere as variações para ela.' };
}

export async function removeColorAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'update');
  const productId = idField.safeParse(formData.get('productId'));
  const colorId = idField.safeParse(formData.get('colorId'));
  if (!productId.success || !colorId.success) redirect('/admin/produtos?erro=dados');

  try {
    await removeColor({ storeId: user.storeId, productId: productId.data, colorId: colorId.data });
  } catch {
    redirect(`/admin/produtos/${productId.data}?erro=dados`);
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  redirect(`/admin/produtos/${productId.data}?ok=salvo`);
}

export async function generateVariantsAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('products', 'update');
  const productId = idField.safeParse(formData.get('productId'));
  if (!productId.success) return { ok: false, message: 'Produto não informado.' };

  const sizes = parseList(String(formData.get('sizes') ?? ''));
  if (sizes.length === 0) return { ok: false, message: 'Informe ao menos um tamanho.' };

  const colorIds = formData.getAll('colorIds').map(String).filter(Boolean);

  try {
    const created = await generateVariants({
      storeId: user.storeId,
      productId: productId.data,
      sizes,
      colorIds,
    });

    revalidatePath(`/admin/produtos/${productId.data}`);
    revalidatePath('/admin/estoque');

    return created > 0
      ? { ok: true, message: `${created} variação(ões) criada(s) com saldo zero. Ajuste o estoque no módulo Estoque.` }
      : { ok: false, message: 'Todas as combinações informadas já existiam.' };
  } catch (error) {
    return fail(error, 'Não foi possível gerar as variações.');
  }
}

export async function updateVariantAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'update');
  const variantId = idField.safeParse(formData.get('variantId'));
  const productId = idField.safeParse(formData.get('productId'));
  if (!variantId.success || !productId.success) redirect('/admin/produtos?erro=dados');

  const price = optionalMoney.safeParse(formData.get('price'));
  const compareAtPrice = optionalMoney.safeParse(formData.get('compareAtPrice'));

  try {
    await updateVariant({
      storeId: user.storeId,
      variantId: variantId.data,
      size: String(formData.get('size') ?? ''),
      sku: String(formData.get('sku') ?? ''),
      price: price.success ? (price.data ?? null) : null,
      compareAtPrice: compareAtPrice.success ? (compareAtPrice.data ?? null) : null,
    });
  } catch {
    redirect(`/admin/produtos/${productId.data}?erro=dados`);
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  redirect(`/admin/produtos/${productId.data}?ok=salvo`);
}

export async function removeVariantAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'update');
  const variantId = idField.safeParse(formData.get('variantId'));
  const productId = idField.safeParse(formData.get('productId'));
  if (!variantId.success || !productId.success) redirect('/admin/produtos?erro=dados');

  try {
    await removeVariant({ storeId: user.storeId, variantId: variantId.data });
  } catch {
    redirect(`/admin/produtos/${productId.data}?erro=dados`);
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  redirect(`/admin/produtos/${productId.data}?ok=salvo`);
}

export async function addImageAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('products', 'update');
  const productId = idField.safeParse(formData.get('productId'));
  if (!productId.success) return { ok: false, message: 'Produto não informado.' };

  try {
    await addImage({
      storeId: user.storeId,
      productId: productId.data,
      url: String(formData.get('url') ?? ''),
      alt: String(formData.get('alt') ?? ''),
      colorId: String(formData.get('colorId') ?? '') || null,
    });
  } catch (error) {
    return fail(error, 'Não foi possível adicionar a imagem.');
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  return { ok: true, message: 'Imagem adicionada.' };
}

export async function removeImageAction(formData: FormData): Promise<void> {
  const user = await requirePermission('products', 'update');
  const imageId = idField.safeParse(formData.get('imageId'));
  const productId = idField.safeParse(formData.get('productId'));
  if (!imageId.success || !productId.success) redirect('/admin/produtos?erro=dados');

  try {
    await removeImage({ storeId: user.storeId, imageId: imageId.data });
  } catch {
    redirect(`/admin/produtos/${productId.data}?erro=dados`);
  }

  revalidatePath(`/admin/produtos/${productId.data}`);
  redirect(`/admin/produtos/${productId.data}?ok=salvo`);
}

/** `redirect` funciona lancando: o catch precisa deixar a excecao do Next passar. */
function isRedirect(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'digest' in error;
}
