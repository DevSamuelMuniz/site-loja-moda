import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { navigationConfig } from '@/config/navigation';

/**
 * Pagina 404.
 *
 * Um endereco que nao existe e um momento de direcao, nao de desculpa: explica o que
 * aconteceu e oferece os caminhos mais uteis.
 */
export default function NotFound() {
  return (
    <Container className="py-20 lg:py-28">
      <p className="type-label text-label text-muted">Erro 404</p>
      <h1 className="type-display text-display-xl mt-3 max-w-[22ch]">
        Esta página não existe — ou a peça saiu do catálogo.
      </h1>
      <p className="type-body text-body-lg text-muted mt-6 max-w-[var(--measure-prose)]">
        Confira o endereço digitado ou comece pelo catálogo completo. Se você chegou aqui por um
        link nosso, avise o atendimento para corrigirmos.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/produtos" size="lg">
          Ver todos os produtos
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Voltar para a home
        </ButtonLink>
      </div>

      <nav aria-label="Atalhos" className="border-border mt-16 border-t pt-8">
        <h2 className="type-label text-label text-muted">Atalhos</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {navigationConfig.utilityNav.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="type-body text-body link-rule">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/colecoes" className="type-body text-body link-rule">
              Coleções
            </Link>
          </li>
        </ul>
      </nav>
    </Container>
  );
}
