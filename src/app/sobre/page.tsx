import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { Section, SectionHeader } from '@/components/layout/Section';
import { Benefits } from '@/components/marketing/Benefits';
import { ButtonLink } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { brandConfig } from '@/config/brand';
import { brandBenefits, brandStory, brandStoryPoints } from '@/data/brand';
import { sizeGuide } from '@/data/content';
import { testimonials } from '@/data/testimonials';
import { getCatalogSummary } from '@/lib/catalog';
import { imageSizes } from '@/lib/images';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sobre a marca',
  description: `${brandConfig.name}: ${brandConfig.tagline} Modelagem revisada, fibras naturais e produção em pequenos lotes.`,
  path: '/sobre',
  images: [brandStory.image],
});

export default async function AboutPage() {
  const summary = await getCatalogSummary();

  return (
    <>
      <Container className="py-10 lg:py-14">
        <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Sobre' }]} />

        <header className="mt-6 max-w-[var(--measure-wide)]">
          <h1 className="type-display text-display-xl">{brandStory.headline}</h1>
          <p className="type-body text-body-lg text-muted mt-6">{brandStory.intro}</p>
        </header>

        <div className="relative mt-12 aspect-[16/9] w-full overflow-hidden">
          <Image
            src={brandStory.image}
            alt={brandStory.imageCaption}
            fill
            priority
            sizes={imageSizes.editorialFull}
            className="object-cover"
          />
        </div>
        <p className="type-body text-body-sm text-muted mt-3">{brandStory.imageCaption}</p>

        <section id="historia" className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="type-heading text-heading-lg">Nossa história</h2>
            {brandStory.body.map((paragraph) => (
              <p
                key={paragraph}
                className="type-body text-body text-muted mt-4 max-w-[var(--measure-prose)]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="border-border border-t">
            <div className="border-border flex justify-between gap-6 border-b py-4">
              <dt className="type-body text-body text-muted">Marca desde</dt>
              <dd className="type-body text-body tabular-nums">{brandConfig.foundedYear}</dd>
            </div>
            <div className="border-border flex justify-between gap-6 border-b py-4">
              <dt className="type-body text-body text-muted">Peças no catálogo</dt>
              <dd className="type-body text-body tabular-nums">{summary.productCount}</dd>
            </div>
            <div className="border-border flex justify-between gap-6 border-b py-4">
              <dt className="type-body text-body text-muted">Coleções</dt>
              <dd className="type-body text-body tabular-nums">{summary.collectionCount}</dd>
            </div>
            <div className="border-border flex justify-between gap-6 border-b py-4">
              <dt className="type-body text-body text-muted">Grade de tamanhos</dt>
              <dd className="type-body text-body">
                {sizeGuide.rows.map((row) => row.size).join(' · ')}
              </dd>
            </div>
            <div className="flex justify-between gap-6 py-4">
              <dt className="type-body text-body text-muted">Onde ficamos</dt>
              <dd className="type-body text-body">
                {brandConfig.address.city}, {brandConfig.address.state}
              </dd>
            </div>
          </dl>
        </section>

        <Section spacing="tight" className="mt-8">
          <SectionHeader
            id="como-trabalhamos"
            title="Como trabalhamos"
            description="Três decisões que explicam o resto da coleção."
          />
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {brandStoryPoints.map((point) => (
              <li key={point.title}>
                <h3 className="type-heading text-heading-md">{point.title}</h3>
                <p className="type-body text-body text-muted mt-3 max-w-[var(--measure-prose)]">
                  {point.description}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <section className="mt-16" aria-labelledby="quem-veste">
          <h2 id="quem-veste" className="type-heading text-heading-lg">
            Quem veste
          </h2>
          <ul className="mt-8 grid gap-10 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="border-border border-t pt-6">
                <blockquote className="type-body text-body-lg">“{testimonial.quote}”</blockquote>
                <p className="type-body text-body-sm text-muted mt-4">
                  {testimonial.author} — {testimonial.role}, {testimonial.city}
                </p>
                <RatingStars rating={testimonial.rating} className="mt-3" />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 flex flex-wrap gap-3">
          <ButtonLink href="/produtos" size="lg">
            Ver o catálogo
          </ButtonLink>
          <ButtonLink href="/contato" variant="outline" size="lg">
            Falar com a gente
          </ButtonLink>
        </div>
      </Container>

      <Benefits benefits={brandBenefits} />
    </>
  );
}
