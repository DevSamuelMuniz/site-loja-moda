import { getPrisma } from '@/lib/db';
import { toNumber } from '@/lib/money';
import { REVENUE_STATUSES } from '@/lib/orders/status';
import type { CustomerStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Leitura de clientes para o painel (escopo §16, §20: historico, pedidos, segmentacao).
 *
 * "Total gasto" e "ultima compra" **nao** sao colunas: sao soma e maior data dos pedidos que
 * contam como venda. Guardar isso em campo seria criar uma segunda verdade que envelhece a
 * cada cancelamento.
 */

export interface CustomerListRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: CustomerStatus;
  createdAt: Date;
  orders: number;
  spent: number;
  lastOrderAt: Date | null;
  hasAccount: boolean;
}

export type CustomerSegment = 'all' | 'with-orders' | 'without-orders';

export interface CustomerFilter {
  storeId: string;
  search?: string;
  segment?: CustomerSegment;
  page?: number;
  pageSize?: number;
}

function customerWhere({ storeId, search, segment }: CustomerFilter): Prisma.CustomerWhereInput {
  const term = search?.trim();

  return {
    storeId,
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(segment === 'with-orders' ? { orders: { some: {} } } : {}),
    ...(segment === 'without-orders' ? { orders: { none: {} } } : {}),
  };
}

interface Aggregates {
  orders: number;
  spent: number;
  lastOrderAt: Date | null;
}

/** Soma e contagem por cliente em uma consulta so, para a lista nao fazer N+1. */
async function aggregatesFor(storeId: string, customerIds: string[]): Promise<Map<string, Aggregates>> {
  if (customerIds.length === 0) return new Map();

  const rows = await getPrisma().order.groupBy({
    by: ['customerId'],
    where: { storeId, customerId: { in: customerIds }, status: { in: [...REVENUE_STATUSES] } },
    _count: { _all: true },
    _sum: { total: true },
    _max: { placedAt: true },
  });

  return new Map(
    rows.map((row) => [
      row.customerId,
      {
        orders: row._count._all,
        spent: toNumber(row._sum.total),
        lastOrderAt: row._max.placedAt ?? null,
      },
    ]),
  );
}

export async function listCustomers(filter: CustomerFilter): Promise<CustomerListRow[]> {
  const { storeId, page = 1, pageSize = 20 } = filter;

  const rows = await getPrisma().customer.findMany({
    where: customerWhere(filter),
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      userId: true,
    },
  });

  const aggregates = await aggregatesFor(
    storeId,
    rows.map((row) => row.id),
  );

  return rows.map((row) => {
    const stats = aggregates.get(row.id);
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      createdAt: row.createdAt,
      orders: stats?.orders ?? 0,
      spent: stats?.spent ?? 0,
      lastOrderAt: stats?.lastOrderAt ?? null,
      hasAccount: row.userId !== null,
    };
  });
}

export async function countCustomers(filter: CustomerFilter): Promise<number> {
  return getPrisma().customer.count({ where: customerWhere(filter) });
}

export interface CustomerAddressRow {
  id: string;
  label: string | null;
  recipient: string;
  postalCode: string;
  line1: string;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface CustomerDetail extends CustomerListRow {
  document: string | null;
  addresses: CustomerAddressRow[];
}

export async function getCustomer(input: {
  storeId: string;
  id: string;
}): Promise<CustomerDetail | null> {
  const row = await getPrisma().customer.findFirst({
    where: { id: input.id, storeId: input.storeId },
    include: { addresses: { where: { deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] } },
  });

  if (!row) return null;

  const aggregates = await aggregatesFor(input.storeId, [row.id]);
  const stats = aggregates.get(row.id);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    document: row.document,
    status: row.status,
    createdAt: row.createdAt,
    orders: stats?.orders ?? 0,
    spent: stats?.spent ?? 0,
    lastOrderAt: stats?.lastOrderAt ?? null,
    hasAccount: row.userId !== null,
    addresses: row.addresses.map((address) => ({
      id: address.id,
      label: address.label,
      recipient: address.recipient,
      postalCode: address.postalCode,
      line1: address.line1,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    })),
  };
}

export interface CustomerSummary {
  total: number;
  withOrders: number;
  withoutOrders: number;
  newThisMonth: number;
}

export async function customerSummary(storeId: string): Promise<CustomerSummary> {
  const prisma = getPrisma();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [total, withOrders, newThisMonth] = await Promise.all([
    prisma.customer.count({ where: { storeId } }),
    prisma.customer.count({ where: { storeId, orders: { some: {} } } }),
    prisma.customer.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
  ]);

  return { total, withOrders, withoutOrders: total - withOrders, newThisMonth };
}
