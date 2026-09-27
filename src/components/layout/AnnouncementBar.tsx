import { navigationConfig } from '@/config/navigation';

/**
 * Faixa de avisos no topo.
 *
 * As mensagens vem de `navigationConfig.announcement`. No desktop todas aparecem,
 * separadas por um filete; no mobile apenas a primeira, para nao ocupar a tela.
 */
export function AnnouncementBar() {
  const messages = navigationConfig.announcement;
  if (messages.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="type-body text-body-sm mx-auto flex max-w-[var(--layout-wide-width)] items-center justify-center gap-6 px-[var(--layout-gutter)] py-2 text-center">
        {messages.map((message, index) => (
          <span key={message} className={index > 0 ? 'hidden sm:inline' : undefined}>
            {index > 0 ? (
              <span aria-hidden="true" className="mr-6 opacity-40">
                /
              </span>
            ) : null}
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
