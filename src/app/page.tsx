import { CampaignBanner } from '@/components/marketing/CampaignBanner';
import { AboutBrand } from '@/components/marketing/AboutBrand';
import { Benefits } from '@/components/marketing/Benefits';
import { InstagramGrid } from '@/components/marketing/InstagramGrid';
import { Newsletter } from '@/components/marketing/Newsletter';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { CollectionBanner } from '@/components/collections/CollectionBanner';
import { Hero } from '@/components/hero/Hero';
import { Lookbook } from '@/components/lookbook/Lookbook';
import { ProductSection } from '@/components/products/ProductSection';
import { Container } from '@/components/layout/Container';
import { Section, SectionHeader } from '@/components/layout/Section';
import { brandBenefits } from '@/data/brand';
import { instagramPosts } from '@/data/content';
import { lookbook } from '@/data/lookbook';
import {
  getCategories,
  getCatalogSummary,
  getCollectionBySlug,
  getFeaturedProducts,
  getNewArrivals,
  getSaleProducts,
} from '@/lib/catalog';
import { photo } from '@/lib/images';

/**
 * Home.
 *
 * A ordem das secoes segue o caminho de quem chega sem conhecer a marca:
 * marca → colecao → produto → desejo → compra. Cada bloco e um Server Component;
 * os unicos componentes cliente sao os que realmente precisam de estado — o card
 * com adicao rapida, o botao de favorito, o formulario e a sacola.
 *
 * O metadata da home vem do layout raiz, que ja declara titulo, descricao e
 * canonical da raiz do site.
 */
export default function HomePage() {
  const categories = getCategories({ featuredOnly: true });
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const saleProducts = getSaleProducts();
  const essential = getCollectionBySlug('essential-26');
  const summary = getCatalogSummary();

  return (
    <>
      <Hero variant="editorial" />

      <CampaignBanner
        title="Nova coleção"
        highlight="Essential 26"
        description="Peças para todos os momentos. Malha de algodão, modelagem revista e cores que combinam entre si."
        ctaLabel="Explorar coleção"
        ctaHref="/colecoes/essential-26"
        image={photo('campaignPrimary')}
        imageAlt="Modelo em ambiente urbano com uma peça da coleção Essential 26"
        className="pt-8"
      />

      <Section id="categorias" labelledBy="categorias-titulo">
        <Container>
          <SectionHeader
            id="categorias-titulo"
            title="Explore por categoria"
            description={`${summary.productCount} peças organizadas por tipo e por público, para você chegar direto no que procura.`}
          />
          <CategoryGrid categories={categories} variant="editorial" className="mt-10" />
        </Container>
      </Section>

      <ProductSection
        id="mais-desejados"
        title="Mais desejados"
        description="As peças que mais saem, com as avaliações mais altas do catálogo."
        products={featured}
        priorityCount={2}
        actionLabel="Ver todos os produtos"
        actionHref="/produtos"
      />

      {essential ? (
        <CollectionBanner
          collection={essential}
          ctaLabel="Ver coleção"
          ctaHref={`/colecoes/${essential.slug}`}
        />
      ) : null}

      <Lookbook looks={lookbook} />

      <ProductSection
        id="acabou-de-chegar"
        title="Acabou de chegar"
        description="Lançamentos em lotes pequenos. Quando esgota, só volta se a modelagem se provar."
        products={newArrivals}
        actionLabel="Ver novidades"
        actionHref="/produtos?novidades=1"
      />

      <ProductSection
        id="selecao-especial"
        title="Seleção especial"
        description={`${summary.onSaleCount} peças de coleções anteriores com desconto. Mesmo produto, mesmo acabamento.`}
        products={saleProducts}
        tone="surface"
        actionLabel="Ver toda a seleção"
        actionHref="/colecoes/sale"
      />

      <Benefits benefits={brandBenefits} />

      <AboutBrand />

      <Newsletter />

      <InstagramGrid posts={instagramPosts} />
    </>
  );
}
