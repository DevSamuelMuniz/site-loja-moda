/**
 * Analytics.
 *
 * Nenhum identificador e escrito no codigo: todos vem de variaveis de ambiente.
 * Enquanto estiverem vazias, `analyticsConfig.enabled` continua falso e nenhum
 * script de terceiro e carregado e nenhum evento e enviado.
 */

export interface AnalyticsConfig {
  /** Vira verdadeiro automaticamente assim que algum identificador existir. */
  enabled: boolean;
  /** Registra os eventos no console durante o desenvolvimento. */
  debug: boolean;
  googleAnalytics: string;
  googleTagManager: string;
  metaPixel: string;
}

const googleAnalytics = process.env.NEXT_PUBLIC_GA_ID ?? '';
const googleTagManager = process.env.NEXT_PUBLIC_GTM_ID ?? '';
const metaPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export const analyticsConfig: AnalyticsConfig = {
  enabled: Boolean(googleAnalytics || googleTagManager || metaPixel),
  debug: process.env.NODE_ENV === 'development',
  googleAnalytics,
  googleTagManager,
  metaPixel,
};

/**
 * Eventos previstos na arquitetura. Cada nome corresponde a um evento disparado em
 * algum ponto do funil; o mapeamento para GA4 ou Meta Pixel acontece em
 * `src/lib/analytics.ts`.
 */
export const analyticsEvents = {
  viewItem: 'view_item',
  addToCart: 'add_to_cart',
  removeFromCart: 'remove_from_cart',
  beginCheckout: 'begin_checkout',
  search: 'search',
  viewCategory: 'view_category',
  addToWishlist: 'add_to_wishlist',
  newsletterSignup: 'newsletter_signup',
} as const;
