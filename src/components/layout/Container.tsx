import { cn } from '@/lib/utils';

/**
 * Largura maxima e respiro lateral do conteudo.
 * Os valores vem de `src/styles/tokens.css`, nao de medidas soltas no componente.
 */
export function Container({
  className,
  children,
  width = 'default',
}: {
  className?: string;
  children: React.ReactNode;
  width?: 'default' | 'wide';
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[var(--layout-gutter)]',
        width === 'wide' ? 'max-w-[var(--layout-wide-width)]' : 'max-w-[var(--layout-max-width)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
