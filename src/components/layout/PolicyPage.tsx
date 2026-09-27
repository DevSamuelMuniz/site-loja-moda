import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/layout/Container';
import { getPolicy, policies } from '@/data/content';
import { formatDate } from '@/lib/format';

/**
 * Renderizador das paginas institucionais.
 *
 * Todas as politicas tem a mesma forma — titulo, resumo, data de revisao e secoes —,
 * entao elas compartilham um unico renderizador e cada rota apenas informa o slug e o
 * proprio metadata. O texto vive em `src/data/content/policies.ts`.
 */
export function PolicyPage({ slug }: { slug: string }) {
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const others = policies.filter((entry) => entry.slug !== policy.slug);

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: policy.title }]} />

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <header>
          <h1 className="type-display text-display-lg">{policy.title}</h1>
          <p className="type-body text-body-lg text-muted mt-4">{policy.summary}</p>
          <p className="type-body text-body-sm text-muted mt-6">
            Última revisão em {formatDate(policy.updatedAt)}.
          </p>

          <nav aria-label="Outras políticas" className="border-border mt-8 border-t pt-6">
            <h2 className="type-label text-label text-muted">Outras políticas</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {others.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/${entry.slug}`}
                    className="type-body text-body-sm text-muted hover:text-primary transition-colors"
                  >
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <article>
          {policy.sections.map((section) => (
            <section key={section.heading} className="mb-10 last:mb-0">
              <h2 className="type-heading text-heading-md">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="type-body text-body text-muted mt-3 max-w-[var(--measure-prose)]"
                >
                  {paragraph}
                </p>
              ))}
              {section.list ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="type-body text-body text-muted flex max-w-[var(--measure-prose)] gap-3"
                    >
                      <span aria-hidden="true" className="text-border">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}
