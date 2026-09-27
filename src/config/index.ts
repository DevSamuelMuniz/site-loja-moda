import { analyticsConfig } from '@/config/analytics';
import { brandConfig } from '@/config/brand';
import { ecommerceConfig } from '@/config/ecommerce';
import { navigationConfig } from '@/config/navigation';
import { newsBannerConfig } from '@/config/news';
import { seoConfig } from '@/config/seo';
import { socialConfig } from '@/config/social';
import { defaultThemeId, themes } from '@/config/theme';
import { whatsappConfig } from '@/config/whatsapp';

export { analyticsConfig, analyticsEvents } from '@/config/analytics';
export type { AnalyticsConfig } from '@/config/analytics';
export { brandConfig } from '@/config/brand';
export type { BrandAddress, BrandConfig, BrandLogo } from '@/config/brand';
export { ecommerceConfig } from '@/config/ecommerce';
export type { CouponConfig, EcommerceConfig, InstallmentConfig } from '@/config/ecommerce';
export { navigationConfig } from '@/config/navigation';
export type { FooterColumn, NavItem, NavLink, NavigationConfig } from '@/config/navigation';
export { newsBannerConfig } from '@/config/news';
export type { NewsBannerConfig } from '@/config/news';
export { seoConfig } from '@/config/seo';
export type { SeoConfig } from '@/config/seo';
export { socialConfig } from '@/config/social';
export type { SocialConfig, SocialLink } from '@/config/social';
export { defaultThemeId, fontStacks, themes } from '@/config/theme';
export { whatsappConfig } from '@/config/whatsapp';
export type { WhatsappConfig } from '@/config/whatsapp';

/**
 * Configuracao reunida da loja.
 *
 * Use este objeto quando um componente precisar de mais de uma area de
 * configuracao, e prefira os modulos individuais no resto do codigo.
 */
export const siteConfig = {
  brand: brandConfig,
  navigation: navigationConfig,
  news: newsBannerConfig,
  ecommerce: ecommerceConfig,
  seo: seoConfig,
  social: socialConfig,
  whatsapp: whatsappConfig,
  analytics: analyticsConfig,
  theme: { defaultThemeId, available: Object.keys(themes) },
} as const;

export type SiteConfig = typeof siteConfig;
