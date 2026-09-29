'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { checkbox, describeIssues, idField, optionalInt, optionalText } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import { TaxonomyError, archiveCategory, createCategory, updateCategory } from '@/lib/taxonomy/service';

/**
 * Acoes de categoria (escopo §7, §20).
 *
 * Categoria tem dois eixos, como a loja ja usa: `AUDIENCE` (feminino, masculino, unissex) e
 * `PRODUCT` (vestidos, jeans). `parentId` cria a subcategoria do §7.
 *
 * Arquivar com produto dentro e recusado: mover produto de categoria sem querer seria pior do
 * que a mensagem de erro.
 */

const CATEGORY_SCHEMA = z.object({
  name: z.string().trim().min(2, 'informe o nome'),
  slug: optionalText,
  kind: z.enum(['AUDIENCE', 'PRODUCT']),
  audience: z.enum(['FEMININO', 'MASCULINO', 'UNISSEX']),
  description: optionalText,
  image: optionalText,
  parentId: optionalText,
  position: optionalInt,
});

function toInput(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = CATEGORY_SCHEMA.safeParse(raw);

  if (!parsed.success) return { error: describeIssues(parsed.error) } as const;

  return {
    input: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      kind: parsed.data.kind,
      audience: parsed.data.audience,
      description: parsed.data.description,
      image: parsed.data.image ?? null,
      parentId: parsed.data.parentId ?? null,
      position: parsed.data.position ?? 0,
      featured: checkbox.safeParse(raw.featured).data ?? false,
    },
  } as const;
}

export async function createCategoryAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('categories', 'create');
  const parsed = toInput(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  try {
    await createCategory({ storeId: user.storeId, input: parsed.input });
  } catch (error) {
    if (error instanceof TaxonomyError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível criar a categoria.' };
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/produtos');
  redirect('/admin/categorias?ok=criado');
}

export async function updateCategoryAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('categories', 'update');
  const id = idField.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, message: 'Categoria não informada.' };

  const parsed = toInput(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  try {
    await updateCategory({ storeId: user.storeId, id: id.data, input: parsed.input });
  } catch (error) {
    if (error instanceof TaxonomyError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível salvar a categoria.' };
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/produtos');
  redirect('/admin/categorias?ok=salvo');
}

export async function archiveCategoryAction(formData: FormData): Promise<void> {
  const user = await requirePermission('categories', 'delete');
  const id = idField.safeParse(formData.get('id'));
  if (!id.success) redirect('/admin/categorias?erro=dados');

  try {
    await archiveCategory({ storeId: user.storeId, id: id.data });
  } catch (error) {
    const code = error instanceof TaxonomyError ? 'em-uso' : 'dados';
    redirect(`/admin/categorias?erro=${code}`);
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/produtos');
  redirect('/admin/categorias?ok=excluido');
}
