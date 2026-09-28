import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { CatalogResults } from '@/components/products/CatalogResults';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  getCollectionBySlug,
  getCollections,
  getFacets,
  getProducts,
  queryProducts,
  readFilters,
  readPage,
  type RawSearchParams,
} from '@/lib/catalog';
import { matchesCollection } from '@/lib/catalog/filters';
import { buildMetadata, itemListSchema } from '@/lib/seo';

/**
 * Colecao.
 *
 * A colecao `sale` e virtual: ela nao esta vinculada a nenhum produto, e sim
 * resolvida pelo estado promocional da peca. O resto da pagina e identico ao das
 * demais colecoes.
 */

export async function generateStaticParams() {
  return (await getCollections()).map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return buildMetadata({
      title: 'Coleção não encontrada',
      description: 'A coleção informada não existe no catálogo.',
      path: `/colecoes/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${collection.name} — ${collection.tagline}`,
    description: collection.description,
    path: `/colecoes/${collection.slug}`,
    images: [collection.image],
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const rawParams = await searchParams;
  const filters = readFilters(rawParams);
  const page = readPage(rawParams);

  const facets = await getFacets(filters);
  const result = await queryProducts(filters, page);
  const collectionProducts = (await getProducts()).filter((product) =>
    matchesCollection(product, collection.slug),
  );

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: 'Coleções', href: '/colecoes' },
          { label: collection.name },
        ]}
      />
      <JsonLd
        data={itemListSchema(
          collection.name,
          collectionProducts.map((product) => ({ name: product.name, slug: product.slug })),
        )}
      />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        {collection.badge ? (
          <p className="type-label text-label text-accent">{collection.badge}</p>
        ) : null}
        <h1 className="type-display text-display-lg mt-2">{collection.name}</h1>
        <p className="type-body text-body-lg text-muted mt-4">{collection.description}</p>
      </header>

      <CatalogResults
        basePath={`/colecoes/${collection.slug}`}
        filters={filters}
        facets={facets}
        result={result}
        className="mt-10"
      />
    </Container>
  );
}
