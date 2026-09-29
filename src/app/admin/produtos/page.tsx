import Link from 'next/link';
import { Field, selectClass, inputClass } from '@/components/admin/Field';
import { PageHeader, StatusPill } from '@/components/admin/Panel';
import { FlashNotice } from '@/components/admin/Notice';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { Pagination } from '@/components/filters/Pagination';
import { Button, ButtonLink } from '@/components/ui/Button';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { DEFAULT_PAGE_SIZE, pageCount, readEnum, readFlash, readPage, readText, toQuery } from '@/lib/admin/params';
import { listAdminProducts, countAdminProducts, listCategoryOptions } from '@/lib/products/queries';
import { archiveProductAction, duplicateProductAction } from '@/app/admin/produtos/actions';
import type { ProductStatus } from '@/generated/prisma/enums';

/**
 * Lista de produtos (escopo §20).
 *
 * Mostra todos os status: o lojista precisa ver o rascunho que ainda nao publicou e o que
 * esta arquivado. A loja publica so enxerga `ACTIVE`.
 */

const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Publicado',
  ARCHIVED: 'Arquivado',
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('products');
  const params = await searchParams;

  const { page, pageSize } = readPage(params.pagina, DEFAULT_PAGE_SIZE);
  const search = readText(params.busca);
  const status = readEnum(params.status, ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const);
  const stockLevel = readEnum(params.nivel, ['all', 'low', 'out'] as const);
  const categoryId = readText(params.categoria, 40);

  const filter = { storeId: user.storeId, search, status, stockLevel, categoryId };

  const [rows, total, categories] = await Promise.all([
    listAdminProducts({ ...filter, page, pageSize }),
    countAdminProducts(filter),
    listCategoryOptions(user.storeId),
  ]);

  const pages = pageCount(total, pageSize);
  const canCreate = can(user.role, 'products', 'create');
  const canDelete = can(user.role, 'products', 'delete');
  const query = { busca: search, status, nivel: stockLevel, categoria: categoryId };
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  return (
    <div className="flex flex-col gap-8">
      <FlashNotice {...flash} />

      <PageHeader
        title="Produtos"
        description={`${total} produto(s) no catálogo, incluindo rascunho e arquivado.`}
        action={
          canCreate ? (
            <ButtonLink href="/admin/produtos/novo" size="sm">
              Novo produto
            </ButtonLink>
          ) : null
        }
      />

      <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Buscar" htmlFor="busca">
          <input
            id="busca"
            name="busca"
            defaultValue={search ?? ''}
            placeholder="Nome, SKU ou slug"
            className={inputClass}
          />
        </Field>

        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={status ?? ''} className={selectClass}>
            <option value="">Todos</option>
            <option value="ACTIVE">Publicado</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
        </Field>

        <Field label="Estoque" htmlFor="nivel">
          <select id="nivel" name="nivel" defaultValue={stockLevel ?? ''} className={selectClass}>
            <option value="">Qualquer</option>
            <option value="low">Baixo</option>
            <option value="out">Zerado</option>
          </select>
        </Field>

        <Field label="Categoria" htmlFor="categoria">
          <select id="categoria" name="categoria" defaultValue={categoryId ?? ''} className={selectClass}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
          <Link href="/admin/produtos" className="type-body text-body-sm link-rule text-primary">
            Limpar filtros
          </Link>
        </div>
      </form>

      <Table>
        <THead>
          <TH>Produto</TH>
          <TH>Status</TH>
          <TH>Preço</TH>
          <TH>Categoria</TH>
          <TH className="text-right">Variações</TH>
          <TH className="text-right">Estoque</TH>
          <TH>Atualizado</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={8} message="Nenhum produto encontrado com estes filtros." />
          ) : (
            rows.map((row) => (
              <TR key={row.id}>
                <TD>
                  <Link href={`/admin/produtos/${row.id}`} className="link-rule text-primary">
                    {row.name}
                  </Link>
                  <span className="text-muted block text-[0.75rem]">
                    {row.sku} · /{row.slug}
                  </span>
                </TD>
                <TD>
                  <StatusPill
                    label={STATUS_LABELS[row.status]}
                    tone={row.status === 'ACTIVE' ? 'success' : row.status === 'DRAFT' ? 'warning' : 'neutral'}
                  />
                </TD>
                <TD className="tabular-nums">{formatCurrency(row.price)}</TD>
                <TD className="text-muted">{row.categoryName ?? '—'}</TD>
                <TD className="text-right tabular-nums">{row.variants}</TD>
                <TD className="text-right tabular-nums">{row.stock}</TD>
                <TD className="text-muted">{formatDateTime(row.updatedAt)}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/produtos/${row.id}`}
                      className="type-body text-body-sm link-rule text-primary"
                    >
                      Editar
                    </Link>

                    {canCreate ? (
                      <form action={duplicateProductAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <SubmitButton variant="link" size="sm" pendingLabel="Duplicando…">
                          Duplicar
                        </SubmitButton>
                      </form>
                    ) : null}

                    {canDelete ? (
                      <form action={archiveProductAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <SubmitButton variant="link" size="sm" pendingLabel="Arquivando…">
                          Arquivar
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Pagination page={page} pageCount={pages} hrefFor={(target) => `/admin/produtos${toQuery({ ...query, pagina: target })}`} />
    </div>
  );
}
