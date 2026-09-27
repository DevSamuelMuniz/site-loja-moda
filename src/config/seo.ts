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

/**
 * Resolve a URL absoluta do site.
 *
 * Aceita valor ausente, em branco ou sem protocolo. Uma variavel de ambiente criada
 * vazia no painel da hospedagem chega como string vazia (nao `undefined`), e
 * `new URL('')` derruba o build inteiro. Aqui isso cai no padrao local, e um valor sem
 * `https://` recebe o protocolo em vez de quebrar.
 */
function resolveSiteUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return 'http://localhost:3000';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

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
