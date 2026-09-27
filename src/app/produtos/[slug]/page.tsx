import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { ProductDetails } from '@/components/products/ProductDetails';
import { ProductPurchase } from '@/components/products/ProductPurchase';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { allProducts, categoryLabels, collectionLabels, getProductBySlug } from '@/lib/catalog';
import { productStock } from '@/lib/catalog/filters';
import { breadcrumbSchema, buildMetadata, productSchema } from '@/lib/seo';

/**
 * Pagina de produto.
 *
 * A pagina e renderizada no servidor: define metadata propria, publica o dado
 * estruturado da peca e monta os blocos de detalhe e relacionados. O unico trecho
 * cliente e o painel de compra, que precisa guardar cor, tamanho e quantidade
 * enquanto a pessoa decide.
 */

export function generateStaticParams() {
  return allProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: 'Produto não encontrado',
      description: 'A peça informada não está mais no catálogo.',
      path: `/produtos/${slug}`,
      noIndex: true,
    });
  }

  const availability = productStock(product) > 0 ? 'Disponível' : 'Sem estoque';

  return buildMetadata({
    title: product.name,
    description: `${product.description} ${availability} nos tamanhos ${product.sizes.join(', ')}.`,
    path: `/produtos/${product.slug}`,
    images: product.images,
    keywords: [product.name, ...product.tags, product.sku],
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const categoryLabel = categoryLabels()[product.category] ?? product.category;
  const collectionLabel = product.collection ? collectionLabels()[product.collection] : undefined;

  const crumbs = [
    { label: 'Início', href: '/' },
    { label: 'Produtos', href: '/produtos' },
    { label: categoryLabel, href: `/categoria/${product.category}` },
    { label: product.name },
  ];

  return (
    <>
      <Container className="py-8 lg:py-10">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 lg:mt-10">
          <ProductPurchase
            product={product}
            categoryLabel={categoryLabel}
            collectionLabel={collectionLabel}
          />
        </div>
      </Container>

      <JsonLd
        data={productSchema(product, {
          categoryLabel,
          collectionLabel,
          stock: productStock(product),
        })}
      />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <ProductDetails product={product} />
      <RelatedProducts product={product} />
    </>
  );
}
