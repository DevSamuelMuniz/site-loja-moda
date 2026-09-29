'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { checkbox, describeIssues, idField, optionalDate, optionalInt, optionalText } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import { TaxonomyError, archiveCollection, createCollection, updateCollection } from '@/lib/taxonomy/service';

/**
 * Acoes de colecao (escopo §7, §20).
 *
 * Colecao e recorte editorial ("Essential 26", "Sale"), nao arvore: ela nao tem pai, tem
 * lancamento e destaque. Arquivar com produto dentro e recusado, como na categoria.
 */

const COLLECTION_SCHEMA = z.object({
  name: z.string().trim().min(2, 'informe o nome'),
  slug: optionalText,
  tagline: optionalText,
  description: optionalText,
  image: optionalText,
  badge: optionalText,
  position: optionalInt,
  releasedAt: optionalDate,
});

function toInput(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = COLLECTION_SCHEMA.safeParse(raw);

  if (!parsed.success) return { error: describeIssues(parsed.error) } as const;

  return {
    input: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      image: parsed.data.image ?? null,
      badge: parsed.data.badge ?? null,
      position: parsed.data.position ?? 0,
      releasedAt: parsed.data.releasedAt ?? null,
      featured: checkbox.safeParse(raw.featured).data ?? false,
    },
  } as const;
}

export async function createCollectionAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('collections', 'create');
  const parsed = toInput(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  try {
    await createCollection({ storeId: user.storeId, input: parsed.input });
  } catch (error) {
    if (error instanceof TaxonomyError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível criar a coleção.' };
  }

  revalidatePath('/admin/colecoes');
  revalidatePath('/colecoes');
  redirect('/admin/colecoes?ok=criado');
}

export async function updateCollectionAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('collections', 'update');
  const id = idField.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, message: 'Coleção não informada.' };

  const parsed = toInput(formData);
  if ('error' in parsed) return { ok: false, message: parsed.error };

  try {
    await updateCollection({ storeId: user.storeId, id: id.data, input: parsed.input });
  } catch (error) {
    if (error instanceof TaxonomyError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível salvar a coleção.' };
  }

  revalidatePath('/admin/colecoes');
  revalidatePath('/colecoes');
  redirect('/admin/colecoes?ok=salvo');
}

export async function archiveCollectionAction(formData: FormData): Promise<void> {
  const user = await requirePermission('collections', 'delete');
  const id = idField.safeParse(formData.get('id'));
  if (!id.success) redirect('/admin/colecoes?erro=dados');

  try {
    await archiveCollection({ storeId: user.storeId, id: id.data });
  } catch (error) {
    const code = error instanceof TaxonomyError ? 'em-uso' : 'dados';
    redirect(`/admin/colecoes?erro=${code}`);
  }

  revalidatePath('/admin/colecoes');
  revalidatePath('/colecoes');
  redirect('/admin/colecoes?ok=excluido');
}
