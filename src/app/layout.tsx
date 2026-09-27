import type { Metadata, Viewport } from 'next';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { NewsBanner } from '@/components/marketing/NewsBanner';
import { WhatsAppButton } from '@/components/marketing/WhatsAppButton';
import { Header } from '@/components/navigation/Header';
import { AppProviders } from '@/components/providers/AppProviders';
import { JsonLd } from '@/components/seo/JsonLd';
import { brandConfig } from '@/config/brand';
import { seoConfig } from '@/config/seo';
import { getSearchDocuments } from '@/lib/catalog';
import { getCommerceIndex } from '@/lib/catalog/commerce';
import { fontVariables } from '@/lib/fonts';
import { organizationSchema } from '@/lib/seo';
import { themeCss, themeStyleProps } from '@/lib/theme';
import './globals.css';

/**
 * Layout raiz.
 *
 * Responsabilidades: aplicar o tema ativo, publicar as fontes, montar a moldura do
 * site (faixa de aviso, header, faixa de novidades, conteudo, rodape) e entregar aos
 * providers o indice comercial que a sacola e os favoritos usam no cliente.
 *
 * A faixa de novidades fica fora do header de proposito: assim ela rola junto com a
 * pagina em vez de ocupar altura fixa no topo.
 */

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.keywords,
  applicationName: brandConfig.name,
  authors: [{ name: brandConfig.name }],
  creator: brandConfig.name,
  publisher: brandConfig.legalName,
  alternates: { canonical: '/' },
  icons: { icon: brandConfig.favicon },
  openGraph: {
    type: 'website',
    siteName: brandConfig.name,
    locale: seoConfig.ogLocale,
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [{ url: seoConfig.defaultOgImage, alt: brandConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: seoConfig.twitterHandle,
    creator: seoConfig.twitterHandle,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [seoConfig.defaultOgImage],
  },
  robots: seoConfig.allowIndexing ? undefined : { index: false, follow: false },
  verification:
    seoConfig.verification.google || Object.keys(seoConfig.verification.other).length > 0
      ? { google: seoConfig.verification.google, other: seoConfig.verification.other }
      : undefined,
};

export const viewport: Viewport = {
  themeColor: seoConfig.themeColor,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const commerceIndex = getCommerceIndex();
  const searchIndex = getSearchDocuments();

  return (
    <html lang={seoConfig.languageTag} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        {/* Tema ativo: o React eleva esta tag ao <head>, antes do primeiro paint. */}
        <style {...themeStyleProps}>{themeCss()}</style>
        <JsonLd data={organizationSchema()} />

        <a
          href="#conteudo"
          className="type-button bg-primary text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[var(--z-toast)] focus:px-4 focus:py-2"
        >
          Ir para o conteúdo
        </a>

        <AppProviders index={commerceIndex}>
          <AnnouncementBar />
          <Header searchIndex={searchIndex} />
          <NewsBanner />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </AppProviders>
      </body>
    </html>
  );
}
