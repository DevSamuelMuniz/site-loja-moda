'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Adicao rapida a partir do card.
 *
 * Quando a peca tem mais de um tamanho, o tamanho e escolhido aqui mesmo: adicionar
 * ao carrinho sem tamanho seria adivinhar pelo cliente. O tamanho selecionado fica
 * marcado com um check depois da adicao, para confirmar o que foi enviado.
 */

export interface QuickAddModel {
  slug: string;
  name: string;
  sizes: string[];
  defaultColorSlug: string;
  inStock: boolean;
}

export function QuickAdd({
  model,
  className,
  layout = 'overlay',
}: {
  model: QuickAddModel;
  className?: string;
  layout?: 'overlay' | 'block';
}) {
  const { add } = useCart();
  const [addedSize, setAddedSize] = useState<string | null>(null);

  if (!model.inStock) {
    return (
      <p className={cn('type-label text-label text-muted', className)}>Sem estoque no momento</p>
    );
  }

  function addSize(size: string) {
    add({ productSlug: model.slug, colorSlug: model.defaultColorSlug, size });
    setAddedSize(size);
  }

  if (model.sizes.length <= 1) {
    const size = model.sizes[0] ?? 'Único';
    return (
      <button
        type="button"
        onClick={() => addSize(size)}
        className={buttonClass({
          variant: 'primary',
          size: 'sm',
          className: cn(layout === 'block' && 'w-full', className),
        })}
      >
        {addedSize ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
        {addedSize ? 'Na sacola' : 'Adicionar'}
      </button>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="type-label text-label sr-only">Escolha o tamanho</span>
      <ul className="flex flex-wrap gap-1.5">
        {model.sizes.map((size) => (
          <li key={size}>
            <button
              type="button"
              onClick={() => addSize(size)}
              aria-label={`Adicionar ${model.name} tamanho ${size} à sacola`}
              className={cn(
                'type-label border-border text-label bg-surface/90 hover:border-primary hover:bg-primary hover:text-primary-foreground inline-flex h-8 min-w-9 items-center justify-center border px-2 backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-[var(--duration-fast)] active:scale-95',
                addedSize === size && 'border-primary bg-primary text-primary-foreground pop-in',
              )}
            >
              {size}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
