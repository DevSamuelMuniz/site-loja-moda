import { getPrisma, type Tx } from '@/lib/db';
import type { InventoryMovementType } from '@/generated/prisma/enums';

/**
 * Estoque (escopo §8).
 *
 * Regra do modulo: **nada altera `inventory.quantity` sem passar por aqui** — e tudo que
 * passa por aqui grava uma linha em `inventory_movements`. E o que permite responder "por que
 * este saldo esta errado?" olhando o historico, em vez de adivinhar.
 *
 * Duas garantias que nao podem depender de sorte:
 *
 * 1. **Saldo nunca fica negativo** sem permissao explicita do produto (`allowBackorder`, §8:
 *    pre-venda ou estoque negativo configurado). A checagem e um `UPDATE` condicional: com
 *    duas vendas simultaneas do ultimo par, uma passa e a outra recebe erro de estoque — ler
 *    o saldo e depois gravar deixaria as duas passarem.
 * 2. **Toda movimentacao acontece na transacao de quem chamou.** Vender e baixar estoque e uma
 *    operacao so: ou o pedido existe com o estoque baixado, ou nada aconteceu.
 */

export type { Tx } from '@/lib/db';

const SIGN: Record<InventoryMovementType, 'in' | 'out' | 'both'> = {
  PURCHASE: 'in',
  SALE: 'out',
  CANCELLATION: 'in',
  EXCHANGE: 'both',
  ADJUSTMENT: 'both',
  RETURN: 'in',
};

export const MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  PURCHASE: 'Entrada',
  SALE: 'Venda',
  CANCELLATION: 'Cancelamento',
  EXCHANGE: 'Troca',
  ADJUSTMENT: 'Ajuste manual',
  RETURN: 'Devolução',
};

/** Erro de negocio de estoque — nao e falha de infraestrutura, e uma regra do escopo §8. */
export class StockError extends Error {
  constructor(
    message: string,
    /** SKU ou identificacao da variacao, para a mensagem do formulario. */
    readonly subject: string,
  ) {
    super(message);
    this.name = 'StockError';
  }
}

export class InsufficientStockError extends StockError {
  constructor(
    readonly available: number,
    readonly requested: number,
    subject: string,
    readonly allowBackorder = false,
  ) {
    super(
      allowBackorder
        ? `A variação ${subject} esta marcada para aceitar pré-venda, mas o saldo ficaria negativo.`
        : `A variação ${subject} não tem estoque suficiente: ${available} disponível(is) para ${requested} pedido(s).`,
      subject,
    );
    this.name = 'InsufficientStockError';
  }
}

export interface MovementInput {
  storeId: string;
  variantId: string;
  type: InventoryMovementType;
  /** Quantidade **com sinal**: positivo entra, negativo sai (§8). */
  delta: number;
  reason?: string | null;
  userId?: string | null;
  orderId?: string | null;
}

function assertSign(type: InventoryMovementType, delta: number, subject: string): void {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new StockError(`A movimentação de ${subject} precisa de uma quantidade inteira diferente de zero.`, subject);
  }

  const sign = SIGN[type];
  if (sign === 'in' && delta < 0) {
    throw new StockError(`Movimentação do tipo ${MOVEMENT_LABELS[type]} só registra entrada.`, subject);
  }
  if (sign === 'out' && delta > 0) {
    throw new StockError(`Movimentação do tipo ${MOVEMENT_LABELS[type]} só registra saída.`, subject);
  }
}

/**
 * Aplica o delta e registra a movimentacao. Uso interno: a variacao ja foi validada.
 */
async function applyDelta(tx: Tx, input: MovementInput): Promise<number> {
  const { storeId, variantId, type, delta, reason, userId, orderId } = input;
  const subject = variantId;

  const variant = await tx.productVariant.findFirst({
    where: { id: variantId, storeId },
    select: { sku: true, inventory: { select: { id: true, quantity: true } } },
  });

  if (!variant) throw new StockError('Variação não encontrada nesta loja.', subject);

  assertSign(type, delta, variant.sku);

  let balance: number;

  if (!variant.inventory) {
    /* Sem linha de saldo: a primeira entrada cria. Uma saida aqui e estoque insuficiente —
       nao existe saldo para consumir. */
    if (delta < 0) throw new InsufficientStockError(0, Math.abs(delta), variant.sku);

    const created = await tx.inventory.create({
      data: { storeId, variantId, quantity: delta },
      select: { quantity: true },
    });
    balance = created.quantity;
  } else {
    /* UPDATE condicional: e aqui que duas vendas simultaneas do ultimo par sao resolvidas —
       uma passa, a outra volta com zero linhas e vira erro de estoque. */
    const updated = await tx.$queryRaw<Array<{ quantity: number }>>`
      UPDATE "inventory"
         SET "quantity" = "quantity" + ${delta}::int,
             "updatedAt" = NOW()
       WHERE "storeId" = ${storeId}
         AND "variantId" = ${variantId}
         AND (${delta}::int > 0 OR "allowBackorder" = true OR "quantity" + ${delta}::int >= 0)
      RETURNING "quantity"
    `;

    if (updated.length === 0) {
      const allowed = await tx.inventory.findUnique({
        where: { variantId },
        select: { allowBackorder: true },
      });
      throw new InsufficientStockError(
        variant.inventory.quantity,
        Math.abs(delta),
        variant.sku,
        allowed?.allowBackorder ?? false,
      );
    }

    balance = updated[0].quantity;
  }

  await tx.inventoryMovement.create({
    data: { storeId, variantId, type, quantity: delta, reason: reason ?? null, userId: userId ?? null, orderId: orderId ?? null },
  });

  return balance;
}

