import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getCollections, getProducts } from '@/lib/catalog';
import { matchesCollection } from '@/lib/catalog/filters';
import { imageSizes } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Coleções',
  description:
    'Essential 26, Urban, New Season e Sale: as coleções da marca, com as peças que compõem cada uma.',
  path: '/colecoes',
});

export default function CollectionsPage() {
  const collections = getCollections();
  const products = getProducts();

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Coleções' }]} />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Coleções</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Cada coleção nasce de uma ideia de uso. Veja o que compõe cada uma e escolha por onde
          começar.
        </p>
      </header>

      <ul className="mt-12 flex flex-col gap-16">
        {collections.map((collection) => {
          const items = products.filter((product) => matchesCollection(product, collection.slug));

          return (
            <li key={collection.slug}>
              <Link href={`/colecoes/${collection.slug}`} className="group block">
                <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
                  <Image
                    src={collection.image}
                    alt={`Coleção ${collection.name}`}
                    fill
                    sizes={imageSizes.editorialFull}
                    className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
                  />
                </div>
              </Link>

              <SectionHeader
                className="mt-6"
                title={collection.name}
                description={collection.description}
                action={
                  <Link
                    href={`/colecoes/${collection.slug}`}
                    className="type-button text-body link-rule"
                  >
                    Ver coleção
                    <span className="type-body text-body-sm text-muted ml-2 tabular-nums">
                      {items.length}
                    </span>
                  </Link>
                }
              />
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
