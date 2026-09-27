import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Paginacao.
 *
 * Links reais em vez de botoes com estado: cada pagina tem endereco proprio, o que
 * mantem a navegacao funcionando sem JavaScript e evita perder os filtros ativos.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  className,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  const linkClass = (active: boolean, disabled = false) =>
    cn(
      'type-body text-body-sm inline-flex h-10 min-w-10 items-center justify-center border px-3 transition-colors tabular-nums',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-primary hover:border-primary',
      disabled && 'pointer-events-none opacity-40',
    );

  return (
    <nav aria-label="Paginação" className={cn('flex flex-wrap items-center gap-2', className)}>
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : undefined}
        className={linkClass(false, page === 1)}
      >
        Anterior
      </Link>

      {pages.map((entry) => (
        <Link
          key={entry}
          href={hrefFor(entry)}
          aria-current={entry === page ? 'page' : undefined}
          className={linkClass(entry === page)}
        >
          {entry}
        </Link>
      ))}

      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        tabIndex={page === pageCount ? -1 : undefined}
        className={linkClass(false, page === pageCount)}
      >
        Próxima
      </Link>
    </nav>
  );
}
