import Link from 'next/link';
import { PageHeader, Panel, StatCard } from '@/components/admin/Panel';
import { Table, TBody, TD, TH, THead, TR } from '@/components/admin/Table';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { customerSummary } from '@/lib/customers/queries';
import { inventorySummary, listStock } from '@/lib/inventory/queries';
import { formatCurrency } from '@/lib/format';
import { ORDER_STATUS_LABELS } from '@/lib/orders/status';
import { orderStats } from '@/lib/orders/queries';
import { productSummary } from '@/lib/products/queries';

/**
 * Visao geral do painel (escopo §20: faturamento, pedidos, ticket medio, produtos vendidos,
 * clientes, estoque baixo).
 *
 * Todo numero vem do banco e do escopo da loja do usuario (§22) — nenhum valor decorativo.
 * Faturamento soma apenas os status que contam como venda (`REVENUE_STATUSES`): pedido
 * aguardando pagamento ainda nao e dinheiro.
 *
 * Grafico e recorte por periodo sao da FASE 4 (relatorios, §26); aqui os numeros sao do
 * total, sem recorte de data.
 */

export default async function AdminPage() {
  const user = await requirePermission('dashboard');
  const storeId = user.storeId;

  const [orders, products, inventory, customers, lowStock] = await Promise.all([
    orderStats(storeId),
    productSummary(storeId),
    inventorySummary(storeId),
    customerSummary(storeId),
    listStock({ storeId, level: 'low', page: 1, pageSize: 6 }),
  ]);

  const canSee = {
    orders: can(user.role, 'orders', 'view'),
    products: can(user.role, 'products', 'view'),
    inventory: can(user.role, 'inventory', 'view'),
    customers: can(user.role, 'customers', 'view'),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Visão geral"
        description="Faturamento, pedidos, catálogo e estoque da loja. Os números contam apenas o que está no banco."
      />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Faturamento" value={formatCurrency(orders.revenue)} hint={`${orders.paidOrders} pedido(s) pagos`} />
        <StatCard label="Ticket médio" value={formatCurrency(orders.averageTicket)} hint="por pedido pago" />
        <StatCard label="Peças vendidas" value={orders.itemsSold} hint="itens dos pedidos pagos" />
        <StatCard label="Pedidos em aberto" value={orders.openOrders} hint="aguardando, pago ou em preparação" />
        <StatCard label="Produtos publicados" value={products.active} hint={`${products.total} no total`} />
        <StatCard label="Variações" value={products.variants} hint="cor × tamanho" />
        <StatCard label="Peças em estoque" value={inventory.units} hint={`${inventory.variants} variações`} />
        <StatCard
          label="Estoque baixo"
          value={inventory.lowStock}
          hint={`${inventory.outOfStock} variação(ões) zerada(s)`}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Pedidos por status"
          description="O que já é venda e o que ainda não é."
          action={
            canSee.orders ? (
              <Link href="/admin/pedidos" className="type-body text-body-sm link-rule text-primary">
                Ver pedidos
              </Link>
            ) : null
          }
        >
          <Table>
            <THead>
              <TH>Status</TH>
              <TH className="text-right">Pedidos</TH>
            </THead>
            <TBody>
              {orders.byStatus.length === 0 ? (
                <TR>
                  <TD className="text-muted" >
                    Nenhum pedido registrado. Registre uma venda para começar o histórico.
                  </TD>
                  <TD className="text-right tabular-nums">0</TD>
                </TR>
              ) : (
                orders.byStatus.map((row) => (
                  <TR key={row.status}>
                    <TD>{ORDER_STATUS_LABELS[row.status]}</TD>
                    <TD className="text-right tabular-nums">{row.count}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Panel>

        <Panel
          title="Estoque baixo"
          description="Variações no corte configurado para a loja."
          action={
            canSee.inventory ? (
              <Link href="/admin/estoque?nivel=low" className="type-body text-body-sm link-rule text-primary">
                Ver estoque
              </Link>
            ) : null
          }
        >
          <Table>
            <THead>
              <TH>Produto</TH>
              <TH>Variação</TH>
              <TH className="text-right">Saldo</TH>
            </THead>
            <TBody>
              {lowStock.length === 0 ? (
                <TR>
                  <TD className="text-muted">Nenhuma variação no corte de estoque baixo.</TD>
                  <TD />
                  <TD />
                </TR>
              ) : (
                lowStock.map((row) => (
                  <TR key={row.variantId}>
                    <TD>{row.productName}</TD>
                    <TD className="text-muted">
                      {[row.colorName, row.size].filter(Boolean).join(' · ')}
                    </TD>
                    <TD className="text-right tabular-nums">{row.quantity}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Panel>
      </div>

      <Panel title="Clientes e catálogo">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Clientes" value={customers.total} hint={`${customers.newThisMonth} neste mês`} />
          <StatCard label="Já compraram" value={customers.withOrders} hint={`${customers.withoutOrders} sem pedido`} />
          <StatCard
            label="Produtos rascunho"
            value={products.draft}
            hint={`${products.archived} arquivado(s)`}
          />
          <StatCard label="Itens no catálogo" value={products.total} hint="inclui rascunho" />
        </dl>
      </Panel>

      <p className="type-body text-body-sm text-muted max-w-[var(--measure-prose)]">
        Checkout e pagamento online (FASE 3) e relatórios com período e gráficos (FASE 4) ainda não
        existem. Enquanto isso, os pedidos entram por registro de venda no painel — balcão,
        WhatsApp ou telefone — e movimentam o estoque de verdade.
      </p>
    </div>
  );
}
