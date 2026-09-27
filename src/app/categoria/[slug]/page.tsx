import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { CatalogResults } from '@/components/products/CatalogResults';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  dictionaries,
  getCategories,
  getCategoryBySlug,
  getFacets,
  getProducts,
  queryProducts,
  readFilters,
  readPage,
  type RawSearchParams,
} from '@/lib/catalog';
import { filterProducts } from '@/lib/catalog/filters';
import { buildMetadata, itemListSchema } from '@/lib/seo';

/**
 * Categoria.
 *
 * Cobre os dois eixos do catalogo: categoria de peca (Vestidos, Jeans) e categoria de
 * publico (Feminino, Masculino). A diferenca fica em `category.kind`, e nenhuma das
 * duas precisa de uma pagina propria.
 */

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return buildMetadata({
      title: 'Categoria não encontrada',
      description: 'A categoria informada não existe no catálogo.',
      path: `/categoria/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/categoria/${category.slug}`,
    images: [category.image],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const rawParams = await searchParams;
  const filters = readFilters(rawParams);
  const page = readPage(rawParams);

  const facets = getFacets(filters);
  const result = queryProducts(filters, page);

  const inCategory = filterProducts(
    getProducts(),
    { ...filters, query: '' },
    dictionaries(),
  ).filter((product) =>
    category.kind === 'audience'
      ? product.audience === category.audience
      : product.category === category.slug,
  );

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          { label: category.name },
        ]}
      />
      <JsonLd
        data={itemListSchema(
          category.name,
          inCategory.map((product) => ({ name: product.name, slug: product.slug })),
        )}
      />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">{category.name}</h1>
        <p className="type-body text-body-lg text-muted mt-4">{category.description}</p>
      </header>

      <CatalogResults
        basePath={`/categoria/${category.slug}`}
        filters={filters}
        facets={facets}
        result={result}
        className="mt-10"
      />
    </Container>
  );
}
