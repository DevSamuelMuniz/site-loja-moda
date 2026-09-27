import { analyticsConfig, analyticsEvents } from '@/config/analytics';

/**
 * Eventos de analytics.
 *
 * Nada e enviado enquanto a loja nao configurar um identificador de medicao
 * (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID` ou `NEXT_PUBLIC_META_PIXEL_ID`).
 * Nenhum identificador aparece no codigo.
 *
 * O envio acontece sem carregar script de terceiro por conta propria: se o
 * provedor estiver configurado, ele ja tera publicado `window.gtag`, `dataLayer`
 * ou `fbq`. Quando isso nao acontecer, o evento apenas nao sai.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents];

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export interface AnalyticsItem {
  slug: string;
  name: string;
  price: number;
  category?: string;
}

function toCommerceItems(items: AnalyticsItem[]): Array<Record<string, unknown>> {
  return items.map((item) => ({
    item_id: item.slug,
    item_name: item.name,
    price: item.price,
    ...(item.category ? { item_category: item.category } : {}),
  }));
}

/** Envia um evento para os provedores configurados. Nao faz nada se estiver desligado. */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (!analyticsConfig.enabled) return;
  if (typeof window === 'undefined') return;

  if (analyticsConfig.debug) {
    console.warn('[analytics]', event, payload);
  }

  const gtag = window.gtag;
  if (typeof gtag === 'function') gtag('event', event, payload);

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...payload });
  }

  const fbq = window.fbq;
  if (typeof fbq === 'function') {
    switch (event) {
      case analyticsEvents.viewItem:
        fbq('track', 'ViewContent', payload);
        break;
      case analyticsEvents.addToCart:
        fbq('track', 'AddToCart', payload);
        break;
      case analyticsEvents.beginCheckout:
        fbq('track', 'InitiateCheckout', payload);
        break;
      case analyticsEvents.search:
        fbq('track', 'Search', payload);
        break;
      default:
        fbq('trackCustom', event, payload);
    }
  }
}

export function trackViewItem(item: AnalyticsItem, currency: string): void {
  track(analyticsEvents.viewItem, {
    currency,
    value: item.price,
    items: JSON.stringify(toCommerceItems([item])),
  });
}

export function trackAddToCart(item: AnalyticsItem, quantity: number, currency: string): void {
  track(analyticsEvents.addToCart, {
    currency,
    value: item.price * quantity,
    quantity,
    items: JSON.stringify(toCommerceItems([item])),
  });
}

export function trackRemoveFromCart(item: AnalyticsItem, quantity: number, currency: string): void {
  track(analyticsEvents.removeFromCart, {
    currency,
    value: item.price * quantity,
    quantity,
    items: JSON.stringify(toCommerceItems([item])),
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], total: number, currency: string): void {
  track(analyticsEvents.beginCheckout, {
    currency,
    value: total,
    items: JSON.stringify(toCommerceItems(items)),
  });
}

export function trackSearch(term: string, results: number): void {
  track(analyticsEvents.search, { search_term: term, results });
}

export function trackViewCategory(slug: string, label: string): void {
  track(analyticsEvents.viewCategory, { category: slug, category_label: label });
}

export function trackAddToWishlist(slug: string): void {
  track(analyticsEvents.addToWishlist, { item_id: slug });
}

export function trackNewsletterSignup(source: string): void {
  track(analyticsEvents.newsletterSignup, { source });
}
