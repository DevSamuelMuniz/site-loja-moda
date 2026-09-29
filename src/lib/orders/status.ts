import type { OrderChannel, OrderStatus } from '@/generated/prisma/enums';

/**
 * Regras do pedido que **nao** dependem do banco (escopo §13, §8).
 *
 * Fica separado de `./service` porque a interface do painel tambem precisa disto: rotulos,
 * proximos status validos e o efeito de cada mudanca no estoque. Modulo puro — pode ser
 * importado por componente cliente sem levar o cliente Prisma junto.
 */

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {  PENDING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pagamento aprovado',
  PREPARING: 'Em preparação',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  RETURNED: 'Devolvido',
};

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  ONLINE: 'Loja online',
  STORE: 'Loja física',
  WHATSAPP: 'WhatsApp',
  PHONE: 'Telefone',
};

/**
 * Progressao permitida entre status (escopo §13).
 *
 * Nao e burocracia: e o que impede "entregue" voltar para "aguardando pagamento" e o que
 * mantem o estoque coerente — cada transicao tem efeito conhecido sobre o saldo.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED', 'REFUNDED'],
  PREPARING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED', 'REFUNDED'],
  /* Reembolso e estado financeiro: a peca ainda pode voltar depois, e o saldo so volta em
     `RETURNED` — e por isso que o reembolso nao e o fim da linha. */
  REFUNDED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

/** Status em que a peca saiu do estoque da loja. */
export const SOLD_STATUSES: readonly OrderStatus[] = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];

/**
 * Status que contam como faturamento.
 *
 * `PENDING_PAYMENT` ainda nao e dinheiro; `CANCELLED`, `REFUNDED` e `RETURNED` deixaram de
 * ser. Rascunhar faturamento com estes seria inflar o numero do painel.
 */
export const REVENUE_STATUSES: readonly OrderStatus[] = SOLD_STATUSES;

export type StockEffect = 'none' | 'deduct' | 'restore-cancellation' | 'restore-return';

/** Status em que a mercadoria ja nao esta na loja: reembolsar nao traz a peca de volta. */
const GOODS_LEFT_STORE: readonly OrderStatus[] = ['SHIPPED', 'DELIVERED'];

/**
 * Efeito da mudanca de status sobre o estoque (§8).
 *
 * Depende da **transicao**, nao so do destino:
 *
 * - entrada em status de venda → baixa;
 * - `CANCELLED` → devolve saldo (tipo `CANCELLATION`);
 * - `RETURNED` → devolve saldo (tipo `RETURN`): a peca voltou para a loja;
 * - `REFUNDED` → devolve saldo **so quando a peca nunca saiu** (`PAID`, `PREPARING`).
 *   Reembolsar um pedido entregue e dinheiro, nao mercadoria; quem devolve a peca depois
 *   move para `RETURNED`, e ai o saldo volta.
 *
 * `from === null` significa pedido novo.
 */
export function stockEffectFor(from: OrderStatus | null, to: OrderStatus): StockEffect {
  if (SOLD_STATUSES.includes(to)) {
    return from !== null && SOLD_STATUSES.includes(from) ? 'none' : 'deduct';
  }

  if (to === 'CANCELLED') return 'restore-cancellation';
  if (to === 'RETURNED') return 'restore-return';
  if (to === 'REFUNDED') {
    return from !== null && GOODS_LEFT_STORE.includes(from) ? 'none' : 'restore-cancellation';
  }

  return 'none';
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export const ORDER_STATUS_VALUES = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'RETURNED',
] as const satisfies readonly OrderStatus[];

/** Estreita valor vindo de fora (formulario, URL) para `OrderStatus`. */
export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUS_VALUES as readonly string[]).includes(value);
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return [...ORDER_STATUS_TRANSITIONS[from]];
}

export function isFinalStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[status].length === 0;
}

/** Status que a loja pode escolher ao registrar uma venda: a peca ja saiu ou ainda vai sair. */
export const MANUAL_ORDER_STATUSES: readonly OrderStatus[] = ['PAID', 'PENDING_PAYMENT'];
