import { getPrisma, type Tx } from '@/lib/db';
import { money, multiply, sum, toDecimalInput, type Money } from '@/lib/money';
import { resolveCustomer, type CustomerContact } from '@/lib/customers/service';
import { deductForOrder, restoreForOrder, StockError, type OrderStockItem } from '@/lib/inventory/service';
import { canTransition, stockEffectFor, type StockEffect } from '@/lib/orders/status';
import type { OrderChannel, OrderStatus } from '@/generated/prisma/enums';

/**
 * Pedidos (escopo §13).
 *
 * Duas questoes dominam este modulo:
 *
 * 1. **Numero unico por loja.** `AUR-1024` sai de `stores.orderSequence`, avancado dentro da
 *    transacao que cria o pedido. Contar pedidos existentes (`count(*) + 1`) daria numero
 *    repetido assim que duas vendas acontecessem juntas — e o indice unico recusaria uma
 *    delas, deixando o operador sem entender o erro.
 * 2. **Pedido e estoque mudam juntos.** O status decide o efeito no saldo (§8), e os dois
 *    acontecem na mesma transacao: pedido vendido sem baixa de estoque estoura o saldo em
 *    silencio.
 *
 * `stockDeductedAt` registra o estado atual do efeito: enquanto nao for nulo, o saldo esta
 * baixado por este pedido — e e o que impede baixar ou devolver duas vezes.
 */

export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderError';
  }
}

export interface AddressSnapshot {
  recipient: string;
  postalCode: string;
  line1: string;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city: string;
  state: string;
  country?: string | null;
}

export interface OrderItemInput {
  variantId: string;
  quantity: number;
  /** Preco praticado. Ausente = preco do catalogo da variacao/produto. */
  unitPrice?: number;
}

export interface CreateOrderInput {
  storeId: string;
  /** Quem registrou. Nulo quando o pedido vier do checkout do cliente (FASE 3). */
  userId?: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  contact: CustomerContact;
  items: readonly OrderItemInput[];
  discountAmount?: number;
  shippingAmount?: number;
  shippingLabel?: string | null;
  shippingAddress?: AddressSnapshot | null;
  paymentMethod?: string | null;
  notes?: string | null;
}

export interface CreatedOrder {
  id: string;
  number: string;
}

/** Reserva o proximo numero da loja dentro da transacao corrente (§13). */
async function allocateNumber(tx: Tx, storeId: string): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ orderPrefix: string; orderSequence: number }>>`
    UPDATE "stores"
       SET "orderSequence" = "orderSequence" + 1,
           "updatedAt" = NOW()
     WHERE "id" = ${storeId}
    RETURNING "orderPrefix", "orderSequence"
  `;

  if (rows.length === 0) throw new OrderError('Loja não encontrada para numerar o pedido.');

  return `${rows[0].orderPrefix}-${rows[0].orderSequence}`;
}

interface ResolvedItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  colorName: string | null;
  size: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

/**
 * Resolve as linhas contra o catalogo: e aqui que o pedido congela nome, SKU, cor, tamanho e
 * preco do que foi vendido (§13). O catalogo muda amanha; o pedido de hoje nao.
 */
