import { ecommerceConfig } from '@/config/ecommerce';
import { getPrisma } from '@/lib/db';
import type { InventoryMovementType } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

/**
 * Leitura de estoque para o painel (escopo §20: saldo, movimentacoes, ajustes, alertas).
 *
 * Separado de `./service`: aqui e so consulta, e consulta nao muda saldo. O corte de
 * "estoque baixo" vem de `src/config/ecommerce.ts`, o mesmo que a loja usa para mostrar
 * "ultimas unidades" — dois cortes diferentes dariam duas verdades.
 */

export const LOW_STOCK_THRESHOLD = ecommerceConfig.cart.lowStockThreshold;

export interface StockRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  colorName: string | null;
  size: string;
  quantity: number;
  allowBackorder: boolean;
  /** Saldo igual ou abaixo do corte configurado. */
  lowStock: boolean;
}

export interface StockFilter {
  storeId: string;
  search?: string;
  /** `low` = no corte ou abaixo; `out` = zerado. */
  level?: 'all' | 'low' | 'out';
  page?: number;
  pageSize?: number;
}

/** Saldo zerado ou sem linha de estoque contam igual: nao ha peca para vender. */
const ZERO_OR_MISSING: Prisma.ProductVariantWhereInput = {
  OR: [{ inventory: { quantity: { lte: 0 } } }, { inventory: { is: null } }],
};

/**
 * Filtros combinam com `AND`.
 *
 * Busca e nivel de estoque usam `OR` cada um; somar os dois no mesmo objeto faria o segundo
 * sobrescrever o primeiro, e a tela mostraria estoque baixo **ignorando** a busca digitada.
 */
function stockWhere({ storeId, search, level }: StockFilter): Prisma.ProductVariantWhereInput {
  const term = search?.trim();
  const and: Prisma.ProductVariantWhereInput[] = [];

  if (term) {
    and.push({
      OR: [
        { sku: { contains: term, mode: 'insensitive' } },
        { size: { contains: term, mode: 'insensitive' } },
        { product: { name: { contains: term, mode: 'insensitive' } } },
        { color: { name: { contains: term, mode: 'insensitive' } } },
      ],
    });
  }

  if (level === 'out') and.push(ZERO_OR_MISSING);
  if (level === 'low') {
    and.push({
      OR: [
        { inventory: { quantity: { lte: LOW_STOCK_THRESHOLD } } },
        { inventory: { is: null } },
      ],
    });
  }

  return {
    storeId,
    deletedAt: null,
    /* Produto arquivado sai da operacao; rascunho ainda tem estoque para gerenciar. */
    product: { deletedAt: null, status: { not: 'ARCHIVED' } },
    ...(and.length > 0 ? { AND: and } : {}),
  };
}

export async function listStock(filter: StockFilter): Promise<StockRow[]> {
  const { page = 1, pageSize = 20 } = filter;

  const rows = await getPrisma().productVariant.findMany({
    where: stockWhere(filter),
    orderBy: [{ product: { name: 'asc' } }, { position: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      productId: true,
      sku: true,
      size: true,
      product: { select: { name: true, slug: true } },
      color: { select: { name: true } },
      inventory: { select: { quantity: true, allowBackorder: true } },
    },
  });

  return rows.map((row) => {
    const quantity = row.inventory?.quantity ?? 0;
    return {
      variantId: row.id,
      productId: row.productId,
      productName: row.product.name,
      productSlug: row.product.slug,
      sku: row.sku,
      colorName: row.color?.name ?? null,
      size: row.size,
      quantity,
      allowBackorder: row.inventory?.allowBackorder ?? false,
      lowStock: quantity <= LOW_STOCK_THRESHOLD,
    };
  });
}

export async function countStock(filter: StockFilter): Promise<number> {
  return getPrisma().productVariant.count({ where: stockWhere(filter) });
}

export interface InventorySummary {
  variants: number;
  units: number;
  outOfStock: number;
  lowStock: number;
}

export async function inventorySummary(storeId: string): Promise<InventorySummary> {
  const prisma = getPrisma();

  const [variants, units, outOfStock, lowStock] = await Promise.all([
    prisma.productVariant.count({ where: { storeId, deletedAt: null } }),
    prisma.inventory.aggregate({ where: { storeId }, _sum: { quantity: true } }),
    prisma.productVariant.count({
      where: { storeId, deletedAt: null, OR: [{ inventory: { quantity: { lte: 0 } } }, { inventory: { is: null } }] },
    }),
    prisma.productVariant.count({
      where: {
        storeId,
        deletedAt: null,
        OR: [
          { inventory: { quantity: { lte: LOW_STOCK_THRESHOLD } } },
          { inventory: { is: null } },
        ],
      },
    }),
  ]);

  return { variants, units: units._sum.quantity ?? 0, outOfStock, lowStock };
}

export interface MovementRow {
  id: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  createdAt: Date;
  sku: string;
  size: string;
  productName: string;
  userName: string | null;
  orderNumber: string | null;
}

export interface MovementFilter {
  storeId: string;
  variantId?: string;
  type?: InventoryMovementType;
  page?: number;
  pageSize?: number;
}

export async function listMovements(filter: MovementFilter): Promise<MovementRow[]> {
  const { storeId, variantId, type, page = 1, pageSize = 30 } = filter;

  const rows = await getPrisma().inventoryMovement.findMany({
    where: { storeId, ...(variantId ? { variantId } : {}), ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      type: true,
      quantity: true,
      reason: true,
      createdAt: true,
      variant: { select: { sku: true, size: true, product: { select: { name: true } } } },
      user: { select: { name: true } },
      order: { select: { number: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    quantity: row.quantity,
    reason: row.reason,
    createdAt: row.createdAt,
    sku: row.variant.sku,
    size: row.variant.size,
    productName: row.variant.product.name,
    userName: row.user?.name ?? null,
    orderNumber: row.order?.number ?? null,
  }));
}

export async function countMovements(filter: MovementFilter): Promise<number> {
  return getPrisma().inventoryMovement.count({
    where: {
      storeId: filter.storeId,
      ...(filter.variantId ? { variantId: filter.variantId } : {}),
      ...(filter.type ? { type: filter.type } : {}),
    },
  });
}

export interface VariantOption {
  variantId: string;
  label: string;
  quantity: number;
}

/** Variacoes para o seletor do ajuste manual: busca por SKU ou nome do produto. */
export async function listVariantOptions(storeId: string, search?: string, take = 30): Promise<VariantOption[]> {
  const term = search?.trim();

  const rows = await getPrisma().productVariant.findMany({
    where: {
      storeId,
      deletedAt: null,
      product: { deletedAt: null },
      ...(term
        ? {
            OR: [
              { sku: { contains: term, mode: 'insensitive' } },
              { product: { name: { contains: term, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    orderBy: [{ product: { name: 'asc' } }, { position: 'asc' }],
    take,
    select: {
      id: true,
      sku: true,
      size: true,
      product: { select: { name: true } },
      color: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });

  return rows.map((row) => ({
    variantId: row.id,
    label: [row.product.name, row.color?.name, row.size, `· ${row.sku}`].filter(Boolean).join(' · '),
    quantity: row.inventory?.quantity ?? 0,
  }));
}
