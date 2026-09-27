import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sacola',
  description: 'Revise as peças da sua sacola, ajuste quantidades e finalize o pedido.',
  path: '/carrinho',
  noIndex: true,
});

export default function CartPage() {
  return (
    <Container className="py-10 lg:py-14">
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Sacola' }]} />
      <header className="mt-6 max-w-[var(--measure-wide)]">
        <h1 className="type-display text-display-lg">Sacola</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Confira as peças, o tamanho e a cor antes de finalizar.
        </p>
      </header>
      <div className="mt-10">
        <CartView />
      </div>
    </Container>
  );
}
