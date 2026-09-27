import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { newsBannerConfig } from '@/config/news';
import { cn } from '@/lib/utils';

/**
 * Faixa de novidades, logo abaixo do header.
 *
 * Diferente da faixa de avisos do topo: aquela lista condicoes da loja, esta anuncia o
 * que acabou de entrar no catalogo e leva direto para a listagem filtrada. Fica fora do
 * header de proposito — assim rola junto com a pagina em vez de ocupar altura fixa.
 *
 * Todo o texto vem de `src/config/news.ts`; o componente nao conhece a promocao.
 */
export function NewsBanner({ className }: { className?: string }) {
  if (!newsBannerConfig.enabled) return null;

  return (
    <aside
      aria-label="Novidades do catálogo"
      className={cn('bg-surface border-border border-b', className)}
    >
      <Container>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
          <span className="type-label text-label text-accent">{newsBannerConfig.label}</span>
          <p className="type-body text-body-sm text-muted">{newsBannerConfig.message}</p>
          <Link
            href={newsBannerConfig.href}
            className="type-button text-body-sm link-rule ml-auto shrink-0"
          >
            {newsBannerConfig.linkLabel}
          </Link>
        </div>
      </Container>
    </aside>
  );
}
