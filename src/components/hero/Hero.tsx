import Image from 'next/image';
import { brandConfig } from '@/config/brand';
import { ButtonLink } from '@/components/ui/Button';
import { imageSizes, photo } from '@/lib/images';
import { cn } from '@/lib/utils';

/**
 * Hero.
 *
 * O padrao (`editorial`) usa duas colunas: a tipografia ocupa a margem da pagina e a
 * fotografia sangra ate a borda direita. Em vez de escrever sobre a imagem com um
 * degrade, o texto fica no papel — o que preserva a legibilidade e trata o espaco em
 * branco como parte da composicao.
 *
 * Movimento: esta e a unica sequencia orquestrada do site. O titulo entra, o texto de
 * apoio acompanha, as acoes fecham e a fotografia abre devagar — uma vez, ao carregar.
 * Nenhuma outra secao se repete assim.
 */

export type HeroVariant = 'editorial' | 'split' | 'fullscreen' | 'minimal';

export interface HeroContent {
  headline: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  primaryImage: string;
  secondaryImage: string;
  imageAlt: string;
}

const defaultContent: HeroContent = {
  headline: brandConfig.slogan,
  description: brandConfig.shortDescription,
  primaryLabel: 'Comprar agora',
  primaryHref: '/produtos',
  secondaryLabel: 'Conhecer coleção',
  secondaryHref: '/colecoes',
  primaryImage: photo('heroPrimary'),
  secondaryImage: photo('heroSecondary'),
  imageAlt: `Modelo vestindo uma peça da coleção ${brandConfig.name}`,
};

export function Hero({
  variant = 'editorial',
  content,
  className,
}: {
  variant?: HeroVariant;
  content?: Partial<HeroContent>;
  className?: string;
}) {
  const data: HeroContent = { ...defaultContent, ...content };
  const actions = (
    <>
      <ButtonLink href={data.primaryHref} size="lg">
        {data.primaryLabel}
      </ButtonLink>
      <ButtonLink href={data.secondaryHref} variant="outline" size="lg">
        {data.secondaryLabel}
      </ButtonLink>
    </>
  );

  if (variant === 'fullscreen') {
    return (
      <section className={cn('relative isolate', className)}>
        <div className="relative min-h-[86svh] w-full overflow-hidden">
          <Image
            src={data.primaryImage}
            alt={data.imageAlt}
            fill
            priority
            sizes={imageSizes.hero}
            className="reveal-image object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, var(--color-overlay) 0%, transparent 72%)',
            }}
          />
          <div className="relative flex min-h-[86svh] items-end px-[var(--layout-gutter)] pb-16">
            <div className="max-w-[var(--measure-wide)]">
              <h1 className="type-display text-display-2xl reveal-step-1 text-white">
                {data.headline}
              </h1>
              <p className="type-body text-body-lg reveal-step-2 mt-6 max-w-[var(--measure-prose)] text-white/85">
                {data.description}
              </p>
              <div className="reveal-step-3 mt-8 flex flex-wrap gap-3">{actions}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className={cn('px-[var(--layout-gutter)]', className)}>
        <div className="mx-auto max-w-[var(--layout-max-width)] pt-16 pb-10">
          <h1 className="type-display text-display-xl reveal-step-1 max-w-[22ch]">
            {data.headline}
          </h1>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="type-body text-body-lg text-muted reveal-step-2 max-w-[var(--measure-prose)]">
              {data.description}
            </p>
            <div className="reveal-step-3 flex flex-wrap gap-3">{actions}</div>
          </div>
        </div>
      </section>
    );
  }

  const imageFirst = variant === 'split';

  return (
    <section className={cn('w-full', className)}>
      <div className="mx-auto grid max-w-[var(--layout-wide-width)] items-stretch gap-0 lg:grid-cols-2">
        <div
          className={cn(
            'flex flex-col justify-center px-[var(--layout-gutter)] py-14 lg:py-24',
            imageFirst && 'lg:order-2',
          )}
        >
          <div className="max-w-[var(--measure-wide)]">
            <h1 className="type-display text-display-2xl reveal-step-1">{data.headline}</h1>
            <p className="type-body text-body-lg text-muted reveal-step-2 mt-6 max-w-[var(--measure-prose)]">
              {data.description}
            </p>
            <div className="reveal-step-3 mt-10 flex flex-wrap gap-3">{actions}</div>
          </div>
        </div>

        <div
          className={cn(
            'relative min-h-[62svh] overflow-hidden lg:min-h-[78svh]',
            imageFirst && 'lg:order-1',
          )}
        >
          <Image
            src={data.primaryImage}
            alt={data.imageAlt}
            fill
            priority
            sizes={imageSizes.hero}
            className="reveal-image object-cover"
          />
          <div className="absolute bottom-4 left-4 hidden w-28 lg:block">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={data.secondaryImage}
                alt=""
                fill
                sizes="112px"
                className="reveal-fade object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
