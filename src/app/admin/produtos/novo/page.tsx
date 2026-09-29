import { PageHeader } from '@/components/admin/Panel';
import { ButtonLink } from '@/components/ui/Button';
import { requirePermission } from '@/lib/auth/guards';
import { listCategoryOptions, listCollectionOptions } from '@/lib/products/queries';
import { ProductForm } from '../ProductForm';
import { createProductAction } from '../actions';

/**
 * Cadastro de produto (escopo §7, §20).
 *
 * O produto nasce com a grade de cores e tamanhos e **saldo zero**: o estoque entra no módulo
 * Estoque, onde cada mudança vira movimentação (§8). Criar produto com saldo digitado aqui
 * seria o segundo caminho para o estoque mudar — e o único sem histórico.
 */

export default async function NewProductPage() {
  const user = await requirePermission('products', 'create');

  const [categories, collections] = await Promise.all([
    listCategoryOptions(user.storeId),
    listCollectionOptions(user.storeId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Novo produto"
        description="Depois de criar, a página do produto abre os painéis de cores, variações e imagens."
        action={
          <ButtonLink href="/admin/produtos" variant="outline" size="sm">
            Voltar para a lista
          </ButtonLink>
        }
      />

      <ProductForm
        action={createProductAction}
        categories={categories}
        collections={collections}
        submitLabel="Criar produto"
        pendingLabel="Criando…"
      />
    </div>
  );
}
