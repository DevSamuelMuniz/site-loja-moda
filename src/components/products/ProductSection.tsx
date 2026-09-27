import { Container } from '@/components/layout/Container';
import { Section, SectionHeader } from '@/components/layout/Section';
import { ButtonLink } from '@/components/ui/Button';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { ProductCardVariant } from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/**
 * Bloco de vitrine de produtos.
 *
 * A home repete esta estrutura cinco vezes — mais desejados, novidades, promocao e
 * relacionados usam a mesma composicao, mudando apenas titulo, conjunto e
 * variacao. Centralizar aqui evita cinco blocos quase identicos espalhados.
 */
export function ProductSection({
  id,
  title,
  description,
  products,
  cardVariant = 'fashion',
  columns = 'four',
  actionLabel,
  actionHref,
  priorityCount = 0,
  spacing = 'default',
  tone = 'background',
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  products: Product[];
  cardVariant?: ProductCardVariant;
  columns?: 'two' | 'three' | 'four';
  actionLabel?: string;
  actionHref?: string;
  priorityCount?: number;
  spacing?: 'default' | 'tight';
  tone?: 'background' | 'surface';
  className?: string;
}) {
  if (products.length === 0) return null;

  const headingId = id ? `${id}-titulo` : undefined;

  return (
    <Section
      id={id}
      spacing={spacing}
      labelledBy={headingId}
      className={cn(tone === 'surface' && 'bg-surface', className)}
    >
      <Container>
        <SectionHeader
          id={headingId}
          title={title}
          description={description}
          action={
            actionLabel && actionHref ? (
              <ButtonLink href={actionHref} variant="outline" size="sm">
                {actionLabel}
              </ButtonLink>
            ) : undefined
          }
        />
        <ProductGrid
          products={products}
          variant={cardVariant}
          columns={columns}
          priorityCount={priorityCount}
          className="mt-10"
        />
      </Container>
    </Section>
  );
}
