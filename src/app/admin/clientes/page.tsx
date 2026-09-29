import Link from 'next/link';
import { FlashNotice } from '@/components/admin/Notice';
import { PageHeader, StatCard } from '@/components/admin/Panel';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { Field, inputClass, selectClass } from '@/components/admin/Field';
import { Pagination } from '@/components/filters/Pagination';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE, pageCount, readEnum, readFlash, readPage, readText, toQuery } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { countCustomers, customerSummary, listCustomers } from '@/lib/customers/queries';

/**
 * Clientes (escopo §16, §20: cadastro, historico, pedidos, segmentacao).
 *
 * O cliente nasce do pedido: quem compra entra no cadastro com ou sem conta (§12). "Total
 * gasto" e "ultima compra" sao calculados a partir dos pedidos que contam como venda — nao ha
 * campo guardado que possa envelhecer sozinho.
 *
 * Segmentacao da FASE 2: com pedido e sem pedido. Cluster por valor, recompra e inatividade
 * sao relatorio (FASE 4, §26).
 */

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('customers');
  const params = await searchParams;

  const { page, pageSize } = readPage(params.pagina, DEFAULT_PAGE_SIZE);
  const search = readText(params.busca);
  const segment = readEnum(params.segmento, ['with-orders', 'without-orders'] as const);

  const filter = { storeId: user.storeId, search, segment };

  const [rows, total, summary] = await Promise.all([
    listCustomers({ ...filter, page, pageSize }),
    countCustomers(filter),
    customerSummary(user.storeId),
  ]);

  const canCreateOrders = can(user.role, 'orders', 'create');
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  return (
    <div className="flex flex-col gap-8">
      <FlashNotice {...flash} />

      <PageHeader
        title="Clientes"
        description={`${total} cliente(s) no filtro atual.`}
      />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clientes" value={summary.total} hint="cadastro da loja" />
        <StatCard label="Já compraram" value={summary.withOrders} hint="têm pedido de venda" />
        <StatCard label="Sem pedido" value={summary.withoutOrders} hint="cadastro sem compra" />
        <StatCard label="Novos no mês" value={summary.newThisMonth} hint="cadastro desde o dia 1" />
      </dl>

      <form method="get" className="grid gap-4 sm:grid-cols-3">
        <Field label="Buscar" htmlFor="busca">
          <input id="busca" name="busca" defaultValue={search ?? ''} placeholder="Nome, e-mail ou telefone" className={inputClass} />
        </Field>

        <Field label="Segmento" htmlFor="segmento">
          <select id="segmento" name="segmento" defaultValue={segment ?? ''} className={selectClass}>
            <option value="">Todos</option>
            <option value="with-orders">Já compraram</option>
            <option value="without-orders">Sem pedido</option>
          </select>
        </Field>

        <div className="flex items-end gap-3">
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
          <Link href="/admin/clientes" className="type-body text-body-sm link-rule text-primary">
            Limpar
          </Link>
        </div>
      </form>

      <Table>
        <THead>
          <TH>Cliente</TH>
          <TH>Contato</TH>
          <TH>Cadastro</TH>
          <TH className="text-right">Pedidos</TH>
          <TH className="text-right">Total gasto</TH>
          <TH>Última compra</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TableEmpty
              colSpan={7}
              message="Nenhum cliente encontrado. Clientes entram no cadastro ao registrar uma venda."
            />
          ) : (
            rows.map((row) => (
              <TR key={row.id}>
                <TD>
                  <Link href={`/admin/clientes/${row.id}`} className="link-rule text-primary">
                    {row.name}
                  </Link>
                  {row.hasAccount ? (
                    <span className="text-muted block text-[0.75rem]">tem conta na loja</span>
                  ) : null}
                  {row.status === 'BLOCKED' ? (
                    <span className="text-danger block text-[0.75rem]">bloqueado</span>
                  ) : null}
                </TD>
                <TD className="text-muted">
                  {row.email}
                  {row.phone ? <span className="block text-[0.75rem]">{row.phone}</span> : null}
                </TD>
                <TD className="text-muted">{formatShortDate(row.createdAt)}</TD>
                <TD className="text-right tabular-nums">{row.orders}</TD>
                <TD className="text-right tabular-nums">{formatCurrency(row.spent)}</TD>
                <TD className="text-muted">{row.lastOrderAt ? formatShortDate(row.lastOrderAt) : '—'}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/clientes/${row.id}`}
                      className="type-body text-body-sm link-rule text-primary"
                    >
                      Ver
                    </Link>
                    {canCreateOrders ? (
                      <Link
                        href={`/admin/pedidos/novo?cliente=${row.id}`}
                        className="type-body text-body-sm link-rule text-primary"
                      >
                        Registrar venda
                      </Link>
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        pageCount={pageCount(total, pageSize)}
        hrefFor={(target) => `/admin/clientes${toQuery({ busca: search, segmento: segment, pagina: target })}`}
      />
    </div>
  );
}
