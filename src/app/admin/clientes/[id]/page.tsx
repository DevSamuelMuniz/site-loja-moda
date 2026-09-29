import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { Field, inputClass, selectClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { DefinitionList, PageHeader, Panel, StatCard, StatusPill } from '@/components/admin/Panel';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { ButtonLink } from '@/components/ui/Button';
import { readFlash } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatDateTime, formatShortDate } from '@/lib/format';
import { getCustomer } from '@/lib/customers/queries';
import { ORDER_STATUS_LABELS } from '@/lib/orders/status';
import { listCustomerOrders } from '@/lib/orders/queries';
import { updateCustomerAction } from '../actions';

/**
 * Detalhe do cliente (escopo §16, §20: historico, pedidos).
 *
 * Uma tela, tres perguntas respondidas de uma vez: quem e (cadastro), quanto comprou (numeros
 * dos pedidos) e o que comprou (historico). O e-mail aparece como identidade, sem edicao — e a
 * chave que liga pedidos antigos a pessoa.
 */

export default async function AdminCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('customers');
  const { id } = await params;
  const query = await searchParams;

  const customer = await getCustomer({ storeId: user.storeId, id });
  if (!customer) notFound();

  const orders = await listCustomerOrders(user.storeId, customer.id, 10);

  const canUpdate = can(user.role, 'customers', 'update');
  const canCreateOrders = can(user.role, 'orders', 'create');
  const flash = { ok: readFlash(query.ok), erro: readFlash(query.erro) };

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title={customer.name}
        description={customer.email}
        action={
          <>
            <StatusPill
              label={customer.status === 'ACTIVE' ? 'Ativo' : 'Bloqueado'}
              tone={customer.status === 'ACTIVE' ? 'success' : 'danger'}
            />
            {canCreateOrders ? (
              <ButtonLink href={`/admin/pedidos/novo?cliente=${customer.id}`} size="sm">
                Registrar venda
              </ButtonLink>
            ) : null}
            <ButtonLink href="/admin/clientes" variant="outline" size="sm">
              Voltar
            </ButtonLink>
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total gasto" value={formatCurrency(customer.spent)} hint="pedidos de venda" />
        <StatCard label="Pedidos" value={customer.orders} hint="confirmados" />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(customer.orders > 0 ? customer.spent / customer.orders : 0)}
          hint="por pedido"
        />
        <StatCard
          label="Última compra"
          value={customer.lastOrderAt ? formatShortDate(customer.lastOrderAt) : '—'}
          hint={customer.hasAccount ? 'cliente com conta' : 'cliente sem conta'}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Cadastro">
          <DefinitionList
            items={[
              { label: 'Nome', value: customer.name },
              { label: 'E-mail', value: customer.email },
              { label: 'Telefone', value: customer.phone ?? 'não informado' },
              { label: 'CPF/CNPJ', value: customer.document ?? 'não informado' },
              { label: 'Cadastro em', value: formatDateTime(customer.createdAt) },
              { label: 'Conta na loja', value: customer.hasAccount ? 'sim' : 'não (compra sem conta)' },
            ]}
          />
        </Panel>

        <Panel title="Endereços" description="Cadastrados pelo cliente. O pedido guarda cópia do endereço usado.">
          {customer.addresses.length === 0 ? (
            <p className="type-body text-body-sm text-muted">Nenhum endereço cadastrado.</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {customer.addresses.map((address) => (
                <li key={address.id} className="py-3">
                  <p className="type-body text-body">
                    {address.recipient}
                    {address.isDefault ? <span className="text-accent"> · padrão</span> : null}
                  </p>
                  <p className="type-body text-body-sm text-muted">
                    {[
                      [address.line1, address.number].filter(Boolean).join(', '),
                      address.complement,
                      address.district,
                      `${address.city} · ${address.state}`,
                      address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(' — ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {canUpdate ? (
        <Panel title="Corrigir cadastro" description="O e-mail é a identidade do cliente e não muda por aqui.">
          <AdminForm action={updateCustomerAction} submitLabel="Salvar cadastro">
            <input type="hidden" name="id" value={customer.id} />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" htmlFor="name">
                <input id="name" name="name" defaultValue={customer.name} required className={inputClass} />
              </Field>
              <Field label="Telefone" htmlFor="phone">
                <input id="phone" name="phone" defaultValue={customer.phone ?? ''} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="CPF/CNPJ" htmlFor="document">
                <input id="document" name="document" defaultValue={customer.document ?? ''} className={inputClass} />
              </Field>
              <Field
                label="Situação"
                htmlFor="status"
                hint="Bloquear impede novas compras; o histórico permanece."
              >
                <select id="status" name="status" defaultValue={customer.status} className={selectClass}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </Field>
            </div>
          </AdminForm>
        </Panel>
      ) : null}

      <Panel
        title="Pedidos do cliente"
        description="Últimos 10 pedidos. A lista completa fica no módulo Pedidos."
        action={
          <Link
            href={`/admin/pedidos?busca=${encodeURIComponent(customer.email)}`}
            className="type-body text-body-sm link-rule text-primary"
          >
            Ver todos
          </Link>
        }
      >
        <Table>
          <THead>
            <TH>Pedido</TH>
            <TH>Status</TH>
            <TH className="text-right">Itens</TH>
            <TH className="text-right">Total</TH>
            <TH>Quando</TH>
          </THead>
          <TBody>
            {orders.length === 0 ? (
              <TableEmpty colSpan={5} message="Este cliente ainda não tem pedido." />
            ) : (
              orders.map((order) => (
                <TR key={order.id}>
                  <TD>
                    <Link href={`/admin/pedidos/${order.id}`} className="link-rule text-primary">
                      {order.number}
                    </Link>
                  </TD>
                  <TD className="text-muted">{ORDER_STATUS_LABELS[order.status]}</TD>
                  <TD className="text-right tabular-nums">{order.itemCount}</TD>
                  <TD className="text-right tabular-nums">{formatCurrency(order.total)}</TD>
                  <TD className="text-muted">{formatDateTime(order.placedAt)}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </Panel>
    </div>
  );
}
