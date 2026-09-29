import { AdminForm } from '@/components/admin/AdminForm';
import { Field, inputClass, selectClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { PageHeader, Panel, StatCard } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { Pagination } from '@/components/filters/Pagination';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE, pageCount, readEnum, readFlash, readPage, readText, toQuery } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatDateTime } from '@/lib/format';
import { LOW_STOCK_THRESHOLD, countMovements, countStock, inventorySummary, listMovements, listStock, listVariantOptions } from '@/lib/inventory/queries';
import { MOVEMENT_LABELS } from '@/lib/inventory/service';
import { recordMovementAction, setBackorderAction, setStockAction } from './actions';
import type { InventoryMovementType } from '@/generated/prisma/enums';

/**
 * Estoque (escopo §8, §20: saldo, movimentacoes, ajustes, alertas).
 *
 * Leitura e escrita ficam na mesma tela de proposito: quem conta a prateleira quer corrigir
 * ali, vendo o historico. Todo saldo que muda aqui vira linha em `inventory_movements` — a
 * tabela de movimentacoes e a prova de que o saldo nao foi alterado por fora.
 */

const TYPES: InventoryMovementType[] = ['PURCHASE', 'SALE', 'CANCELLATION', 'EXCHANGE', 'ADJUSTMENT', 'RETURN'];

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('inventory');
  const params = await searchParams;

  const { page, pageSize } = readPage(params.pagina, DEFAULT_PAGE_SIZE);
  const { page: movementPage } = readPage(params.movpagina, DEFAULT_PAGE_SIZE);
  const search = readText(params.busca);
  const level = readEnum(params.nivel, ['all', 'low', 'out'] as const);
  const type = readEnum(params.tipo, TYPES);

  const filter = { storeId: user.storeId, search, level };

  const [rows, total, summary, movements, movementTotal, options] = await Promise.all([
    listStock({ ...filter, page, pageSize }),
    countStock(filter),
    inventorySummary(user.storeId),
    listMovements({ storeId: user.storeId, type, page: movementPage, pageSize }),
    countMovements({ storeId: user.storeId, type }),
    listVariantOptions(user.storeId, search),
  ]);

  const canUpdate = can(user.role, 'inventory', 'update');
  const canCreate = can(user.role, 'inventory', 'create');
  const query = { busca: search, nivel: level, tipo: type };
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title="Estoque"
        description={`Saldo por variação (cor × tamanho). Estoque baixo é ${LOW_STOCK_THRESHOLD} peça(s) ou menos.`}
      />

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Peças em estoque" value={summary.units} hint={`${summary.variants} variações`} />
        <StatCard label="Estoque baixo" value={summary.lowStock} hint={`${LOW_STOCK_THRESHOLD} peças ou menos`} />
        <StatCard label="Zeradas" value={summary.outOfStock} hint="sem peça para vender" />
        <StatCard label="Movimentações" value={movementTotal} hint="histórico registrado" />
      </dl>

      <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Buscar" htmlFor="busca">
          <input id="busca" name="busca" defaultValue={search ?? ''} placeholder="Produto, SKU, cor ou tamanho" className={inputClass} />
        </Field>

        <Field label="Saldo" htmlFor="nivel">
          <select id="nivel" name="nivel" defaultValue={level ?? ''} className={selectClass}>
            <option value="">Todos</option>
            <option value="low">Baixo</option>
            <option value="out">Zerado</option>
          </select>
        </Field>

        <Field label="Tipo de movimentação" htmlFor="tipo">
          <select id="tipo" name="tipo" defaultValue={type ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {TYPES.map((entry) => (
              <option key={entry} value={entry}>
                {MOVEMENT_LABELS[entry]}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end gap-3">
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
        </div>
      </form>

      <Panel title="Saldo por variação" description={`${total} variação(ões) no filtro atual.`}>
        <Table>
          <THead>
            <TH>Produto</TH>
            <TH>Variação</TH>
            <TH>SKU</TH>
            <TH className="text-right">Saldo</TH>
            <TH>Pré-venda</TH>
            {canUpdate ? <TH className="text-right">Ações</TH> : null}
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={canUpdate ? 6 : 5} message="Nenhuma variação encontrada com estes filtros." />
            ) : (
              rows.map((row) => (
                <TR key={row.variantId}>
                  <TD>{row.productName}</TD>
                  <TD>
                    {[row.colorName, row.size].filter(Boolean).join(' · ')}
                    {row.lowStock ? (
                      <span className="text-danger block text-[0.75rem]">estoque baixo</span>
                    ) : null}
                  </TD>
                  <TD className="text-muted">{row.sku}</TD>
                  <TD className="text-right tabular-nums">{row.quantity}</TD>
                  <TD className="text-muted">{row.allowBackorder ? 'permitida' : 'não'}</TD>
                  {canUpdate ? (
                    <TD>
                      <form action={setBackorderAction} className="flex justify-end">
                        <input type="hidden" name="variantId" value={row.variantId} />
                        <input type="hidden" name="allow" value={row.allowBackorder ? 'false' : 'true'} />
                        <SubmitButton variant="link" size="sm" pendingLabel="Salvando…">
                          {row.allowBackorder ? 'Proibir pré-venda' : 'Permitir pré-venda'}
                        </SubmitButton>
                      </form>
                    </TD>
                  ) : null}
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <Pagination
          page={page}
          pageCount={pageCount(total, pageSize)}
          hrefFor={(target) => `/admin/estoque${toQuery({ ...query, pagina: target, movpagina: movementPage })}`}
          className="mt-6"
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {canUpdate ? (
          <Panel
            title="Ajustar saldo (contagem)"
            description="Informe o saldo contado na prateleira. A diferença é registrada como ajuste manual, com motivo."
          >
            <AdminForm action={setStockAction} submitLabel="Registrar ajuste" className="flex flex-col gap-4">
              <Field label="Variação" htmlFor="variantId">
                <select id="variantId" name="variantId" required className={selectClass} defaultValue="">
                  <option value="">Selecione…</option>
                  {options.map((option) => (
                    <option key={option.variantId} value={option.variantId}>
                      {option.label} — saldo {option.quantity}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Saldo contado" htmlFor="quantity">
                  <input id="quantity" name="quantity" inputMode="numeric" required className={inputClass} />
                </Field>
                <Field label="Motivo" htmlFor="reason" hint="Ex.: contagem mensal, avaria, furto.">
                  <input id="reason" name="reason" required className={inputClass} />
                </Field>
              </div>
            </AdminForm>
          </Panel>
        ) : null}

        {canCreate ? (
          <Panel
            title="Registrar entrada"
            description="Mercadoria que chegou, troca recebida ou devolução. Estes tipos somam ao saldo."
          >
            <AdminForm action={recordMovementAction} submitLabel="Registrar entrada" className="flex flex-col gap-4">
              <Field label="Variação" htmlFor="entradaVariantId">
                <select id="entradaVariantId" name="variantId" required className={selectClass} defaultValue="">
                  <option value="">Selecione…</option>
                  {options.map((option) => (
                    <option key={option.variantId} value={option.variantId}>
                      {option.label} — saldo {option.quantity}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Tipo" htmlFor="type">
                  <select id="type" name="type" defaultValue="PURCHASE" className={selectClass}>
                    <option value="PURCHASE">Entrada (compra)</option>
                    <option value="EXCHANGE">Troca</option>
                    <option value="RETURN">Devolução</option>
                  </select>
                </Field>
                <Field label="Quantidade" htmlFor="entradaQuantity">
                  <input id="entradaQuantity" name="quantity" inputMode="numeric" required className={inputClass} />
                </Field>
                <Field label="Motivo" htmlFor="entradaReason">
                  <input id="entradaReason" name="reason" required className={inputClass} />
                </Field>
              </div>
            </AdminForm>
          </Panel>
        ) : null}
      </div>

      <Panel title="Movimentações" description={`${movementTotal} lançamento(s). Venda e cancelamento entram pelo pedido.`}>
        <Table>
          <THead>
            <TH>Tipo</TH>
            <TH>Produto</TH>
            <TH>SKU</TH>
            <TH className="text-right">Quantidade</TH>
            <TH>Motivo</TH>
            <TH>Pedido</TH>
            <TH>Responsável</TH>
            <TH>Quando</TH>
          </THead>
          <TBody>
            {movements.length === 0 ? (
              <TableEmpty colSpan={8} message="Nenhuma movimentação registrada com estes filtros." />
            ) : (
              movements.map((movement) => (
                <TR key={movement.id}>
                  <TD>{MOVEMENT_LABELS[movement.type]}</TD>
                  <TD>{movement.productName}</TD>
                  <TD className="text-muted">{movement.sku}</TD>
                  <TD className={`text-right tabular-nums ${movement.quantity < 0 ? 'text-danger' : ''}`}>
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </TD>
                  <TD className="text-muted">{movement.reason ?? '—'}</TD>
                  <TD className="text-muted">{movement.orderNumber ?? '—'}</TD>
                  <TD className="text-muted">{movement.userName ?? '—'}</TD>
                  <TD className="text-muted">{formatDateTime(movement.createdAt)}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <Pagination
          page={movementPage}
          pageCount={pageCount(movementTotal, pageSize)}
          hrefFor={(target) => `/admin/estoque${toQuery({ ...query, pagina: page, movpagina: target })}`}
          className="mt-6"
        />
      </Panel>
    </div>
  );
}
