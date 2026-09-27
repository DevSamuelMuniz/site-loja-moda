import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section, SectionHeader } from '@/components/layout/Section';
import { ButtonLink } from '@/components/ui/Button';
import { getProductsBySlugs } from '@/lib/catalog';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { LookbookLook } from '@/types';

/**
 * Lookbook.
 *
 * Os looks formam uma sequencia real, entao a numeracao ajuda a se orientar. Cada
 * imagem leva aos produtos que compoem o look, com os nomes listados embaixo —
 * aqui a legenda e informacao, nao decoracao.
 */
export function Lookbook({ looks, className }: { looks: LookbookLook[]; className?: string }) {
  if (looks.length === 0) return null;

  return (
    <Section id="inspire-se" labelledBy="inspire-se-titulo" className={className}>
      <Container>
        <SectionHeader
          id="inspire-se-titulo"
          title="Inspire-se"
          description="Looks montados com peças da coleção. Abra o look para ver cada item."
          action={
            <ButtonLink href="/colecoes" variant="outline" size="sm">
              Ver coleções
            </ButtonLink>
          }
        />

        <ul className="mt-10 grid gap-x-[var(--layout-grid-gap)] gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look, index) => {
            const products = getProductsBySlugs(look.products);
            const lead = products[0];

            return (
              <li
                key={look.id}
                className={cn(
                  index === 0 && 'sm:col-span-2 lg:col-span-1',
                  index === 3 && 'lg:mt-16',
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={look.image}
                    alt={look.caption}
                    fill
                    sizes={imageSizes.lookbook}
                    className="object-cover"
                  />
                </div>

                <p className="type-label text-label text-muted mt-4">{look.name}</p>
                <p className="type-body text-body mt-1 max-w-[var(--measure-tight)]">
                  {look.caption}
                </p>

                {lead ? (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {products.map((product) => (
                      <li key={product.slug}>
                        <Link
                          href={`/produtos/${product.slug}`}
                          className="type-body text-body-sm text-muted hover:text-primary link-rule transition-colors"
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
