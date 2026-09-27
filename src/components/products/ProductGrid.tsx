import { ProductCard, type ProductCardVariant } from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/**
 * Grade de produtos.
 *
 * As colunas sao definidas pelo contexto: uma lista de quatro itens nao usa a mesma
 * grade de um catalogo inteiro, e `compact` permite encaixar a grade em uma coluna
 * estreita sem quebrar.
 */
export function ProductGrid({
  products,
  variant = 'fashion',
  columns = 'four',
  priorityCount = 0,
  className,
  gridClassName,
}: {
  products: Product[];
  variant?: ProductCardVariant;
  columns?: 'two' | 'three' | 'four';
  priorityCount?: number;
  className?: string;
  gridClassName?: string;
}) {
  const columnClass =
    columns === 'two'
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 'three'
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div
      className={cn(
        'grid gap-x-[var(--layout-grid-gap)] gap-y-[calc(var(--layout-grid-gap)*1.6)]',
        columnClass,
        gridClassName,
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
          variant={variant}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
