'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { cn } from '@/lib/utils';

/**
 * Botao de favorito.
 *
 * O estado vem do `WishlistProvider`. Antes da hidratacao, o botao aparece
 * desmarcado, que e o mesmo estado renderizado pelo servidor.
 */
export function WishlistButton({
  productSlug,
  productName,
  variant = 'icon',
  className,
}: {
  productSlug: string;
  productName: string;
  variant?: 'icon' | 'inline';
  className?: string;
}) {
  const { has, toggle, hydrated } = useWishlist();
  const active = has(productSlug);

  const label = active
    ? `Remover ${productName} dos favoritos`
    : `Adicionar ${productName} aos favoritos`;

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={() => toggle(productSlug)}
        aria-pressed={hydrated ? active : undefined}
        aria-label={label}
        className={cn(
          'type-button text-body hover:text-accent inline-flex items-center gap-2 transition-colors duration-[var(--duration-base)]',
          active ? 'text-danger' : 'text-primary',
          className,
        )}
      >
        <Heart
          size={18}
          strokeWidth={1.5}
          className={active ? 'fill-current' : undefined}
          aria-hidden="true"
        />
        {active ? 'Nos favoritos' : 'Adicionar aos favoritos'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productSlug)}
      aria-pressed={hydrated ? active : undefined}
      aria-label={label}
      className={cn(
        'bg-surface/85 text-primary hover:text-danger rounded-pill inline-flex h-9 w-9 items-center justify-center backdrop-blur-sm transition-[color,transform] duration-[var(--duration-base)] active:scale-90',
        active && 'text-danger',
        className,
      )}
    >
      <Heart
        size={16}
        strokeWidth={1.5}
        className={cn(active && 'pop-in fill-current')}
        aria-hidden="true"
      />
    </button>
  );
}
