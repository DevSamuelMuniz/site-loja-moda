'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Seletor de quantidade.
 *
 * O valor e anunciado em uma regiao `aria-live`, para que leitores de tela saibam
 * o resultado da acao sem precisarem refocar o campo.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn('border-border inline-flex items-center border', className)}>
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        aria-label={`Diminuir quantidade de ${label}`}
        className="text-muted hover:text-primary inline-flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-35"
      >
        <Minus size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
      <span
        role="status"
        aria-live="polite"
        className="type-body text-body min-w-8 text-center tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
        className="text-muted hover:text-primary inline-flex h-9 w-9 items-center justify-center transition-colors disabled:opacity-35"
      >
        <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </div>
  );
}
