import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, Field, inputClass, selectClass, textareaClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { PageHeader, Panel } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { readFlash, readText } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { listCategories, listParentOptions } from '@/lib/taxonomy/queries';
import type { CategoryAudience, CategoryKind } from '@/generated/prisma/enums';
import { archiveCategoryAction, createCategoryAction, updateCategoryAction } from './actions';

/**
 * Categorias (escopo §7, §9, §20).
 *
 * O formulario serve para criar e para editar: `?editar=<id>` carrega a categoria nele. Dessa
 * forma nao existem duas telas com os mesmos campos para se desencontrarem.
 *
 * O eixo da categoria importa: `AUDIENCE` responde "para quem" (Feminino atravessa Vestidos e
 * Jeans) e `PRODUCT` responde "que peca e" — e o que alimenta a navegacao e os filtros da loja.
 */

const KIND_LABELS: Record<CategoryKind, string> = {
  AUDIENCE: 'Público',
  PRODUCT: 'Tipo de peça',
};

const AUDIENCE_LABELS: Record<CategoryAudience, string> = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
  UNISSEX: 'Unissex',
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('categories');
  const params = await searchParams;

  const editId = readText(params.editar, 40);
  const rows = await listCategories(user.storeId);
  const editing = editId ? (rows.find((row) => row.id === editId) ?? null) : null;
  const parents = await listParentOptions(user.storeId, editing?.id);

  const canCreate = can(user.role, 'categories', 'create');
  const canUpdate = can(user.role, 'categories', 'update');
  const canDelete = can(user.role, 'categories', 'delete');
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  const showForm = editing ? canUpdate : canCreate;

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title="Categorias"
        description="Dois eixos: público (feminino, masculino) e tipo de peça (vestidos, jeans). Uma categoria pode ser filha de outra."
      />

      {showForm ? (
        <Panel
          title={editing ? `Editar: ${editing.name}` : 'Nova categoria'}
          action={
            editing ? (
              <Link href="/admin/categorias" className="type-body text-body-sm link-rule text-primary">
                Cancelar edição
              </Link>
            ) : null
          }
        >
          <AdminForm
            action={editing ? updateCategoryAction : createCategoryAction}
            submitLabel={editing ? 'Salvar alterações' : 'Criar categoria'}
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" htmlFor="name">
                <input id="name" name="name" defaultValue={editing?.name ?? ''} required className={inputClass} />
              </Field>
              <Field label="Slug" htmlFor="slug" hint="Vazio gera a partir do nome.">
                <input id="slug" name="slug" defaultValue={editing?.slug ?? ''} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Eixo" htmlFor="kind">
                <select id="kind" name="kind" defaultValue={editing?.kind ?? 'PRODUCT'} className={selectClass}>
                  <option value="PRODUCT">Tipo de peça</option>
                  <option value="AUDIENCE">Público</option>
                </select>
              </Field>

              <Field label="Público" htmlFor="audience">
                <select id="audience" name="audience" defaultValue={editing?.audience ?? 'UNISSEX'} className={selectClass}>
                  <option value="UNISSEX">Unissex</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="MASCULINO">Masculino</option>
                </select>
              </Field>

              <Field label="Posição" htmlFor="position" hint="Ordem de exibição na loja.">
                <input
                  id="position"
                  name="position"
                  inputMode="numeric"
                  defaultValue={editing?.position ?? 0}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Categoria pai" htmlFor="parentId" hint="Deixe vazio para categoria principal.">
                <select id="parentId" name="parentId" defaultValue={editing?.parentId ?? ''} className={selectClass}>
                  <option value="">Sem categoria pai</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Imagem" htmlFor="image" hint="Caminho em /images ou URL https.">
                <input id="image" name="image" defaultValue={editing?.image ?? ''} className={inputClass} />
              </Field>
            </div>

            <Field label="Descrição" htmlFor="description">
              <textarea id="description" name="description" defaultValue={editing?.description ?? ''} className={textareaClass} />
            </Field>

            <CheckboxField
              name="featured"
              label="Destacar na navegação"
              hint="Aparece nos blocos de destaque da home."
              defaultChecked={editing?.featured ?? false}
            />
          </AdminForm>
        </Panel>
      ) : null}

      <Panel title="Categorias cadastradas" description={`${rows.length} categoria(s).`}>
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Eixo</TH>
            <TH>Público</TH>
            <TH>Categoria pai</TH>
            <TH className="text-right">Produtos</TH>
            <TH className="text-right">Posição</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={7} message="Nenhuma categoria cadastrada." />
            ) : (
              rows.map((row) => (
                <TR key={row.id}>
                  <TD>
                    {row.name}
                    <span className="text-muted block text-[0.75rem]">/{row.slug}</span>
                  </TD>
                  <TD className="text-muted">{KIND_LABELS[row.kind]}</TD>
                  <TD className="text-muted">{AUDIENCE_LABELS[row.audience]}</TD>
                  <TD className="text-muted">{row.parentName ?? '—'}</TD>
                  <TD className="text-right tabular-nums">{row.products}</TD>
                  <TD className="text-right tabular-nums">{row.position}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-3">
                      {canUpdate ? (
                        <Link
                          href={`/admin/categorias?editar=${row.id}`}
                          className="type-body text-body-sm link-rule text-primary"
                        >
                          Editar
                        </Link>
                      ) : null}

                      {canDelete ? (
                        <form action={archiveCategoryAction}>
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
      </Panel>
    </div>
  );
}
