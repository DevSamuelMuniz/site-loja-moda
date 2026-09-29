'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { describeIssues, idField, requiredInt } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import { StockError, recordMovement, setBackorder, setStockLevel } from '@/lib/inventory/service';

/**
 * Acoes de estoque (escopo §8, §20).
 *
 * Dois caminhos manuais, e os dois deixam movimentacao:
 *
 * 1. **Ajuste (contagem)**: o operador informa o saldo que contou. O servico calcula a
 *    diferenca e grava `ADJUSTMENT` com motivo — gravar o saldo "por cima" perderia quanto
 *    foi ajustado.
 * 2. **Entrada**: mercadoria que chegou (`PURCHASE`), troca (`EXCHANGE`) ou devolucao
 *    (`RETURN`), somando quantidade.
 *
 * Venda e cancelamento **nao** entram por aqui: eles vem do pedido (§13), para o estoque nao
 * ter dois donos.
 */

const MANUAL_TYPES = ['PURCHASE', 'EXCHANGE', 'RETURN'] as const;

const movementSchema = z.object({
  variantId: idField,
  type: z.enum(MANUAL_TYPES),
  quantity: requiredInt.refine((value) => value > 0, 'informe uma quantidade maior que zero'),
  reason: z.string().trim().min(3, 'descreva o motivo'),
});

export async function setStockAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('inventory', 'update');

  const variantId = idField.safeParse(formData.get('variantId'));
  const quantity = requiredInt.safeParse(formData.get('quantity'));

  if (!variantId.success) return { ok: false, message: 'Escolha a variação.' };
  if (!quantity.success) return { ok: false, message: 'Informe o saldo contado (número inteiro).' };

  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 3) return { ok: false, message: 'Explique o motivo do ajuste.' };

  try {
    const result = await setStockLevel({
      storeId: user.storeId,
      variantId: variantId.data,
      newQuantity: quantity.data,
      reason,
      userId: user.id,
    });

    revalidatePath('/admin/estoque');
    revalidatePath('/admin');

    return result.changed
      ? { ok: true, message: `Saldo ajustado para ${result.quantity}.` }
      : { ok: false, message: `O saldo já era ${result.quantity}: nada a registrar.` };
  } catch (error) {
    if (error instanceof StockError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível ajustar o estoque.' };
  }
}

export async function recordMovementAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('inventory', 'create');

  const parsed = movementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: describeIssues(parsed.error) };

  try {
    const balance = await recordMovement({
      storeId: user.storeId,
      variantId: parsed.data.variantId,
      type: parsed.data.type,
      delta: parsed.data.quantity,
      reason: parsed.data.reason,
      userId: user.id,
    });

    revalidatePath('/admin/estoque');
    revalidatePath('/admin');

    return { ok: true, message: `Entrada registrada. O saldo agora é ${balance}.` };
  } catch (error) {
    if (error instanceof StockError) return { ok: false, message: error.message };
    return { ok: false, message: 'Não foi possível registrar a movimentação.' };
  }
}

/** Permite (ou proibe) vender a variacao sem saldo — prevenda do escopo §8. */
export async function setBackorderAction(formData: FormData): Promise<void> {
  const user = await requirePermission('inventory', 'update');
  const variantId = idField.safeParse(formData.get('variantId'));
  if (!variantId.success) redirect('/admin/estoque?erro=dados');

  try {
    await setBackorder({
      storeId: user.storeId,
      variantId: variantId.data,
      allow: String(formData.get('allow') ?? '') === 'true',
    });
  } catch {
    redirect('/admin/estoque?erro=dados');
  }

  revalidatePath('/admin/estoque');
  redirect('/admin/estoque?ok=salvo');
}
