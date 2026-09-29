import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, Field, inputClass, textareaClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { PageHeader, Panel } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { readFlash, readText } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatShortDate } from '@/lib/format';
import { listCollections } from '@/lib/taxonomy/queries';
import { archiveCollectionAction, createCollectionAction, updateCollectionAction } from './actions';

/**
 * Colecoes (escopo §7, §9, §20).
 *
 * Colecao e curadoria: junta pecas por campanha ("Essential 26") ou por momento ("Sale"), e
 * tem destaque, selo e data de lancamento. Produto pertence a **uma** colecao — quem quiser
 * mais de um agrupamento usa tag.
 */

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('collections');
  const params = await searchParams;

  const editId = readText(params.editar, 40);
  const rows = await listCollections(user.storeId);
  const editing = editId ? (rows.find((row) => row.id === editId) ?? null) : null;

  const canCreate = can(user.role, 'collections', 'create');
  const canUpdate = can(user.role, 'collections', 'update');
  const canDelete = can(user.role, 'collections', 'delete');
  const flash = { ok: readFlash(params.ok), erro: readFlash(params.erro) };

  const showForm = editing ? canUpdate : canCreate;

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title="Coleções"
        description="Curadoria por campanha ou momento. Cada produto pertence a uma coleção."
      />

      {showForm ? (
        <Panel
          title={editing ? `Editar: ${editing.name}` : 'Nova coleção'}
          action={
            editing ? (
              <Link href="/admin/colecoes" className="type-body text-body-sm link-rule text-primary">
                Cancelar edição
              </Link>
            ) : null
          }
        >
          <AdminForm
            action={editing ? updateCollectionAction : createCollectionAction}
            submitLabel={editing ? 'Salvar alterações' : 'Criar coleção'}
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

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Chamada" htmlFor="tagline" hint="Frase curta mostrada no banner.">
                <input id="tagline" name="tagline" defaultValue={editing?.tagline ?? ''} className={inputClass} />
              </Field>
              <Field label="Selo" htmlFor="badge" hint="Ex.: Novo, Últimas peças.">
                <input id="badge" name="badge" defaultValue={editing?.badge ?? ''} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Imagem" htmlFor="image" hint="Caminho em /images ou URL https.">
                <input id="image" name="image" defaultValue={editing?.image ?? ''} className={inputClass} />
              </Field>
              <Field label="Posição" htmlFor="position" hint="Ordem de exibição.">
                <input
                  id="position"
                  name="position"
                  inputMode="numeric"
                  defaultValue={editing?.position ?? 0}
                  className={inputClass}
                />
              </Field>
              <Field label="Lançamento" htmlFor="releasedAt">
                <input
                  id="releasedAt"
                  name="releasedAt"
                  type="date"
                  defaultValue={editing?.releasedAt ? editing.releasedAt.toISOString().slice(0, 10) : ''}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Descrição" htmlFor="description">
              <textarea id="description" name="description" defaultValue={editing?.description ?? ''} className={textareaClass} />
            </Field>

            <CheckboxField
              name="featured"
              label="Destacar na navegação"
              defaultChecked={editing?.featured ?? false}
            />
          </AdminForm>
        </Panel>
      ) : null}

      <Panel title="Coleções cadastradas" description={`${rows.length} coleção(ões).`}>
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Chamada</TH>
            <TH>Lançamento</TH>
            <TH className="text-right">Produtos</TH>
            <TH className="text-right">Posição</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={6} message="Nenhuma coleção cadastrada." />
            ) : (
              rows.map((row) => (
                <TR key={row.id}>
                  <TD>
                    {row.name}
                    <span className="text-muted block text-[0.75rem]">/{row.slug}</span>
                  </TD>
                  <TD className="text-muted">{row.tagline || '—'}</TD>
                  <TD className="text-muted">{formatShortDate(row.releasedAt)}</TD>
                  <TD className="text-right tabular-nums">{row.products}</TD>
                  <TD className="text-right tabular-nums">{row.position}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-3">
                      {canUpdate ? (
                        <Link
                          href={`/admin/colecoes?editar=${row.id}`}
                          className="type-body text-body-sm link-rule text-primary"
                        >
                          Editar
                        </Link>
                      ) : null}

                      {canDelete ? (
                        <form action={archiveCollectionAction}>
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
