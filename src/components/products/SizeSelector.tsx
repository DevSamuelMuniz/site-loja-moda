'use client';

import Link from 'next/link';
import { Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Seletor de tamanho.
 *
 * A grade vem do produto, entao pecas numericas (jeans, calcas) e letras convivem
 * sem nenhum caso especial. O botao do guia fica ao lado, no ponto em que a duvida
 * aparece.
 */
export function SizeSelector({
  sizes,
  value,
  onChange,
  onOpenGuide,
  className,
}: {
  sizes: string[];
  value: string;
  onChange: (size: string) => void;
  onOpenGuide: () => void;
  className?: string;
}) {
  if (sizes.length === 0) return null;

  return (
    <div className={cn(className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-body text-body-sm">
          <span className="text-muted">Tamanho:</span> <span className="text-primary">{value}</span>
        </p>
        <button
          type="button"
          onClick={onOpenGuide}
          className="type-body text-body-sm text-muted hover:text-primary inline-flex items-center gap-1.5 underline transition-colors"
        >
          <Ruler size={14} strokeWidth={1.6} aria-hidden="true" />
          Guia de tamanhos
        </button>
      </div>

      <ul role="radiogroup" aria-label="Tamanho" className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => {
          const active = size === value;

          return (
            <li key={size}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(size)}
                className={cn(
                  'type-body text-body-sm inline-flex h-11 min-w-11 items-center justify-center border px-3 tabular-nums transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary',
                )}
              >
                {size}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="type-body text-body-sm text-muted mt-3">
        Em dúvida entre dois tamanhos?{' '}
        <Link href="/contato" className="link-rule text-primary">
          Fale com o atendimento
        </Link>
        .
      </p>
    </div>
  );
}
