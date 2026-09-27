'use client';

import { ArrowRight } from 'lucide-react';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/components/providers/CartProvider';
import { ButtonLink } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';

/**
 * Painel lateral da sacola.
 *
 * Abre automaticamente quando uma peca e adicionada, o que confirma a acao sem
 * tirar a pessoa da pagina em que ela estava.
 */
export function CartDrawer() {
  const {
    lines,
    catalog,
    totals,
    isDrawerOpen,
    closeDrawer,
    setQuantity,
    remove,
    saveForLater,
    hydrated,
  } = useCart();

  const entryFor = (slug: string) => catalog.find((entry) => entry.slug === slug);

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      title={lines.length > 0 ? `Sacola (${totals.itemCount})` : 'Sacola'}
      footer={
        lines.length > 0 ? (
          <div className="flex flex-col gap-4">
            <CartSummary totals={totals} showShippingNote={false} />
            <ButtonLink href="/carrinho" fullWidth onClick={closeDrawer}>
              Ver sacola e finalizar
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </ButtonLink>
            <button
              type="button"
              onClick={closeDrawer}
              className="type-button text-body-sm text-muted hover:text-primary transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        ) : null
      }
    >
      {!hydrated ? (
        <p className="type-body text-body text-muted">Carregando sua sacola…</p>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <p className="type-body text-body text-muted">
            Sua sacola está vazia. As peças que você adicionar ficam salvas neste navegador.
          </p>
          <ButtonLink href="/produtos" variant="outline" size="sm" onClick={closeDrawer}>
            Ver todos os produtos
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {lines.map((line) => (
            <CartLineItem
              key={line.key}
              line={line}
              entry={entryFor(line.productSlug)}
              onQuantityChange={(quantity) => setQuantity(line.key, quantity)}
              onRemove={() => remove(line.key)}
              onSaveForLater={() => saveForLater(line.key)}
              className="py-5 first:pt-0"
            />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
