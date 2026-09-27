import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Trilha de navegacao.
 * Usa `nav` + lista ordenada, que e a estrutura que leitores de tela esperam.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Você está aqui" className={cn('type-body text-body-sm text-muted', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="link-rule hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-primary">
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight size={14} aria-hidden="true" className="text-border" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
