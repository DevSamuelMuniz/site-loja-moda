import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';

/**
 * Banner de campanha.
 *
 * Uma faixa de imagem larga com o texto apoiado em uma coluna propria. Serve para
 * anunciar colecao, lancamento ou acao sazonal sem virar um segundo hero.
 */
export function CampaignBanner({
  title,
  highlight,
  description,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
  align = 'left',
  className,
}: {
  title: string;
  highlight?: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <section className={cn('py-4', className)}>
      <Container width="wide">
        <div className="relative overflow-hidden">
          <div className="relative min-h-[54svh] w-full sm:min-h-[62svh]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes={imageSizes.editorialFull}
              className="object-cover"
            />
          </div>

          <div
            className={cn(
              'bg-background/94 reveal-view absolute inset-y-0 flex flex-col justify-center gap-5 p-8 backdrop-blur-sm sm:max-w-md sm:p-12',
              align === 'left' ? 'left-0' : 'right-0',
            )}
          >
            <h2 className="type-display text-display-lg">
              {title}
              {highlight ? (
                <>
                  <br />
                  <span className="text-accent">{highlight}</span>
                </>
              ) : null}
            </h2>
            <p className="type-body text-body text-muted max-w-[var(--measure-prose)]">
              {description}
            </p>
            <div>
              <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
