import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { ButtonLink } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { brandStory, brandStoryPoints } from '@/data/brand';
import { testimonials } from '@/data/testimonials';
import { imageSizes } from '@/lib/images';

/**
 * Sobre a marca.
 *
 * A secao sustenta a promessa com o que a marca faz de concreto — modelagem
 * revisada, tecido escolhido, lotes pequenos — e fecha com quem ja comprou. Sem
 * selo de qualidade generico e sem numero redondo de vaidade.
 */
export function AboutBrand({ className }: { className?: string }) {
  const [lead] = testimonials;

  return (
    <Section id="sobre" labelledBy="sobre-titulo" className={className}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          <div className="reveal-view relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={brandStory.image}
              alt={brandStory.imageCaption}
              fill
              sizes={imageSizes.lookbook}
              className="object-cover"
            />
          </div>

          <div>
            <h2 id="sobre-titulo" className="type-display text-display-lg">
              {brandStory.headline}
            </h2>
            <p className="type-body text-body-lg text-muted mt-6 max-w-[var(--measure-prose)]">
              {brandStory.intro}
            </p>

            <ul className="border-border mt-8 border-t">
              {brandStoryPoints.map((point) => (
                <li key={point.title} className="border-border border-b py-5">
                  <h3 className="type-heading text-heading-md">{point.title}</h3>
                  <p className="type-body text-body text-muted mt-2 max-w-[var(--measure-prose)]">
                    {point.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ButtonLink href={brandStory.ctaHref} variant="outline">
                {brandStory.ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </div>

        {lead ? (
          <figure className="border-border mt-16 grid gap-4 border-t pt-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <figcaption className="type-body text-body-sm text-muted">
              <span className="text-primary block">{lead.author}</span>
              {lead.role} — {lead.city}
            </figcaption>
            <div>
              <blockquote className="type-display text-heading-lg">“{lead.quote}”</blockquote>
              <RatingStars rating={lead.rating} className="mt-4" />
            </div>
          </figure>
        ) : null}
      </Container>
    </Section>
  );
}
