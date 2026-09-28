import type { MetadataRoute } from 'next';
import { seoConfig } from '@/config/seo';
import { allProducts, getCategories, getCollections } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';

/**
 * Sitemap.
 *
 * Inclui apenas enderecos que devem ser indexados: as paginas de sacola, favoritos e
 * resultado de busca ficam de fora, porque sao pessoais ou duplicam o catalogo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: '/', priority: 1 },
    { path: '/produtos', priority: 0.9 },
    { path: '/colecoes', priority: 0.8 },
    { path: '/sobre', priority: 0.6 },
    { path: '/contato', priority: 0.5 },
    { path: '/faq', priority: 0.5 },
    { path: '/trocas', priority: 0.4 },
    { path: '/frete', priority: 0.4 },
    { path: '/privacidade', priority: 0.3 },
    { path: '/termos', priority: 0.3 },
    { path: '/cookies', priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route.priority,
    })),
    ...(await getCategories()).map((category) => ({
      url: absoluteUrl(`/categoria/${category.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...(await getCollections()).map((collection) => ({
      url: absoluteUrl(`/colecoes/${collection.slug}`),
      lastModified: new Date(collection.releasedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(await allProducts()).map((product) => ({
      url: absoluteUrl(`/produtos/${product.slug}`),
      lastModified: new Date(product.releasedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    {
      url: absoluteUrl('/sitemap.xml'),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0,
      ...(seoConfig.allowIndexing ? {} : {}),
    },
  ];
}
