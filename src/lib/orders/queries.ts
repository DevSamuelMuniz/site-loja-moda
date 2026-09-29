import { getPrisma } from '@/lib/db';
import { toNumber } from '@/lib/money';
import { REVENUE_STATUSES } from '@/lib/orders/status';
import type { OrderChannel, OrderStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Leitura de pedidos para o painel (escopo §20: listagem, filtros, detalhes, historico).
 *
 * Consulta nao muda pedido — quem muda esta em `./service`, e sempre com registro em
 * `order_status_events`.
 */

export interface OrderListRow {
  id: string;
  number: string;
  status: OrderStatus;
  channel: OrderChannel;
  customerId: string;
  customerName: string;
  email: string;
  total: number;
  itemCount: number;
  placedAt: Date;
  /** Saldo do pedido ja devolvido/baixado — usado para sinalizar cancelamento no painel. */
  stockDeducted: boolean;
}

export interface OrderFilter {
  storeId: string;
  status?: OrderStatus;
  /** Numero do pedido, nome ou e-mail do cliente. */
  search?: string;
  customerId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

function orderWhere({ storeId, status, search, customerId, from, to }: OrderFilter): Prisma.OrderWhereInput {
  const term = search?.trim();
  const and: Prisma.OrderWhereInput[] = [];

  if (term) {
    and.push({
      OR: [
        { number: { contains: term, mode: 'insensitive' } },
        { customerName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  if (from || to) {
    and.push({ placedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } });
  }

  return {
    storeId,
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

export async function listOrders(filter: OrderFilter): Promise<OrderListRow[]> {
  const { page = 1, pageSize = 20 } = filter;

  const rows = await getPrisma().order.findMany({
    where: orderWhere(filter),
    orderBy: { placedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      number: true,
      status: true,
      channel: true,
      customerId: true,
      customerName: true,
      email: true,
      total: true,
      placedAt: true,
      stockDeductedAt: true,
      _count: { select: { items: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    status: row.status,
    channel: row.channel,
    customerId: row.customerId,
    customerName: row.customerName,
    email: row.email,
    total: toNumber(row.total),
    itemCount: row._count.items,
    placedAt: row.placedAt,
    stockDeducted: row.stockDeductedAt !== null,
  }));
}

export async function countOrders(filter: OrderFilter): Promise<number> {
  return getPrisma().order.count({ where: orderWhere(filter) });
}

export interface OrderItemRow {
  id: string;
  name: string;
  sku: string;
  colorName: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productId: string | null;
}

export interface OrderEventRow {
  id: string;
  from: OrderStatus | null;
  to: OrderStatus;
  note: string | null;
  createdAt: Date;
  userName: string | null;
}

export interface OrderDetail {
  id: string;
  number: string;
  status: OrderStatus;
  channel: OrderChannel;
  customerId: string;
  customerName: string;
  email: string;
  phone: string | null;
  document: string | null;
  shippingAddress: unknown;
  shippingLabel: string | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  paymentMethod: string | null;
  notes: string | null;
  placedAt: Date;
  stockDeducted: boolean;
  items: OrderItemRow[];
  events: OrderEventRow[];
}

export async function getOrder(input: { storeId: string; id: string }): Promise<OrderDetail | null> {
  const row = await getPrisma().order.findFirst({
    where: { id: input.id, storeId: input.storeId },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      events: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    number: row.number,
    status: row.status,
    channel: row.channel,
    customerId: row.customerId,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone,
    document: row.document,
    shippingAddress: row.shippingAddress,
    shippingLabel: row.shippingLabel,
    subtotal: toNumber(row.subtotal),
    discountAmount: toNumber(row.discountAmount),
    shippingAmount: toNumber(row.shippingAmount),
    total: toNumber(row.total),
    paymentMethod: row.paymentMethod,
    notes: row.notes,
    placedAt: row.placedAt,
    stockDeducted: row.stockDeductedAt !== null,
    items: row.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      colorName: item.colorName,
      size: item.size,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineTotal: toNumber(item.lineTotal),
      productId: item.productId,
    })),
    events: row.events.map((event) => ({
      id: event.id,
      from: event.from,
      to: event.to,
      note: event.note,
      createdAt: event.createdAt,
      userName: event.user?.name ?? null,
    })),
  };
}

export interface OrderStats {
  revenue: number;
  paidOrders: number;
  averageTicket: number;
  itemsSold: number;
  openOrders: number;
  byStatus: Array<{ status: OrderStatus; count: number }>;
}

/**
 * Numeros do painel (escopo §20: faturamento, pedidos, ticket medio, produtos vendidos).
 *
 * Faturamento conta apenas os status de venda de `REVENUE_STATUSES`: pedido aguardando
 * pagamento ainda nao e dinheiro, e cancelado/reembolsado/devolvido deixou de ser.
 */
export async function orderStats(storeId: string): Promise<OrderStats> {
  const prisma = getPrisma();

  const [revenue, byStatus, itemsSold, openOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId, status: { in: [...REVENUE_STATUSES] } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.groupBy({ by: ['status'], where: { storeId }, _count: { _all: true } }),
    prisma.orderItem.aggregate({
      where: { storeId, order: { status: { in: [...REVENUE_STATUSES] } } },
      _sum: { quantity: true },
    }),
    prisma.order.count({ where: { storeId, status: { in: ['PENDING_PAYMENT', 'PAID', 'PREPARING'] } } }),
  ]);

  const revenueValue = toNumber(revenue._sum.total);
  const paidOrders = revenue._count._all;

  return {
    revenue: revenueValue,
    paidOrders,
    averageTicket: paidOrders > 0 ? revenueValue / paidOrders : 0,
    itemsSold: itemsSold._sum.quantity ?? 0,
    openOrders,
    byStatus: byStatus.map((row) => ({ status: row.status, count: row._count._all })),
  };
}

/** Pedidos recentes do cliente, usado no painel de clientes (§16, §20). */
export async function listCustomerOrders(
  storeId: string,
  customerId: string,
  take = 10,
): Promise<OrderListRow[]> {
  return listOrders({ storeId, customerId, page: 1, pageSize: take });
}
