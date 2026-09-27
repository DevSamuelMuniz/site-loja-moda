import { cn } from '@/lib/utils';

/**
 * Bloco de secao com o ritmo vertical do site.
 *
 * `spacing` controla apenas o padding vertical, para evitar que duas secoes somem
 * margens e criem um vao maior do que o previsto.
 */
export function Section({
  id,
  className,
  children,
  spacing = 'default',
  as: Tag = 'section',
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  spacing?: 'default' | 'tight' | 'none';
  as?: 'section' | 'div' | 'article' | 'aside';
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        spacing === 'default' && 'py-[var(--layout-section-space)]',
        spacing === 'tight' && 'py-[var(--layout-section-space-tight)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Cabecalho de secao.
 *
 * Sem rotulo acima do titulo e sem numeracao: a hierarquia vem do tamanho e do
 * espaco, nao de etiquetas que se repetem em toda a pagina.
 */
export function SectionHeader({
  title,
  description,
  action,
  id,
  align = 'left',
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-[var(--measure-wide)]', align === 'center' && 'text-center')}>
        <h2 id={id} className="type-heading text-heading-lg">
          {title}
        </h2>
        {description ? (
          <p className="type-body text-body text-muted mt-3 max-w-[var(--measure-prose)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
