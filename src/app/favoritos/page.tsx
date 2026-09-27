import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WishlistView } from '@/components/wishlist/WishlistView';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Favoritos',
  description: 'As peças que você salvou para decidir depois.',
  path: '/favoritos',
  noIndex: true,
});

export default function WishlistPage() {
  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Favoritos' }]} />
      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Favoritos</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Peças que você guardou para decidir com calma.
        </p>
      </header>
      <div className="mt-10">
        <WishlistView />
      </div>
    </Container>
  );
}
