import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { faqGroups, faqItems } from '@/data/content';
import { whatsappLink } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Perguntas frequentes',
  description:
    'Pedidos, tamanhos, entrega, trocas e pagamento: as respostas para as dúvidas mais comuns da loja.',
  path: '/faq',
});

export default function FaqPage() {
  const whatsappHref = whatsappLink();

  const groups = faqGroups
    .map((group) => ({
      group,
      items: faqItems.filter((item) => item.group === group),
    }))
    .filter((entry) => entry.items.length > 0);

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Perguntas frequentes' }]} />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Perguntas frequentes</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Reunimos as dúvidas que mais aparecem no atendimento. As condições de frete e troca seguem
          a configuração da loja e estão detalhadas nas políticas.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {groups.map(({ group, items }) => {
          const accordionItems: AccordionItem[] = items.map((item) => ({
            id: item.id,
            question: item.question,
            answer: <p>{item.answer}</p>,
          }));

          return (
            <section key={group} aria-labelledby={`faq-${group}`}>
              <h2 id={`faq-${group}`} className="type-heading text-heading-md">
                {group}
              </h2>
              <Accordion items={accordionItems} className="mt-4" />
            </section>
          );
        })}
      </div>

      <div className="border-border mt-16 grid gap-6 border-t pt-8 sm:grid-cols-2">
        <div>
          <h2 className="type-heading text-heading-md">Não encontrou a resposta?</h2>
          <p className="type-body text-body text-muted mt-3 max-w-[var(--measure-prose)]">
            {whatsappHref
              ? 'Fale com o atendimento pelo WhatsApp e respondemos em horário comercial.'
              : 'Fale com o atendimento pelos canais da página de contato.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="type-button bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center rounded-sm px-6 transition-colors"
              >
                Falar no WhatsApp
              </a>
            ) : null}
            <ButtonLink href="/contato" variant="outline">
              Página de contato
            </ButtonLink>
          </div>
        </div>

        <div>
          <h2 className="type-heading text-heading-md">Políticas da loja</h2>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <Link href="/trocas" className="type-body text-body link-rule text-primary">
                Trocas e devoluções
              </Link>
            </li>
            <li>
              <Link href="/frete" className="type-body text-body link-rule text-primary">
                Política de envio
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="type-body text-body link-rule text-primary">
                Política de privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
