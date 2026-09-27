import { ProductSection } from '@/components/products/ProductSection';
import { ecommerceConfig } from '@/config/ecommerce';
import { getRelatedProducts } from '@/lib/catalog';
import type { Product } from '@/types';

/**
 * Produtos relacionados.
 *
 * A recomendacao prioriza colecao, depois categoria e tags, para que a sugestao faca
 * sentido com a peca que a pessoa esta vendo — e nao apenas "outros produtos".
 */
export function RelatedProducts({ product }: { product: Product }) {
  const related = getRelatedProducts(product, ecommerceConfig.catalog.relatedLimit);
  if (related.length === 0) return null;

  return (
    <ProductSection
      id="relacionados"
      title="Você também pode gostar"
      description="Peças da mesma coleção, categoria ou estilo."
      products={related}
      tone="surface"
      columns="four"
    />
  );
}
