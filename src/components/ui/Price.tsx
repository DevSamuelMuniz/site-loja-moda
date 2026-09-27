import { formatCurrency, formatDiscount } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Preco.
 *
 * Quando existe preco anterior, ele aparece riscado ao lado do valor atual com o
 * percentual de desconto. A decisao de mostrar o desconto fica aqui, nao no card.
 */
export function Price({
  price,
  compareAtPrice,
  size = 'md',
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const discount = formatDiscount(price, compareAtPrice);
  const sizeClass =
    size === 'lg' ? 'text-heading-md' : size === 'sm' ? 'text-body-sm' : 'text-body';

  return (
    <span className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('type-heading tabular-nums', sizeClass)}>{formatCurrency(price)}</span>
      {compareAtPrice && compareAtPrice > price ? (
        <span className="type-body text-body-sm text-muted tabular-nums line-through">
          {formatCurrency(compareAtPrice)}
        </span>
      ) : null}
      {discount ? <span className="type-label text-label text-danger">{discount}</span> : null}
    </span>
  );
}
