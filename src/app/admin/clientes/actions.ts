'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { describeIssues, idField, optionalText } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import { CustomerError, updateCustomer } from '@/lib/customers/service';

/**
 * Acoes de cliente (escopo §16, §20).
 *
 * Cliente **nao** e excluido: ele tem pedido, e pedido e historico fiscal. O que existe e
 * bloquear (novas compras barradas) e corrigir cadastro. O e-mail e identidade e nao muda por
 * aqui — quem quiser outro e-mail cria outro cadastro.
 */

const UPDATE_SCHEMA = z.object({
  id: idField,
  name: z.string().trim().min(2, 'informe o nome'),
  phone: optionalText,
  document: optionalText,
  status: z.enum(['ACTIVE', 'BLOCKED']),
});

export async function updateCustomerAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('customers', 'update');

  const parsed = UPDATE_SCHEMA.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: describeIssues(parsed.error) };

  try {
    await updateCustomer({
      storeId: user.storeId,
      id: parsed.data.id,
      values: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        document: parsed.data.document ?? null,
        status: parsed.data.status,
      },
    });
  } catch (error) {
    if (error instanceof CustomerError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível salvar o cliente.' };
  }

  revalidatePath(`/admin/clientes/${parsed.data.id}`);
  revalidatePath('/admin/clientes');
  redirect(`/admin/clientes/${parsed.data.id}?ok=salvo`);
}
