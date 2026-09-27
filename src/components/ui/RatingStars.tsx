import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Nota do produto.
 * As estrelas sao decorativas: o valor acessivel vem do texto ao lado.
 */
export function RatingStars({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  const rounded = Math.round(rating);

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((position) => (
          <Star
            key={position}
            size={14}
            strokeWidth={1.5}
            className={position <= rounded ? 'fill-accent text-accent' : 'text-border'}
          />
        ))}
      </span>
      <span className="type-body text-body-sm text-muted">
        {rating.toFixed(1).replace('.', ',')}
        {reviewCount !== undefined ? ` (${reviewCount})` : ''}
      </span>
    </span>
  );
}
