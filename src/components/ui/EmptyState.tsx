import { cn } from '@/lib/utils';

/**
 * Estado vazio.
 * Um vazio explica o que aconteceu e qual e o proximo passo, sem tom de desculpa.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-start gap-4 border border-dashed p-10',
        className,
      )}
    >
      <h2 className="type-heading text-heading-md">{title}</h2>
      <p className="type-body text-body text-muted max-w-[var(--measure-prose)]">{description}</p>
      {action}
    </div>
  );
}