async function resolveItems(
  tx: Tx,
  input: { storeId: string; items: readonly OrderItemInput[] },
): Promise<ResolvedItem[]> {
  const resolved: ResolvedItem[] = [];

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new OrderError('Quantidade do item precisa ser um número inteiro maior que zero.');
    }

    const variant = await tx.productVariant.findFirst({
      where: { id: item.variantId, storeId: input.storeId, deletedAt: null },
      select: {
        id: true,
        sku: true,
        size: true,
        price: true,
        productId: true,
        color: { select: { name: true } },
        product: {
          select: { name: true, price: true, deletedAt: true, status: true },
        },
      },
    });

    if (!variant || variant.product.deletedAt || variant.product.status === 'ARCHIVED') {
      throw new OrderError('Um dos itens do pedido não está mais disponível no catálogo.');
    }

    /* Preco da variacao quando existir, senao o do produto — a mesma regra da loja publica. */
    const catalogPrice = money(variant.price ?? variant.product.price);
    const unitPrice = item.unitPrice === undefined ? catalogPrice : money(item.unitPrice);

    if (unitPrice.isNegative()) throw new OrderError('Preço unitário não pode ser negativo.');

    resolved.push({
      productId: variant.productId,
      variantId: variant.id,
      name: variant.product.name,
      sku: variant.sku,
      colorName: variant.color?.name ?? null,
      size: variant.size,
      unitPrice,
      quantity: item.quantity,
      lineTotal: multiply(unitPrice, item.quantity),
    });
  }

  if (resolved.length === 0) throw new OrderError('Um pedido precisa de pelo menos um item.');

  return resolved;
}

/** Registra a movimentacao de status. Nenhuma mudanca de status acontece sem passar aqui. */
async function recordEvent(
  tx: Tx,
  input: {
    storeId: string;
    orderId: string;
    from: OrderStatus | null;
    to: OrderStatus;
    note?: string | null;
    userId?: string | null;
  },
): Promise<void> {
  await tx.orderStatusEvent.create({
    data: {
      storeId: input.storeId,
      orderId: input.orderId,
      from: input.from,
      to: input.to,
      note: input.note ?? null,
      userId: input.userId ?? null,
    },
  });
}

/**
 * Aplica no estoque o efeito calculado para a transicao. Devolve `true` quando o saldo ficou
 * baixado por este pedido.
 */
async function applyStockEffect(
  tx: Tx,
  input: {
    storeId: string;
    orderId: string;
    userId?: string | null;
    effect: StockEffect;
    items: readonly OrderStockItem[];
  },
): Promise<boolean> {
  const { effect } = input;

  if (effect === 'deduct') {
    await deductForOrder(tx, {
      storeId: input.storeId,
      orderId: input.orderId,
      userId: input.userId ?? null,
      items: input.items,
    });
    return true;
  }

  if (effect === 'restore-cancellation' || effect === 'restore-return') {
    await restoreForOrder(tx, {
      storeId: input.storeId,
      orderId: input.orderId,
      userId: input.userId ?? null,
      type: effect === 'restore-cancellation' ? 'CANCELLATION' : 'RETURN',
      items: input.items,
    });
    return false;
  }

  return false;
}