/** Movimenta o estoque de uma variacao numa transacao propria. */
export async function recordMovement(input: MovementInput): Promise<number> {
  return getPrisma().$transaction((tx) => applyDelta(tx, input));
}

export interface StockLevelInput {
  storeId: string;
  variantId: string;
  /** Saldo final desejado — o ajuste do painel trabalha com o numero contado na prateleira. */
  newQuantity: number;
  reason: string;
  userId: string;
}

/**
 * Ajuste manual (§20): o operador informa quanto contou e o sistema registra a diferenca.
 *
 * Gravar o saldo "por cima" perderia a informacao de quanto foi ajustado; por isso o delta e
 * calculado aqui e vira movimentacao com motivo.
 */
export async function setStockLevel(input: StockLevelInput): Promise<{ changed: boolean; quantity: number }> {
  const { storeId, variantId, newQuantity, reason, userId } = input;

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    throw new StockError('Informe um saldo inteiro igual ou maior que zero.', variantId);
  }
  if (!reason.trim()) {
    throw new StockError('Ajuste de estoque exige motivo: sem ele o histórico não explica nada.', variantId);
  }

  return getPrisma().$transaction(async (tx) => {
    const current = await tx.inventory.findUnique({
      where: { variantId },
      select: { quantity: true, storeId: true },
    });

    if (current && current.storeId !== storeId) {
      throw new StockError('Variação de outra loja.', variantId);
    }

    const delta = newQuantity - (current?.quantity ?? 0);
    if (delta === 0) return { changed: false, quantity: newQuantity };

    const quantity = await applyDelta(tx, {
      storeId,
      variantId,
      type: 'ADJUSTMENT',
      delta,
      reason,
      userId,
    });

    return { changed: true, quantity };
  });
}

export interface OrderStockItem {
  variantId: string;
  quantity: number;
  label: string;
}/** Baixa o estoque de um pedido vendido (§8: tipo `SALE`). */
export async function deductForOrder(
  tx: Tx,
  input: { storeId: string; orderId: string; userId?: string | null; items: readonly OrderStockItem[] },
): Promise<void> {
  for (const item of input.items) {
    await applyDelta(tx, {
      storeId: input.storeId,
      variantId: item.variantId,
      type: 'SALE',
      delta: -Math.abs(item.quantity),
      reason: `Pedido ${input.orderId}`,
      userId: input.userId ?? null,
      orderId: input.orderId,
    });
  }
}

/** Devolve o estoque de um pedido cancelado ou devolvido (§8: `CANCELLATION` / `RETURN`). */
export async function restoreForOrder(
  tx: Tx,
  input: {
    storeId: string;
    orderId: string;
    userId?: string | null;
    type: 'CANCELLATION' | 'RETURN';
    reason?: string;
    items: readonly OrderStockItem[];
  },
): Promise<void> {
  for (const item of input.items) {
    await applyDelta(tx, {
      storeId: input.storeId,
      variantId: item.variantId,
      type: input.type,
      delta: Math.abs(item.quantity),
      reason: input.reason ?? `Estorno do pedido ${input.orderId}`,
      userId: input.userId ?? null,
      orderId: input.orderId,
    });
  }
}

/** Estoque disponivel para venda: saldo menos o reservado (a reserva entra na FASE 3). */
export function available(quantity: number, reserved = 0): number {
  return Math.max(0, quantity - reserved);
}

/**
 * Liga/desliga a permissao de vender sem saldo (escopo §8: prevenda ou estoque negativo).
 *
 * E configuracao da variacao, nao movimentacao: ligar isto **nao** cria entrada de estoque —
 * apenas permite que a proxima venda deixe o saldo negativo quando a loja decidir que pode.
 */
export async function setBackorder(input: {
  storeId: string;
  variantId: string;
  allow: boolean;
}): Promise<{ allowBackorder: boolean }> {
  const { storeId, variantId, allow } = input;

  return getPrisma().$transaction(async (tx) => {
    const variant = await tx.productVariant.findFirst({
      where: { id: variantId, storeId },
      select: { sku: true, inventory: { select: { id: true } } },
    });

    if (!variant) throw new StockError('Variação não encontrada nesta loja.', variantId);

    if (variant.inventory) {
      await tx.inventory.update({ where: { variantId }, data: { allowBackorder: allow } });
    } else if (allow) {
      /* Sem linha de saldo ainda: criar zerada e o unico jeito de guardar a permissao. */
      await tx.inventory.create({ data: { storeId, variantId, quantity: 0, allowBackorder: true } });
    }

    return { allowBackorder: allow };
  });
}
