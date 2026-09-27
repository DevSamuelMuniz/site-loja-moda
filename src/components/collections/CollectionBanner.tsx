import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { Collection } from '@/types';

/**
 * Destaque de colecao.
 *
 * Imagem ocupando a tela quase inteira, com o texto ancorado embaixo. Diferente do
 * banner de campanha, aqui a foto manda: a colecao e o argumento, nao o aviso.
 */
export function CollectionBanner({
  collection,
  ctaLabel,
  ctaHref,
  className,
}: {
  collection: Collection;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}) {
  return (
    <section className={cn('relative isolate', className)}>
      <Container width="wide">
        <div className="relative min-h-[78svh] w-full overflow-hidden">
          <Image
            src={collection.image}
            alt={`Coleção ${collection.name}`}
            fill
            sizes={imageSizes.editorialFull}
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(0deg, var(--color-overlay) 0%, transparent 58%)',
            }}
          />
          <div className="reveal-view relative flex min-h-[78svh] flex-col justify-end p-8 sm:p-12">
            {collection.badge ? (
              <p className="type-label text-label text-white/80">{collection.badge}</p>
            ) : null}
            <h2 className="type-display text-display-xl mt-3 text-white">{collection.name}</h2>
            <p className="type-body text-body-lg mt-4 max-w-[var(--measure-prose)] text-white/85">
              {collection.tagline}
            </p>
            <div className="mt-8">
              <ButtonLink href={ctaHref} variant="accent" size="lg">
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
