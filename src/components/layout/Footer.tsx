import Link from 'next/link';
import { brandConfig } from '@/config/brand';
import { navigationConfig } from '@/config/navigation';
import { seoConfig } from '@/config/seo';
import { socialConfig } from '@/config/social';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/ui/Logo';
import { formatPhone } from '@/lib/format';

/**
 * Rodape.
 *
 * As colunas vem de `navigationConfig.footerColumns` e a coluna de redes e derivada
 * de `socialConfig`, entao nenhum rotulo de navegacao vive no componente.
 */
export function Footer() {
  const socialLinks = socialConfig.links.filter((link) => link.enabled);
  const year = new Date().getFullYear();
  const { address } = brandConfig;

  return (
    <footer className="border-border mt-[var(--layout-section-space)] border-t">
      <Container>
        <div className="grid gap-10 py-14 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="max-w-[var(--measure-tight)]">
            <Logo />
            <p className="type-body text-body text-muted mt-4">{brandConfig.shortDescription}</p>
            <address className="type-body text-body-sm text-muted mt-6 not-italic">
              <span className="block">{brandConfig.email}</span>
              <span className="block">{formatPhone(brandConfig.phone)}</span>
              <span className="mt-3 block">
                {address.street}
                <br />
                {address.district} — {address.city}, {address.state}
                <br />
                CEP {address.postalCode}
              </span>
            </address>
          </div>

          {navigationConfig.footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="type-heading text-heading-md">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="type-body text-body-sm text-muted hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="type-body text-body-sm text-muted hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Redes sociais">
            <h2 className="type-heading text-heading-md">Redes</h2>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="type-body text-body-sm text-muted hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="type-body text-body-sm text-muted mt-6">
              Horário de atendimento
              <br />
              {brandConfig.businessHours.map((entry) => (
                <span key={entry.label} className="block">
                  {entry.label}: {entry.value}
                </span>
              ))}
            </p>
          </nav>
        </div>

        <p className="type-body text-body-sm text-muted border-border max-w-[var(--measure-prose)] border-t py-6">
          {brandConfig.fiscal.registrationNumber
            ? `${brandConfig.legalName} — ${brandConfig.fiscal.registrationLabel} ${brandConfig.fiscal.registrationNumber}`
            : brandConfig.legalName}
        </p>

        <div className="border-border flex flex-col gap-4 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-body text-body-sm text-muted">
            © {year} {brandConfig.name}. Todos os direitos reservados.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {navigationConfig.legalNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="type-body text-body-sm text-muted hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="type-body text-body-sm text-muted">
            Loja demonstrativa — {seoConfig.siteUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </Container>
    </footer>
  );
}
