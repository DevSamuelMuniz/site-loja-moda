'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/AdminForm';
import { describeIssues, idField, optionalMoney, optionalText } from '@/lib/admin/schema';
import { requirePermission } from '@/lib/auth/guards';
import { StockError } from '@/lib/inventory/service';
import { OrderError, changeOrderStatus, createOrder } from '@/lib/orders/service';
import { isOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orders/status';
import { normalizeEmail } from '@/lib/customers/service';
import type { AddressSnapshot } from '@/lib/orders/service';

/**
 * Acoes de pedido (escopo §13, §20).
 *
 * `createOrder` e `changeOrderStatus` fazem o trabalho dentro de uma transacao: pedido, linhas,
 * historico de status e movimentacao de estoque entram ou nao entram juntos (§8). A action
 * apenas valida o formulario, chama o servico e traduz o erro de negocio para o operador.
 *
 * Mudar status nao e edicao de campo: cada transicao tem efeito no saldo, e `status.ts` decide
 * quais existem.
 */

const CUSTOMER_SCHEMA = z.object({
  name: z.string().trim().min(2, 'informe o nome do cliente'),
  email: z.string().trim().toLowerCase().email('informe um e-mail válido'),
  phone: optionalText,
  document: optionalText,
});

const ADDRESS_SCHEMA = z.object({
  recipient: optionalText,
  postalCode: optionalText,
  line1: optionalText,
  number: optionalText,
  complement: optionalText,
  district: optionalText,
  city: optionalText,
  state: optionalText,
});

function readItems(formData: FormData) {
  const variantIds = formData.getAll('variantId').map(String);
  const quantities = formData.getAll('quantity').map(String);
  const prices = formData.getAll('unitPrice').map(String);

  const items: Array<{ variantId: string; quantity: number; unitPrice?: number }> = [];
  const errors: string[] = [];

  variantIds.forEach((variantId, index) => {
    if (!variantId) return;

    const quantity = Number.parseInt(quantities[index] ?? '0', 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`linha ${index + 1}: quantidade inválida`);
      return;
    }

    const rawPrice = (prices[index] ?? '').trim();
    const unitPrice = rawPrice === '' ? undefined : Number(rawPrice.replace(',', '.'));

    if (unitPrice !== undefined && (!Number.isFinite(unitPrice) || unitPrice < 0)) {
      errors.push(`linha ${index + 1}: preço inválido`);
      return;
    }

    items.push({ variantId, quantity, ...(unitPrice === undefined ? {} : { unitPrice }) });
  });

  return { items, errors };
}

function readAddress(formData: FormData): AddressSnapshot | null {
  const parsed = ADDRESS_SCHEMA.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return null;

  const value = parsed.data;
  if (!value.recipient || !value.postalCode || !value.line1 || !value.city || !value.state) return null;

  return {
    recipient: value.recipient,
    postalCode: value.postalCode,
    line1: value.line1,
    number: value.number ?? null,
    complement: value.complement ?? null,
    district: value.district ?? null,
    city: value.city,
    state: value.state,
  };
}

export async function createOrderAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('orders', 'create');

  const status = String(formData.get('status') ?? 'PAID');
  const channel = String(formData.get('channel') ?? 'STORE');

  if (status !== 'PAID' && status !== 'PENDING_PAYMENT') {
    return { ok: false, message: 'Escolha entre pagamento aprovado e aguardando pagamento.' };
  }

  const customer = CUSTOMER_SCHEMA.safeParse(Object.fromEntries(formData.entries()));
  if (!customer.success) return { ok: false, message: describeIssues(customer.error) };

  const { items, errors } = readItems(formData);
  if (errors.length > 0) return { ok: false, message: errors.join('; ') };
  if (items.length === 0) return { ok: false, message: 'Adicione ao menos um item ao pedido.' };

  const discount = optionalMoney.safeParse(formData.get('discountAmount'));
  const shipping = optionalMoney.safeParse(formData.get('shippingAmount'));

  if (!discount.success || !shipping.success) {
    return { ok: false, message: 'Desconto e frete precisam ser números.' };
  }

  try {
    const order = await createOrder({
      storeId: user.storeId,
      userId: user.id,
      status,
      channel: channel === 'WHATSAPP' || channel === 'PHONE' || channel === 'ONLINE' ? channel : 'STORE',
      contact: {
        name: customer.data.name,
        email: normalizeEmail(customer.data.email),
        phone: customer.data.phone ?? null,
        document: customer.data.document ?? null,
      },
      items,
      discountAmount: discount.data ?? 0,
      shippingAmount: shipping.data ?? 0,
      shippingLabel: String(formData.get('shippingLabel') ?? '') || null,
      shippingAddress: readAddress(formData),
      paymentMethod: String(formData.get('paymentMethod') ?? '') || null,
      notes: String(formData.get('notes') ?? '') || null,
    });

    revalidatePath('/admin/pedidos');
    revalidatePath('/admin/estoque');
    revalidatePath('/admin');

    redirect(`/admin/pedidos/${order.id}?ok=pedido`);
  } catch (error) {
    if (error instanceof StockError || error instanceof OrderError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: 'Não foi possível registrar o pedido.' };
  }
}

export async function changeOrderStatusAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission('orders', 'update');

  const orderId = idField.safeParse(formData.get('orderId'));
  const to = String(formData.get('to') ?? '');
  const note = String(formData.get('note') ?? '').trim();

  if (!orderId.success) return { ok: false, message: 'Pedido não informado.' };
  if (!isOrderStatus(to)) return { ok: false, message: 'Escolha um status válido.' };

  try {
    await changeOrderStatus({ storeId: user.storeId, orderId: orderId.data, to, note, userId: user.id });

    revalidatePath(`/admin/pedidos/${orderId.data}`);
    revalidatePath('/admin/pedidos');
    revalidatePath('/admin/estoque');
    revalidatePath('/admin');

    return { ok: true, message: `Status alterado para "${ORDER_STATUS_LABELS[to]}".` };
  } catch (error) {
    if (error instanceof StockError || error instanceof OrderError) {
      return { ok: false, message: error.message };
    }
    return { ok: false, message: 'Não foi possível alterar o status.' };
  }
}

/** Cancelamento e um caso de mudanca de status, com confirmacao na interface. */
export async function cancelOrderAction(formData: FormData): Promise<void> {
  const user = await requirePermission('orders', 'update');
  const orderId = idField.safeParse(formData.get('orderId'));
  if (!orderId.success) redirect('/admin/pedidos?erro=dados');

  try {
    await changeOrderStatus({
      storeId: user.storeId,
      orderId: orderId.data,
      to: 'CANCELLED',
      note: String(formData.get('note') ?? 'Cancelado no painel.'),
      userId: user.id,
    });
  } catch {
    redirect(`/admin/pedidos/${orderId.data}?erro=estoque`);
  }

  revalidatePath(`/admin/pedidos/${orderId.data}`);
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/estoque');
  redirect(`/admin/pedidos/${orderId.data}?ok=status`);
}
