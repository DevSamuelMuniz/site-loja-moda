import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { Field, inputClass, selectClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { DefinitionList, PageHeader, Panel, StatusPill } from '@/components/admin/Panel';
import { ConfirmButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR } from '@/components/admin/Table';
import { ButtonLink } from '@/components/ui/Button';
import { readFlash } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS, nextStatuses } from '@/lib/orders/status';
import { getOrder } from '@/lib/orders/queries';
import { cancelOrderAction, changeOrderStatusAction } from '../actions';

/**
 * Detalhe do pedido (escopo §13, §20).
 *
 * Mostra o que foi vendido **como foi vendido**: os precos e nomes vem das linhas do pedido,
 * nao do catalogo — o catalogo pode ter mudado depois da venda.
 *
 * A mudanca de status so oferece as transicoes validas de `status.ts`, e cada uma tem efeito
 * conhecido no estoque (baixa, devolucao ou nada). O historico registra quem mudou e por que.
 */

interface AddressSnapshotView {
  recipient?: string;
  postalCode?: string;
  line1?: string;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string;
  state?: string;
}

function formatAddress(address: unknown): string | null {
  if (!address || typeof address !== 'object') return null;

  const value = address as AddressSnapshotView;
  if (!value.line1 && !value.city) return null;

  const line = [value.line1, value.number, value.complement].filter(Boolean).join(', ');
  const region = [value.district, value.city, value.state].filter(Boolean).join(' · ');

  return [value.recipient, line, region, value.postalCode].filter(Boolean).join(' — ');
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('orders');
  const { id } = await params;
  const query = await searchParams;

  const order = await getOrder({ storeId: user.storeId, id });
  if (!order) notFound();

  const canUpdate = can(user.role, 'orders', 'update');
  const transitions = nextStatuses(order.status);
  const address = formatAddress(order.shippingAddress);
  const flash = { ok: readFlash(query.ok), erro: readFlash(query.erro) };

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title={`Pedido ${order.number}`}
        description={`${ORDER_CHANNEL_LABELS[order.channel]} · ${formatDateTime(order.placedAt)}`}
        action={
          <>
            <StatusPill
              label={ORDER_STATUS_LABELS[order.status]}
              tone={
                order.status === 'CANCELLED' || order.status === 'REFUNDED' || order.status === 'RETURNED'
                  ? 'danger'
                  : order.status === 'PENDING_PAYMENT'
                    ? 'warning'
                    : 'success'
              }
            />
            <ButtonLink href="/admin/pedidos" variant="outline" size="sm">
              Voltar
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Cliente">
          <DefinitionList
            items={[
              {
                label: 'Nome',
                value: (
                  <Link href={`/admin/clientes/${order.customerId}`} className="link-rule text-primary">
                    {order.customerName}
                  </Link>
                ),
              },
              { label: 'E-mail', value: order.email },
              { label: 'Telefone', value: order.phone ?? 'não informado' },
              { label: 'CPF/CNPJ', value: order.document ?? 'não informado' },
            ]}
          />
        </Panel>

        <Panel title="Entrega e pagamento">
          <DefinitionList
            items={[
              { label: 'Entrega', value: order.shippingLabel ?? 'a definir' },
              { label: 'Endereço', value: address ?? 'não informado' },
              { label: 'Forma de pagamento', value: order.paymentMethod ?? 'a definir' },
              {
                label: 'Estoque',
                value: order.stockDeducted ? 'baixado por este pedido' : 'não baixado',
              },
            ]}
          />
        </Panel>
      </div>

      <Panel title="Itens" description="Preços e nomes como estavam no momento da venda.">
        <Table>
          <THead>
            <TH>Produto</TH>
            <TH>Variação</TH>
            <TH>SKU</TH>
            <TH className="text-right">Qtd</TH>
            <TH className="text-right">Unitário</TH>
            <TH className="text-right">Total</TH>
          </THead>
          <TBody>
            {order.items.map((item) => (
              <TR key={item.id}>
                <TD>
                  {item.productId ? (
                    <Link href={`/admin/produtos/${item.productId}`} className="link-rule text-primary">
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </TD>
                <TD className="text-muted">{[item.colorName, item.size].filter(Boolean).join(' · ') || '—'}</TD>
                <TD className="text-muted">{item.sku}</TD>
                <TD className="text-right tabular-nums">{item.quantity}</TD>
                <TD className="text-right tabular-nums">{formatCurrency(item.unitPrice)}</TD>
                <TD className="text-right tabular-nums">{formatCurrency(item.lineTotal)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>

        <dl className="mt-6 flex max-w-sm flex-col gap-2 lg:ml-auto">
          <div className="flex justify-between gap-6">
            <dt className="type-body text-body-sm text-muted">Subtotal</dt>
            <dd className="type-body text-body-sm tabular-nums">{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="type-body text-body-sm text-muted">Desconto</dt>
            <dd className="type-body text-body-sm tabular-nums">- {formatCurrency(order.discountAmount)}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="type-body text-body-sm text-muted">Frete</dt>
            <dd className="type-body text-body-sm tabular-nums">{formatCurrency(order.shippingAmount)}</dd>
          </div>
          <div className="border-border flex justify-between gap-6 border-t pt-2">
            <dt className="type-heading text-heading-md">Total</dt>
            <dd className="type-heading text-heading-md tabular-nums">{formatCurrency(order.total)}</dd>
          </div>
        </dl>

        {order.notes ? (
          <p className="type-body text-body-sm text-muted mt-6 max-w-[var(--measure-prose)]">{order.notes}</p>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {canUpdate && transitions.length > 0 ? (
          <Panel
            title="Alterar status"
            description="Cada transição tem efeito no estoque: venda baixa, cancelamento e devolução devolvem o saldo."
          >
            <AdminForm action={changeOrderStatusAction} submitLabel="Confirmar mudança" className="flex flex-col gap-4">
              <input type="hidden" name="orderId" value={order.id} />

              <Field label="Novo status" htmlFor="to">
                <select id="to" name="to" defaultValue={transitions[0]} className={selectClass}>
                  {transitions.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Observação" htmlFor="note" hint="Fica no histórico do pedido.">
                <input id="note" name="note" className={inputClass} />
              </Field>
            </AdminForm>

            {transitions.includes('CANCELLED') ? (
              <form action={cancelOrderAction} className="mt-6">
                <input type="hidden" name="orderId" value={order.id} />
                <ConfirmButton
                  variant="outline"
                  size="sm"
                  message="Cancelar este pedido? O estoque baixado por ele volta para as variações."
                >
                  Cancelar pedido
                </ConfirmButton>
              </form>
            ) : null}
          </Panel>
        ) : null}

        <Panel title="Histórico" description="Nenhuma mudança de status acontece sem linha aqui.">
          <Table>
            <THead>
              <TH>De</TH>
              <TH>Para</TH>
              <TH>Por</TH>
              <TH>Quando</TH>
            </THead>
            <TBody>
              {order.events.map((event) => (
                <TR key={event.id}>
                  <TD className="text-muted">{event.from ? ORDER_STATUS_LABELS[event.from] : '—'}</TD>
                  <TD>{ORDER_STATUS_LABELS[event.to]}</TD>
                  <TD className="text-muted">
                    {event.userName ?? 'sistema'}
                    {event.note ? <span className="block text-[0.75rem]">{event.note}</span> : null}
                  </TD>
                  <TD className="text-muted">{formatDateTime(event.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
