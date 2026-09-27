'use client';

import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types';

/**
 * Seletor de cor.
 *
 * Estrutura de `radiogroup`: uma escolha por vez, navegavel pelas setas do teclado.
 * A cor selecionada aparece tambem por escrito, porque amostra de cor sozinha nao
 * informa o nome para quem nao identifica a tonalidade.
 */
export function ColorSelector({
  colors,
  value,
  onChange,
  className,
}: {
  colors: ProductColor[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
}) {
  if (colors.length === 0) return null;

  const selected = colors.find((color) => color.slug === value) ?? colors[0];

  return (
    <div className={cn(className)}>
      <p className="type-body text-body-sm">
        <span className="text-muted">Cor:</span>{' '}
        <span className="text-primary">{selected?.name}</span>
      </p>

      <ul role="radiogroup" aria-label="Cor" className="mt-3 flex flex-wrap items-center gap-3">
        {colors.map((color) => {
          const active = color.slug === selected?.slug;
          const soldOut = color.stock === 0;

          return (
            <li key={color.slug}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(color.slug)}
                aria-label={`${color.name}${soldOut ? ' — sem estoque' : ''}`}
                className={cn(
                  'rounded-pill relative inline-flex h-8 w-8 items-center justify-center border transition-colors',
                  active ? 'border-primary' : 'border-border hover:border-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className="border-border rounded-pill h-6 w-6 border"
                  style={{ backgroundColor: color.hex }}
                />
                {soldOut ? (
                  <span aria-hidden="true" className="bg-danger absolute h-px w-8 rotate-45" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
