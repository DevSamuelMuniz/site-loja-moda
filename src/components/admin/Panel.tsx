import { cn } from '@/lib/utils';

/**
 * Blocos do painel: cabecalho de modulo, secao, numero de destaque e lista de definicoes.
 *
 * Nenhum destes componentes sabe de negocio — eles so organizam o que a pagina passa. E o que
 * faz `DashboardCard`, `AdminSidebar` e companhia do escopo §34 existirem uma vez so.
 */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 className="type-display text-body-lg">{title}</h2>
        {description ? (
          <p className="type-body text-body-sm text-muted mt-2 max-w-[var(--measure-prose)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('border-border rounded-sm border p-5', className)}>
      {title ? (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="type-heading text-heading-md">{title}</h3>
            {description ? (
              <p className="type-body text-body-sm text-muted mt-1">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="border-border rounded-sm border p-4">
      <p className="type-label text-label text-muted">{label}</p>
      <p className="type-display text-body-lg mt-2 tabular-nums">{value}</p>
      {hint ? <p className="type-body text-body-sm text-muted mt-1">{hint}</p> : null}
    </div>
  );
}

export function DefinitionList({
  items,
  className,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="type-label text-label text-muted">{item.label}</dt>
          <dd className="type-body text-body mt-1 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <span
      className={cn(
        'type-label text-label inline-flex items-center rounded-full border px-3 py-1',
        tone === 'neutral' && 'border-border text-muted',
        tone === 'success' && 'border-success text-success',
        tone === 'warning' && 'border-accent text-accent',
        tone === 'danger' && 'border-danger text-danger',
        tone === 'info' && 'border-primary text-primary',
      )}
    >
      {label}
    </span>
  );
}
