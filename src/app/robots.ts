import type { MetadataRoute } from 'next';
import { seoConfig } from '@/config/seo';
import { absoluteUrl } from '@/lib/seo';

/**
 * robots.txt.
 *
 * Quando `NEXT_PUBLIC_ALLOW_INDEXING=false`, todo o site e bloqueado — util em
 * homologacao. Em producao, apenas as paginas pessoais e de resultado de busca ficam
 * fora do rastreamento.
 */
export default function robots(): MetadataRoute.Robots {
  const privateRoutes = ['/carrinho', '/favoritos', '/busca'];

  return {
    rules: seoConfig.allowIndexing
      ? [{ userAgent: '*', allow: '/', disallow: privateRoutes }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: seoConfig.siteUrl,
  };
}
