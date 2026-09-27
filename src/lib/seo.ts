import { brandConfig } from '@/config/brand';
import { ecommerceConfig } from '@/config/ecommerce';
import { seoConfig } from '@/config/seo';
import { socialConfig } from '@/config/social';
import { productCompareAtPrice, productIsOnSale, productPrice } from '@/lib/catalog/filters';
import type { Product } from '@/types';
import type { Metadata } from 'next';

/**
 * SEO.
 *
 * Toda metadata, canonical e dado estruturado do site nasce aqui. As paginas
 * informam titulo, descricao e caminho; o resto — URL absoluta, Open Graph,
 * Twitter Card e schema — e montado de forma consistente.
 */

export interface MetadataInput {
  title: string;
  description: string;
  /** Caminho absoluto a partir da raiz, como `/produtos/camiseta-essential`. */
  path: string;
  images?: string[];
  type?: 'website' | 'article';
  keywords?: string[];
  noIndex?: boolean;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${seoConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path,
  images,
  type = 'website',
  keywords,
  noIndex = false,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const gallery = images && images.length > 0 ? images : [seoConfig.defaultOgImage];

  return {
    title,
    description,
    keywords: keywords ?? seoConfig.keywords,
    alternates: { canonical: url },
    robots: noIndex || !seoConfig.allowIndexing ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: brandConfig.name,
      locale: seoConfig.ogLocale,
      images: gallery.map((image) => ({ url: absoluteUrl(image), alt: title })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      images: gallery.map((image) => absoluteUrl(image)),
    },
  };
}

/** Dado estruturado da organizacao, aplicado no layout raiz. */
export function organizationSchema(): Record<string, unknown> {
  const { address } = brandConfig;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandConfig.name,
    legalName: brandConfig.legalName,
    url: seoConfig.siteUrl,
    logo: absoluteUrl(brandConfig.favicon),
    slogan: brandConfig.slogan,
    description: brandConfig.shortDescription,
    email: brandConfig.email,
    telephone: brandConfig.phone,
    sameAs: socialConfig.links.filter((link) => link.enabled).map((link) => link.href),
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: 'BR',
    },
  };
}

/** Dado estruturado de produto, com oferta e disponibilidade. */
export function productSchema(
  product: Product,
  context: { categoryLabel: string; collectionLabel?: string; stock: number },
): Record<string, unknown> {
  const price = productPrice(product);
  const compareAt = productCompareAtPrice(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => absoluteUrl(image)),
    brand: { '@type': 'Brand', name: brandConfig.name },
    category: context.categoryLabel,
    ...(context.collectionLabel ? { isPartOf: context.collectionLabel } : {}),
    ...(product.colors.length > 0
      ? { color: product.colors.map((color) => color.name).join(', ') }
      : {}),
    ...(product.rating !== undefined
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount ?? 0,
            bestRating: 5,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/produtos/${product.slug}`),
      priceCurrency: ecommerceConfig.currency,
      price: price.toFixed(2),
      availability:
        context.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      ...(compareAt
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: price.toFixed(2),
              priceCurrency: ecommerceConfig.currency,
            },
          }
        : {}),
    },
    ...(productIsOnSale(product) ? { additionalProperty: 'Preço promocional' } : {}),
  };
}

export interface BreadcrumbInput {
  label: string;
  href?: string;
}

export function breadcrumbSchema(items: BreadcrumbInput[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

/** Dado estruturado de item listado, usado nas grades de categoria e colecao. */
export function itemListSchema(
  name: string,
  items: Array<{ name: string; slug: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(`/produtos/${item.slug}`),
    })),
  };
}
