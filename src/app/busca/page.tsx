import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { CatalogResults } from '@/components/products/CatalogResults';
import { SearchTracker } from '@/components/search/SearchTracker';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import {
  getFacets,
  queryProducts,
  readFilters,
  readPage,
  type RawSearchParams,
} from '@/lib/catalog';
import { buildMetadata } from '@/lib/seo';

/**
 * Busca.
 *
 * A mesma busca instantanea do header, mas em uma pagina propria — com endereco
 * compartilhavel, resultado renderizado no servidor e os mesmos filtros do catalogo.
 */

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const term = readFilters(params).query;

  return buildMetadata({
    title: term ? `Busca por ${term}` : 'Buscar produtos',
    description: term
      ? `Resultados para "${term}" no catálogo.`
      : 'Busque por nome, categoria, coleção, tag ou código da peça.',
    path: '/busca',
    /* Resultado de busca nao deve competir com o catalogo na indexacao. */
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const filters = readFilters(params);
  const page = readPage(params);

  const facets = await getFacets(filters);
  const result = await queryProducts(filters, page);
  const term = filters.query;

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Busca' }]} />
      {term ? <SearchTracker term={term} results={result.total} /> : null}

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">
          {term ? `Resultados para “${term}”` : 'Buscar produtos'}
        </h1>
        <p className="type-body text-body-lg text-muted mt-4">
          A busca cobre nome, categoria, coleção, tags e o código da peça. Use os filtros para
          refinar.
        </p>
      </header>

      {term ? (
        <CatalogResults
          basePath="/busca"
          filters={filters}
          facets={facets}
          result={result}
          className="mt-10"
        />
      ) : (
        <div className="mt-10 max-w-[var(--measure-prose)]">
          <p className="type-body text-body text-muted">
            Digite um termo na busca do topo da página, ou abra o catálogo completo e use os filtros
            por categoria, tamanho, cor e preço.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/produtos">Ver todos os produtos</ButtonLink>
            <ButtonLink href="/colecoes" variant="outline">
              Ver coleções
            </ButtonLink>
          </div>
        </div>
      )}
    </Container>
  );
}
