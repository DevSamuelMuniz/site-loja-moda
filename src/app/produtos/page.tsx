import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { CatalogResults } from '@/components/products/CatalogResults';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  getFacets,
  getProducts,
  queryProducts,
  readFilters,
  readPage,
  type RawSearchParams,
} from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

/**
 * Todos os produtos.
 *
 * Os filtros vivem na URL, entao esta pagina e renderizada no servidor a cada
 * combinacao — o que mantem o resultado indexavel e compartilhavel.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Todos os produtos',
  description:
    'Catálogo completo: camisetas, camisas, calças, jeans, jaquetas, vestidos e acessórios. Filtre por categoria, tamanho, cor, coleção e preço.',
  path: '/produtos',
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const page = readPage(params);

  const facets = await getFacets(filters);
  const result = await queryProducts(filters, page);

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Produtos' }]} />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Todos os produtos</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          {(await getProducts()).length} peças no catálogo. Combine os filtros para chegar mais
          rápido no que você procura.
        </p>
      </header>

      <CatalogResults
        basePath="/produtos"
        filters={filters}
        facets={facets}
        result={result}
        className="mt-10"
      />
    </Container>
  );
}
