import { brandConfig } from '@/config/brand';
import { photo } from '@/lib/images';

/**
 * SEO.
 *
 * `siteUrl` deve ser definido em producao por `NEXT_PUBLIC_SITE_URL`, porque
 * canonical, Open Graph, sitemap e robots dependem da URL absoluta.
 */

export interface SeoConfig {
  siteUrl: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
  /** Idioma no formato Open Graph, com underline. */
  ogLocale: string;
  languageTag: string;
  twitterHandle: string;
  defaultOgImage: string;
  /** Preenchido por busca em servico de verificacao, quando houver. */
  verification: { google: string; other: Record<string, string> };
  /** Desligue para bloquear indexacao em ambientes de homologacao. */
  allowIndexing: boolean;
  themeColor: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

export const seoConfig: SeoConfig = {
  siteUrl,
  titleTemplate: `%s | ${brandConfig.name}`,
  defaultTitle: `${brandConfig.name} — ${brandConfig.tagline}`,
  defaultDescription: `${brandConfig.slogan} ${brandConfig.shortDescription}`,
  keywords: [
    'loja de roupas',
    'moda feminina',
    'moda masculina',
    'vestidos',
    'camisetas',
    'jeans',
    'jaquetas',
    'acessorios',
    'colecao essencial',
  ],
  ogLocale: 'pt_BR',
  languageTag: 'pt-BR',
  twitterHandle: '@auramoda',
  defaultOgImage: photo('heroPrimary'),
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '', other: {} },
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false',
  themeColor: '#FAFAF8',
};
