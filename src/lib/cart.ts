import { ecommerceConfig } from '@/config/ecommerce';
import type { CommerceEntry } from '@/lib/catalog/commerce';
import type { CartLine, CartTotals } from '@/types';

/**
 * Matematica da sacola.
 *
 * Atencao ao significado de `discount`: e a economia acumulada em relacao ao preco
 * anterior (informativa). Ela NAO e subtraida do total, porque o preco promocional
 * ja entra em `subtotal`. A subtracao ficaria para um cupom, que ainda nao existe.
 */

export function buildCartKey(productSlug: string, colorSlug: string, size: string): string {
  return [productSlug, colorSlug, size].join('::');
}

export function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(ecommerceConfig.cart.maxQuantityPerItem, Math.round(quantity)));
}

export function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.key === 'string' &&
    typeof line.productSlug === 'string' &&
    typeof line.colorSlug === 'string' &&
    typeof line.size === 'string' &&
    typeof line.quantity === 'number' &&
    Number.isFinite(line.quantity)
  );
}

function resolvePrice(
  line: CartLine,
  index: CommerceEntry[],
): { price: number; compareAt: number | null } {
  const entry = index.find((item) => item.slug === line.productSlug);
  if (!entry) return { price: 0, compareAt: null };
  return { price: entry.price, compareAt: entry.compareAtPrice };
}

/** Calcula subtotal, economia, frete e total da sacola. */
export function computeTotals(lines: CartLine[], index: CommerceEntry[]): CartTotals {
  let itemCount = 0;
  let subtotal = 0;
  let discount = 0;

  for (const line of lines) {
    const { price, compareAt } = resolvePrice(line, index);
    itemCount += line.quantity;
    subtotal += price * line.quantity;
    if (compareAt && compareAt > price) discount += (compareAt - price) * line.quantity;
  }

  const { freeShippingThreshold, flatRate } = ecommerceConfig.shipping;
  const thresholdReached = freeShippingThreshold !== null && subtotal >= freeShippingThreshold;
  const shipping = lines.length === 0 || thresholdReached ? 0 : flatRate;
  const freeShippingRemaining =
    freeShippingThreshold !== null && lines.length > 0 && !thresholdReached
      ? Math.max(0, freeShippingThreshold - subtotal)
      : 0;

  return {
    itemCount,
    lineCount: lines.length,
    subtotal,
    discount,
    shipping,
    total: subtotal + shipping,
    freeShippingRemaining,
  };
}

export function emptyTotals(): CartTotals {
  return {
    itemCount: 0,
    lineCount: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    freeShippingRemaining: 0,
  };
}

/** Le uma lista persistida, descartando entradas corrompidas ou invalidas. */
export function parsePersistedLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}
