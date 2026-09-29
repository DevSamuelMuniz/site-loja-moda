import Link from 'next/link';
import { Field, inputClass, selectClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { PageHeader, StatusPill } from '@/components/admin/Panel';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { Pagination } from '@/components/filters/Pagination';
import { Button, ButtonLink } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE, pageCount, readEnum, readFlash, readPage, readText, toQuery } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS } from '@/lib/orders/status';
import { countOrders, listOrders, orderStats } from '@/lib/orders/queries';
import type { OrderStatus } from '@/generated/prisma/enums';

/**
 * Pedidos (escopo §13, §20: listagem, filtros, detalhes, status, cancelamento, historico).
 *
 * Na FASE 2 o pedido entra pelo registro de venda — balcao, WhatsApp, telefone —, que e como
 * a loja vende hoje. O checkout online (FASE 3) grava no mesmo lugar, marcado como `ONLINE`.
 */

const STATUS_TONES: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'success',
  PREPARING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
  RETURNED: 'danger',
};

const STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'RETURNED',
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('orders');
  const params = await searchParams;

  const { page, pageSize } = readPage(params.pagina, DEFAULT_PAGE_SIZE);
  const search = readText(params.busca);
  const status = readEnum(params.status, STATUSES);

  const filter = { storeId: user.storeId, search, status };

  const [rows, total, stats] = await Promise.all([
    listOrders({ ...filter, page, pageSize }),
    countOrders(filter),
    orderStats(user.storeId),
  ]);

  const canCreate = can(user.role, 'orders', 'create');
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  return (
    <div className="flex flex-col gap-8">
      <FlashNotice {...flash} />

      <PageHeader
        title="Pedidos"
        description={`${total} pedido(s) no filtro atual. Faturamento reconhecido: ${formatCurrency(stats.revenue)}.`}
        action={
          canCreate ? (
            <ButtonLink href="/admin/pedidos/novo" size="sm">
              Registrar venda
            </ButtonLink>
          ) : null
        }
      />

      <form method="get" className="grid gap-4 sm:grid-cols-3">
        <Field label="Buscar" htmlFor="busca">
          <input id="busca" name="busca" defaultValue={search ?? ''} placeholder="Número, cliente ou e-mail" className={inputClass} />
        </Field>

        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={status ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {STATUSES.map((entry) => (
              <option key={entry} value={entry}>
                {ORDER_STATUS_LABELS[entry]}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end gap-3">
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
          <Link href="/admin/pedidos" className="type-body text-body-sm link-rule text-primary">
            Limpar
          </Link>
        </div>
      </form>

      <Table>
        <THead>
          <TH>Pedido</TH>
          <TH>Cliente</TH>
          <TH>Status</TH>
          <TH>Origem</TH>
          <TH className="text-right">Itens</TH>
          <TH className="text-right">Total</TH>
          <TH>Quando</TH>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TableEmpty
              colSpan={7}
              message="Nenhum pedido encontrado. Registre uma venda para começar o histórico."
            />
          ) : (
            rows.map((row) => (
              <TR key={row.id}>
                <TD>
                  <Link href={`/admin/pedidos/${row.id}`} className="link-rule text-primary">
                    {row.number}
                  </Link>
                </TD>
                <TD>
                  {row.customerName}
                  <span className="text-muted block text-[0.75rem]">{row.email}</span>
                </TD>
                <TD>
                  <StatusPill label={ORDER_STATUS_LABELS[row.status]} tone={STATUS_TONES[row.status]} />
                </TD>
                <TD className="text-muted">{ORDER_CHANNEL_LABELS[row.channel]}</TD>
                <TD className="text-right tabular-nums">{row.itemCount}</TD>
                <TD className="text-right tabular-nums">{formatCurrency(row.total)}</TD>
                <TD className="text-muted">{formatDateTime(row.placedAt)}</TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        pageCount={pageCount(total, pageSize)}
        hrefFor={(target) => `/admin/pedidos${toQuery({ busca: search, status, pagina: target })}`}
      />
    </div>
  );
}
