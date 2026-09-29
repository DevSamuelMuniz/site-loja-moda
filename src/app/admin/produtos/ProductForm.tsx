import { AdminForm, type FormAction } from '@/components/admin/AdminForm';
import { CheckboxField, Field, Fieldset, inputClass, selectClass, textareaClass } from '@/components/admin/Field';
import type { Option } from '@/lib/products/queries';
import type { CategoryAudience, ProductStatus } from '@/generated/prisma/enums';

/**
 * Formulario de produto, compartilhado entre criar e editar.
 *
 * Um formulario so para as duas telas porque os campos sao os mesmos — o que muda e a action
 * e o que ja vem preenchido. Duplicar isso daria duas telas que se desencontram na primeira
 * mudanca de regra.
 *
 * A grade (cor × tamanho × estoque) **nao** esta aqui depois de criada: cor, variacao e imagem
 * sao operacoes do produto que ja existe, cada uma com sua acao — e o estoque so muda pelo
 * modulo Estoque, com movimentacao (§8).
 */

export interface ProductFormValue {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  story: string;
  composition: string;
  brand: string;
  categoryId: string | null;
  collectionId: string | null;
  audience: CategoryAudience;
  status: ProductStatus;
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  weightGrams: number | null;
  releasedAt: Date | null;
  tags: string[];
  care: string[];
  details: string[];
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

const empty: ProductFormValue = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  story: '',
  composition: '',
  brand: '',
  categoryId: null,
  collectionId: null,
  audience: 'UNISSEX',
  status: 'DRAFT',
  price: 0,
  compareAtPrice: null,
  cost: null,
  weightGrams: null,
  releasedAt: null,
  tags: [],
  care: [],
  details: [],
  featured: false,
  isNew: false,
  isBestSeller: false,
};

export function ProductForm({
  action,
  product,
  categories,
  collections,
  submitLabel,
  pendingLabel,
  secondary,
}: {
  action: FormAction;
  product?: ProductFormValue;
  categories: Option[];
  collections: Option[];
  submitLabel: string;
  pendingLabel?: string;
  secondary?: React.ReactNode;
}) {
  const value = { ...empty, ...product };
  const isNew = product?.id === undefined;

  return (
    <AdminForm action={action} submitLabel={submitLabel} pendingLabel={pendingLabel} secondary={secondary}>
      {value.id ? <input type="hidden" name="id" value={value.id} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Fieldset legend="Identificação">
          <Field label="Nome" htmlFor="name">
            <input id="name" name="name" defaultValue={value.name} required className={inputClass} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug (endereço)" htmlFor="slug" hint="Vazio gera a partir do nome.">
              <input id="slug" name="slug" defaultValue={value.slug} className={inputClass} />
            </Field>
            <Field label="SKU" htmlFor="sku" hint="Vazio gera a partir do nome.">
              <input id="sku" name="sku" defaultValue={value.sku} className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={value.status} className={selectClass}>
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Publicado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </Field>

            <Field label="Público" htmlFor="audience">
              <select id="audience" name="audience" defaultValue={value.audience} className={selectClass}>
                <option value="UNISSEX">Unissex</option>
                <option value="FEMININO">Feminino</option>
                <option value="MASCULINO">Masculino</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Categoria" htmlFor="categoryId">
              <select id="categoryId" name="categoryId" defaultValue={value.categoryId ?? ''} className={selectClass}>
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Coleção" htmlFor="collectionId">
              <select id="collectionId" name="collectionId" defaultValue={value.collectionId ?? ''} className={selectClass}>
                <option value="">Sem coleção</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Marca" htmlFor="brand" hint="Opcional: peça de marca parceira.">
              <input id="brand" name="brand" defaultValue={value.brand} className={inputClass} />
            </Field>
            <Field label="Lançamento" htmlFor="releasedAt" hint="Usado para ordenar novidades.">
              <input
                id="releasedAt"
                name="releasedAt"
                type="date"
                defaultValue={value.releasedAt ? value.releasedAt.toISOString().slice(0, 10) : ''}
                className={inputClass}
              />
            </Field>
          </div>
        </Fieldset>

        <div className="flex flex-col gap-6">
          <Fieldset legend="Preço" description="O preço anterior, quando informado, precisa ser maior que o atual.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Preço (R$)" htmlFor="price">
                <input
                  id="price"
                  name="price"
                  inputMode="decimal"
                  defaultValue={value.price ? value.price.toFixed(2) : ''}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Preço anterior (R$)" htmlFor="compareAtPrice">
                <input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  inputMode="decimal"
                  defaultValue={value.compareAtPrice ? value.compareAtPrice.toFixed(2) : ''}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Custo (R$)" htmlFor="cost" hint="Uso interno: não aparece na loja.">
                <input
                  id="cost"
                  name="cost"
                  inputMode="decimal"
                  defaultValue={value.cost ? value.cost.toFixed(2) : ''}
                  className={inputClass}
                />
              </Field>
              <Field label="Peso (g)" htmlFor="weightGrams" hint="Base do cálculo de frete (§15).">
                <input
                  id="weightGrams"
                  name="weightGrams"
                  inputMode="numeric"
                  defaultValue={value.weightGrams ?? ''}
                  className={inputClass}
                />
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend="Vitrine">
            <CheckboxField name="featured" label="Destaque na home" defaultChecked={value.featured} />
            <CheckboxField name="isNew" label="Novidade" defaultChecked={value.isNew} />
            <CheckboxField name="isBestSeller" label="Mais vendido" defaultChecked={value.isBestSeller} />
          </Fieldset>
        </div>
      </div>

      <Fieldset legend="Conteúdo">
        <Field label="Descrição curta" htmlFor="description" hint="Aparece em cards, listagem e busca.">
          <textarea id="description" name="description" defaultValue={value.description} className={textareaClass} />
        </Field>

        <Field label="Texto editorial" htmlFor="story">
          <textarea id="story" name="story" defaultValue={value.story} className={textareaClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Composição" htmlFor="composition">
            <input id="composition" name="composition" defaultValue={value.composition} className={inputClass} />
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Separe por vírgula. Também alimenta a busca.">
            <input id="tags" name="tags" defaultValue={value.tags.join(', ')} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cuidados" htmlFor="care" hint="Um por linha.">
            <textarea id="care" name="care" defaultValue={value.care.join('\n')} className={textareaClass} />
          </Field>
          <Field label="Detalhes" htmlFor="details" hint="Um por linha.">
            <textarea id="details" name="details" defaultValue={value.details.join('\n')} className={textareaClass} />
          </Field>
        </div>
      </Fieldset>

      {isNew ? (
        <Fieldset
          legend="Grade inicial"
          description="As variações nascem com saldo zero: o estoque entra pelo módulo Estoque, sempre com movimentação registrada."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Cores" htmlFor="colors" hint="Uma por linha, no formato `Nome #HEX`. Ex.: Preto #111111">
              <textarea id="colors" name="colors" className={textareaClass} placeholder={'Preto #111111\nBranco #F5F5F5'} />
            </Field>
            <Field label="Tamanhos" htmlFor="sizes" hint="Separados por vírgula ou linha. Ex.: P, M, G">
              <textarea id="sizes" name="sizes" className={textareaClass} placeholder="P, M, G" />
            </Field>
          </div>

          <Field label="Imagens" htmlFor="images" hint="Uma URL por linha. Upload entra numa próxima etapa.">
            <textarea id="images" name="images" className={textareaClass} placeholder="/images/produto-1.jpg" />
          </Field>
        </Fieldset>
      ) : null}
    </AdminForm>
  );
}
