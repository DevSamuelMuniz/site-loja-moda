import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { CheckboxField, Field, inputClass, selectClass, textareaClass } from '@/components/admin/Field';
import { FlashNotice } from '@/components/admin/Notice';
import { DefinitionList, PageHeader, Panel, StatusPill } from '@/components/admin/Panel';
import { ConfirmButton, SubmitButton } from '@/components/admin/SubmitButton';
import { Table, TBody, TD, TH, THead, TR, TableEmpty } from '@/components/admin/Table';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { ButtonLink } from '@/components/ui/Button';
import { readFlash } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { can } from '@/lib/auth/permissions';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getAdminProduct, listCategoryOptions, listCollectionOptions } from '@/lib/products/queries';
import { ProductForm } from '../ProductForm';
import {
  addColorAction,
  addImageAction,
  archiveProductAction,
  duplicateProductAction,
  generateVariantsAction,
  removeColorAction,
  removeImageAction,
  removeVariantAction,
  updateProductAction,
  updateVariantAction,
} from '../actions';

/**
 * Produto: cadastro, grade, imagens e acoes (escopo §7, §20).
 *
 * O estoque por variacao aparece aqui **somente para leitura**: quem move saldo e o modulo
 * Estoque, com movimentacao registrada (§8). Dar um campo de saldo nesta tela criaria um
 * segundo caminho para o estoque mudar — e o unico sem historico.
 */

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('products');
  const { id } = await params;
  const query = await searchParams;

  const product = await getAdminProduct({ storeId: user.storeId, id });
  if (!product) notFound();

  const [categories, collections] = await Promise.all([
    listCategoryOptions(user.storeId),
    listCollectionOptions(user.storeId),
  ]);

  const canUpdate = can(user.role, 'products', 'update');
  const canCreate = can(user.role, 'products', 'create');
  const canDelete = can(user.role, 'products', 'delete');
  const flash = { ok: readFlash(query.ok), erro: readFlash(query.erro) };

  const sizes = [...new Set(product.variants.map((variant) => variant.size))];

  return (
    <div className="flex flex-col gap-10">
      <FlashNotice {...flash} />

      <PageHeader
        title={product.name}
        description={`/${product.slug} · ${product.sku}`}
        action={
          <>
            <StatusPill
              label={
                product.status === 'ACTIVE'
                  ? 'Publicado'
                  : product.status === 'DRAFT'
                    ? 'Rascunho'
                    : 'Arquivado'
              }
              tone={product.status === 'ACTIVE' ? 'success' : product.status === 'DRAFT' ? 'warning' : 'neutral'}
            />
            <ButtonLink href="/admin/produtos" variant="outline" size="sm">
              Voltar
            </ButtonLink>
          </>
        }
      />

      <Panel title="Cadastro">
        <ProductForm
          action={updateProductAction}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            story: product.story,
            composition: product.composition,
            brand: product.brand ?? '',
            categoryId: product.categoryId,
            collectionId: product.collectionId,
            audience: product.audience,
            status: product.status,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            cost: product.cost,
            weightGrams: product.weightGrams,
            releasedAt: product.releasedAt,
            tags: product.tags,
            care: product.care,
            details: product.details,
            featured: product.featured,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
          }}
          categories={categories}
          collections={collections}
          submitLabel="Salvar alterações"
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Cores" description="A cor vira amostra na loja; o hexadecimal é obrigatório.">
          {product.colors.length === 0 ? (
            <p className="type-body text-body-sm text-muted">Nenhuma cor cadastrada.</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {product.colors.map((color) => (
                <li key={color.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="border-border h-6 w-6 rounded-full border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="type-body text-body">{color.name}</p>
                      <p className="type-body text-body-sm text-muted">
                        {color.hex} · /{color.slug}
                      </p>
                    </div>
                  </div>

                  {canUpdate ? (
                    <form action={removeColorAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="colorId" value={color.id} />
                      <SubmitButton variant="link" size="sm" pendingLabel="Removendo…">
                        Remover
                      </SubmitButton>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {canUpdate ? (
            <AdminForm action={addColorAction} submitLabel="Adicionar cor" className="mt-6 flex flex-col gap-4">
              <input type="hidden" name="productId" value={product.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" htmlFor="colorName">
                  <input id="colorName" name="colorName" required className={inputClass} />
                </Field>
                <Field label="Hexadecimal" htmlFor="colorHex" hint="Ex.: #111111">
                  <input id="colorHex" name="colorHex" required placeholder="#111111" className={inputClass} />
                </Field>
              </div>
            </AdminForm>
          ) : null}
        </Panel>

        <Panel title="Imagens" description="Uma URL por imagem. Upload entra numa próxima etapa.">
          {product.images.length === 0 ? (
            <p className="type-body text-body-sm text-muted">Nenhuma imagem cadastrada.</p>
          ) : (
            <ul className="divide-border flex flex-col divide-y">
              {product.images.map((image) => (
                <li key={image.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Thumbnail url={image.url} alt={image.alt ?? product.name} />
                    <div className="min-w-0">
                      <p className="type-body text-body-sm truncate">{image.url}</p>
                      <p className="type-body text-body-sm text-muted">
                        {image.alt ?? 'sem texto alternativo'}
                      </p>
                    </div>
                  </div>

                  {canUpdate ? (
                    <form action={removeImageAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <SubmitButton variant="link" size="sm" pendingLabel="Removendo…">
                        Remover
                      </SubmitButton>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {canUpdate ? (
            <AdminForm action={addImageAction} submitLabel="Adicionar imagem" className="mt-6 flex flex-col gap-4">
              <input type="hidden" name="productId" value={product.id} />
              <Field label="URL" htmlFor="url" hint="Caminho em /images ou URL https.">
                <input id="url" name="url" required className={inputClass} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Texto alternativo" htmlFor="alt">
                  <input id="alt" name="alt" className={inputClass} />
                </Field>
                <Field label="Cor específica" htmlFor="colorId">
                  <select id="colorId" name="colorId" defaultValue="" className={selectClass}>
                    <option value="">Todas as cores</option>
                    {product.colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </AdminForm>
          ) : null}
        </Panel>
      </div>

      <Panel
        title="Variações"
        description="Uma linha por cor × tamanho. O saldo é movimentado no módulo Estoque."
        action={
          <Link
            href={`/admin/estoque?busca=${encodeURIComponent(product.sku)}`}
            className="type-body text-body-sm link-rule text-primary"
          >
            Ajustar estoque
          </Link>
        }
      >
        <Table>
          <THead>
            <TH>Cor</TH>
            <TH>Tamanho</TH>
            <TH>SKU</TH>
            <TH>Preço próprio</TH>
            <TH className="text-right">Saldo</TH>
          </THead>
          <TBody>
            {product.variants.length === 0 ? (
              <TableEmpty colSpan={5} message="Nenhuma variação. Gere a grade abaixo." />
            ) : (
              product.variants.map((variant) => (
                <TR key={variant.id}>
                  <TD>{variant.colorName ?? '—'}</TD>
                  <TD>{variant.size}</TD>
                  <TD className="text-muted">{variant.sku}</TD>
                  <TD className="tabular-nums">
                    {variant.price === null ? (
                      <span className="text-muted">preço do produto</span>
                    ) : (
                      formatCurrency(variant.price)
                    )}
                  </TD>
                  <TD className="text-right tabular-nums">{variant.quantity}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        {canUpdate && product.variants.length > 0 ? (
          <div className="mt-8 flex flex-col gap-4">
            <h3 className="type-heading text-heading-md">Editar variação</h3>
            <p className="type-body text-body-sm text-muted max-w-[var(--measure-prose)]">
              Campo em branco mantém o valor atual. Preço próprio vazio significa &quot;usa o preço do
              produto&quot;.
            </p>

            {product.variants.map((variant) => (
              <form
                key={`edit-${variant.id}`}
                action={updateVariantAction}
                className="border-border grid grid-cols-2 items-end gap-3 rounded-sm border p-4 lg:grid-cols-5"
              >
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="variantId" value={variant.id} />

                <Field label="SKU" htmlFor={`sku-${variant.id}`}>
                  <input id={`sku-${variant.id}`} name="sku" defaultValue={variant.sku} className={inputClass} />
                </Field>
                <Field label="Tamanho" htmlFor={`size-${variant.id}`}>
                  <input id={`size-${variant.id}`} name="size" defaultValue={variant.size} className={inputClass} />
                </Field>
                <Field label="Preço próprio" htmlFor={`price-${variant.id}`}>
                  <input
                    id={`price-${variant.id}`}
                    name="price"
                    inputMode="decimal"
                    defaultValue={variant.price === null ? '' : variant.price.toFixed(2)}
                    placeholder="preço do produto"
                    className={inputClass}
                  />
                </Field>
                <Field label="Preço anterior" htmlFor={`compare-${variant.id}`}>
                  <input
                    id={`compare-${variant.id}`}
                    name="compareAtPrice"
                    inputMode="decimal"
                    defaultValue={variant.compareAtPrice === null ? '' : variant.compareAtPrice.toFixed(2)}
                    className={inputClass}
                  />
                </Field>
                <div className="flex items-center gap-3">
                  <SubmitButton variant="outline" size="sm" pendingLabel="Salvando…">
                    Salvar
                  </SubmitButton>
                  <SubmitButton
                    variant="link"
                    size="sm"
                    formAction={removeVariantAction}
                    pendingLabel="Removendo…"
                  >
                    Remover
                  </SubmitButton>
                </div>
              </form>
            ))}
          </div>
        ) : null}

        {canUpdate ? (
          <AdminForm
            action={generateVariantsAction}
            submitLabel="Gerar variações"
            className="mt-8 flex flex-col gap-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            <Field
              label="Tamanhos"
              htmlFor="sizes"
              hint={`Separados por vírgula. Já existem: ${sizes.length > 0 ? sizes.join(', ') : 'nenhum tamanho'}.`}
            >
              <textarea id="sizes" name="sizes" required className={textareaClass} placeholder="P, M, G, GG" />
            </Field>

            {product.colors.length > 0 ? (
              <fieldset className="flex flex-col gap-3">
                <legend className="type-label text-label text-muted">Cores</legend>
                <p className="type-body text-body-sm text-muted">
                  Nenhuma marcada usa todas as cores nas combinações novas.
                </p>
                {product.colors.map((color) => (
                  <CheckboxField key={color.id} name="colorIds" label={color.name} />
                ))}
              </fieldset>
            ) : null}
          </AdminForm>
        ) : null}
      </Panel>

      <Panel title="Ações">
        <DefinitionList
          items={[
            { label: 'Lançamento', value: formatDateTime(product.releasedAt ?? new Date()) },
            { label: 'Itens de pedido', value: product.orderItems },
            { label: 'Custo', value: product.cost === null ? 'não informado' : formatCurrency(product.cost) },
            {
              label: 'Margem',
              value:
                product.cost === null || product.price <= 0
                  ? 'custo não informado'
                  : `${Math.round(((product.price - product.cost) / product.price) * 100)}%`,
            },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canCreate ? (
            <form action={duplicateProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <SubmitButton variant="outline" size="sm" pendingLabel="Duplicando…">
                Duplicar como rascunho
              </SubmitButton>
            </form>
          ) : null}

          {canDelete ? (
            <form action={archiveProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton
                variant="outline"
                size="sm"
                message="Arquivar este produto? Ele sai da loja e da lista, e continua no histórico dos pedidos."
              >
                Arquivar
              </ConfirmButton>
            </form>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
