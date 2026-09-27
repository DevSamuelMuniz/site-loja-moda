'use client';

import { ecommerceConfig } from '@/config/ecommerce';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CartTotals } from '@/types';

/**
 * Resumo de valores da sacola.
 *
 * A economia aparece como informacao, nunca como desconto subtraido: o preco
 * promocional ja entrou no subtotal. O frete mostra a regra configurada ate que o
 * CEP seja calculado no checkout.
 */
export function CartSummary({
  totals,
  className,
  showShippingNote = true,
}: {
  totals: CartTotals;
  className?: string;
  showShippingNote?: boolean;
}) {
  const { freeShippingThreshold } = ecommerceConfig.shipping;

  return (
    <dl className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="type-body text-body text-muted">Subtotal</dt>
        <dd className="type-body text-body tabular-nums">{formatCurrency(totals.subtotal)}</dd>
      </div>

      {totals.discount > 0 ? (
        <div className="flex items-baseline justify-between gap-4">
          <dt className="type-body text-body text-muted">Você economiza</dt>
          <dd className="type-body text-body text-danger tabular-nums">
            {formatCurrency(totals.discount)}
          </dd>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between gap-4">
        <dt className="type-body text-body text-muted">Frete</dt>
        <dd className="type-body text-body tabular-nums">
          {ecommerceConfig.checkout.enabled
            ? formatCurrency(totals.shipping)
            : ecommerceConfig.shipping.pendingLabel}
        </dd>
      </div>

      {showShippingNote ? (
        <div className="flex flex-col gap-2">
          {freeShippingThreshold !== null ? (
            <div className="bg-border h-px w-full overflow-hidden">
              <div
                className="bg-accent h-px transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
                style={{
                  width: `${Math.min(100, Math.round((totals.subtotal / freeShippingThreshold) * 100))}%`,
                }}
              />
            </div>
          ) : null}
          <p className="type-body text-body-sm text-muted">
            {totals.freeShippingRemaining > 0
              ? `Faltam ${formatCurrency(totals.freeShippingRemaining)} para o frete grátis.`
              : freeShippingThreshold !== null
                ? 'Frete grátis liberado para este pedido.'
                : ecommerceConfig.shipping.note}
          </p>
        </div>
      ) : null}

      <div className="border-border mt-1 flex items-baseline justify-between gap-4 border-t pt-3">
        <dt className="type-heading text-heading-md">Total</dt>
        <dd className="type-heading text-heading-md tabular-nums">
          {formatCurrency(totals.total)}
        </dd>
      </div>
    </dl>
  );
}