/**
 * Cria o pedido: valida itens, congela precos, resolve o cliente, numera, grava as linhas e —
 * quando o status escolhido significa venda — baixa o estoque. Tudo numa transacao.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const discount = money(input.discountAmount ?? 0);
  const shipping = money(input.shippingAmount ?? 0);

  if (discount.isNegative() || shipping.isNegative()) {
    throw new OrderError('Desconto e frete não podem ser negativos.');
  }

  return getPrisma().$transaction(async (tx) => {
    const items = await resolveItems(tx, { storeId: input.storeId, items: input.items });

    const subtotal = sum(items.map((item) => item.lineTotal));
    if (discount.greaterThan(subtotal.add(shipping))) {
      throw new OrderError('O desconto não pode passar do valor do pedido.');
    }
    const total = subtotal.sub(discount).add(shipping);

    const customer = await resolveCustomer(tx, { storeId: input.storeId, contact: input.contact });
    const number = await allocateNumber(tx, input.storeId);

    const order = await tx.order.create({
      data: {
        storeId: input.storeId,
        number,
        status: input.status,
        channel: input.channel,
        customerId: customer.id,
        createdById: input.userId ?? null,
        customerName: input.contact.name.trim(),
        email: input.contact.email.trim().toLowerCase(),
        phone: input.contact.phone?.trim() || null,
        document: input.contact.document?.replace(/\D/g, '') || null,
        shippingAddress: input.shippingAddress ? { ...input.shippingAddress } : undefined,
        shippingLabel: input.shippingLabel?.trim() || null,
        subtotal: toDecimalInput(subtotal),
        discountAmount: toDecimalInput(discount),
        shippingAmount: toDecimalInput(shipping),
        total: toDecimalInput(total),
        paymentMethod: input.paymentMethod?.trim() || null,
        notes: input.notes?.trim() || null,
        items: {
          create: items.map((item) => ({
            storeId: input.storeId,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            colorName: item.colorName,
            size: item.size,
            unitPrice: toDecimalInput(item.unitPrice),
            quantity: item.quantity,
            lineTotal: toDecimalInput(item.lineTotal),
          })),
        },
      },
      select: { id: true, number: true },
    });

    const effect = stockEffectFor(null, input.status);
    if (effect !== 'deduct' && effect !== 'none') {
      throw new OrderError('Um pedido novo não pode nascer já finalizado.');
    }

    const deducted = await applyStockEffect(tx, {
      storeId: input.storeId,
      orderId: order.id,
      userId: input.userId ?? null,
      effect,
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        label: `${item.name} · ${item.size}`,
      })),
    });

    if (deducted) {
      await tx.order.update({
        where: { id: order.id },
        data: { stockDeductedAt: new Date() },
      });
    }

    await recordEvent(tx, {
      storeId: input.storeId,
      orderId: order.id,
      from: null,
      to: input.status,
      note: 'Pedido registrado no painel.',
      userId: input.userId ?? null,
    });

    return order;
  });
}

export interface ChangeStatusInput {
  storeId: string;
  orderId: string;
  to: OrderStatus;
  note?: string | null;
  userId: string;
}

/**
 * Muda o status aplicando o efeito no estoque (§8, §13).
 *
 * Recusa transicao que nao existe no funil: "entregue" nao volta para "aguardando pagamento",
 * e um pedido cancelado nao vira enviado. Para corrigir, o caminho e o status que existe.
 */
export async function changeOrderStatus(input: ChangeStatusInput): Promise<{ status: OrderStatus }> {
  const { storeId, orderId, to, userId } = input;

  return getPrisma().$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, storeId },
      select: {
        id: true,
        status: true,
        number: true,
        stockDeductedAt: true,
        items: { select: { variantId: true, quantity: true, name: true, size: true } },
      },
    });

    if (!order) throw new OrderError('Pedido não encontrado nesta loja.');
    if (order.status === to) throw new OrderError('O pedido já está neste status.');
    if (!canTransition(order.status, to)) {
      throw new OrderError(`Não é possível passar de "${order.status}" para "${to}".`);
    }

    const effect = stockEffectFor(order.status, to);
    const items: OrderStockItem[] = order.items.flatMap((item) =>
      item.variantId
        ? [{ variantId: item.variantId, quantity: item.quantity, label: `${item.name} · ${item.size}` }]
        : [],
    );

    let stockDeductedAt = order.stockDeductedAt;

    if (effect === 'deduct' && order.stockDeductedAt === null) {
      await deductForOrder(tx, { storeId, orderId, userId, items });
      stockDeductedAt = new Date();
    } else if (
      (effect === 'restore-cancellation' || effect === 'restore-return') &&
      order.stockDeductedAt !== null
    ) {
      /* `stockDeductedAt` e o guarda da devolucao: se o saldo ja voltou, nao volta de novo. */
      await restoreForOrder(tx, {
        storeId,
        orderId,
        userId,
        type: effect === 'restore-return' ? 'RETURN' : 'CANCELLATION',
        items,
      });
      stockDeductedAt = null;
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: to, stockDeductedAt },
      select: { status: true },
    });

    await recordEvent(tx, {
      storeId,
      orderId,
      from: order.status,
      to,
      note: input.note ?? null,
      userId,
    });

    return updated;
  });
}

/** Traduz erro de dominio em mensagem para o formulario. */
export function describeError(error: unknown): string {
  if (error instanceof StockError || error instanceof OrderError) return error.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}
