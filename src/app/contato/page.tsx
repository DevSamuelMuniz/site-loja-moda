import type { Metadata } from 'next';
import { AtSign, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { brandConfig } from '@/config/brand';
import { socialConfig } from '@/config/social';
import { whatsappConfig } from '@/config/whatsapp';
import { formatPhone, formatUrl, whatsappLink } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Contato',
  description: `Fale com o atendimento da ${brandConfig.name} por WhatsApp, e-mail ou formulário. ${brandConfig.businessHours[1]?.value ?? ''}`,
  path: '/contato',
});

export default function ContactPage() {
  const instagram = socialConfig.links.find((link) => link.id === 'instagram');
  const whatsappHref = whatsappLink();
  const { address } = brandConfig;
  const fullAddress = `${address.street}, ${address.district}, ${address.city} — ${address.state}, ${address.postalCode}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Contato' }]} />

      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Contato</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Dúvida sobre uma peça, um pedido ou uma troca? Escolha o canal que preferir — respondemos
          em horário comercial.
        </p>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="type-heading text-heading-md">Canais diretos</h2>

          <ul className="mt-6 flex flex-col gap-5">
            {whatsappHref ? (
              <li className="flex gap-4">
                <MessageCircle
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-accent mt-1 shrink-0"
                />
                <div>
                  <p className="type-body text-body">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="link-rule text-primary"
                    >
                      WhatsApp
                    </a>
                  </p>
                  <p className="type-body text-body-sm text-muted">
                    {whatsappConfig.displayName} — {whatsappConfig.hours}
                  </p>
                </div>
              </li>
            ) : null}

            <li className="flex gap-4">
              <Mail
                size={18}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-accent mt-1 shrink-0"
              />
              <div>
                <p className="type-body text-body">
                  <a href={`mailto:${brandConfig.email}`} className="link-rule text-primary">
                    {brandConfig.email}
                  </a>
                </p>
                <p className="type-body text-body-sm text-muted">Resposta em até um dia útil.</p>
              </div>
            </li>

            <li className="flex gap-4">
              <Phone
                size={18}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-accent mt-1 shrink-0"
              />
              <div>
                <p className="type-body text-body">{formatPhone(brandConfig.phone)}</p>
                <p className="type-body text-body-sm text-muted">
                  {brandConfig.businessHours.map((entry) => entry.value).join(' · ')}
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <MapPin
                size={18}
                strokeWidth={1.5}
                aria-hidden="true"
                className="text-accent mt-1 shrink-0"
              />
              <div>
                <p className="type-body text-body">{fullAddress}</p>
                <p className="type-body text-body-sm text-muted">
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="link-rule text-primary"
                  >
                    Ver no mapa
                  </a>
                </p>
              </div>
            </li>

            {instagram ? (
              <li className="flex gap-4">
                <AtSign
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-accent mt-1 shrink-0"
                />
                <div>
                  <p className="type-body text-body">
                    <a
                      href={instagram.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link-rule text-primary"
                    >
                      {instagram.handle}
                    </a>
                  </p>
                  <p className="type-body text-body-sm text-muted">
                    Direct do Instagram e redes sociais.
                  </p>
                </div>
              </li>
            ) : null}
          </ul>

          <div className="border-border mt-10 border-t pt-6">
            <h2 className="type-label text-label text-muted">Antes de escrever</h2>
            <p className="type-body text-body-sm text-muted mt-3">
              Prazos de entrega, trocas e devoluções estão nas políticas da loja — boa parte das
              dúvidas se resolve por lá. Site: {formatUrl(brandConfig.email.split('@')[1] ?? '')}
            </p>
            <ul className="mt-3 flex flex-wrap gap-4">
              <li>
                <a href="/faq" className="type-body text-body-sm link-rule text-primary">
                  Perguntas frequentes
                </a>
              </li>
              <li>
                <a href="/trocas" className="type-body text-body-sm link-rule text-primary">
                  Trocas e devoluções
                </a>
              </li>
              <li>
                <a href="/frete" className="type-body text-body-sm link-rule text-primary">
                  Política de envio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="type-heading text-heading-md">Envie uma mensagem</h2>
          <p className="type-body text-body-sm text-muted mt-3 max-w-[var(--measure-prose)]">
            Os campos marcados são validados antes do envio. Se o formulário ainda não estiver
            conectado a um serviço de mensagens, avisamos na hora — sem confirmar um envio que não
            aconteceu.
          </p>
          <ContactForm className="mt-8" />
        </div>
      </div>
    </Container>
  );
}
