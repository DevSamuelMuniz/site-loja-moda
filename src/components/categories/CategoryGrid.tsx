import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * Grade de categorias.
 *
 * O padrao `editorial` nao repete o mesmo retangulo: as duas primeiras categorias
 * ocupam mais espaco e as demais entram em colunas menores, o que cria hierarquia
 * em vez de uma parede de cards iguais. `grid` e `masonry` ficam disponiveis para
 * quem preferir a distribuicao uniforme.
 */

export type CategoryGridVariant = 'editorial' | 'grid' | 'split' | 'masonry';

export function CategoryGrid({
  categories,
  variant = 'editorial',
  className,
}: {
  categories: Category[];
  variant?: CategoryGridVariant;
  className?: string;
}) {
  if (categories.length === 0) return null;

  if (variant === 'grid' || variant === 'masonry') {
    return (
      <div
        className={cn(
          'grid gap-[var(--layout-grid-gap)]',
          variant === 'masonry'
            ? 'grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
          className,
        )}
      >
        {categories.map((category) => (
          <CategoryTile key={category.slug} category={category} />
        ))}
      </div>
    );
  }

  if (variant === 'split') {
    const [lead, ...rest] = categories;
    if (!lead) return null;

    return (
      <div className={cn('grid gap-[var(--layout-grid-gap)] lg:grid-cols-[1.4fr_1fr]', className)}>
        <CategoryTile category={lead} large />
        <ul className="grid grid-cols-2 gap-[var(--layout-grid-gap)]">
          {rest.map((category) => (
            <li key={category.slug}>
              <CategoryTile category={category} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const [first, second, ...rest] = categories;

  return (
    <div
      className={cn('grid gap-[var(--layout-grid-gap)] lg:grid-cols-3 lg:grid-rows-2', className)}
    >
      {first ? (
        <div className="lg:row-span-2">
          <CategoryTile category={first} large />
        </div>
      ) : null}
      {second ? (
        <div className="lg:col-span-2">
          <CategoryTile category={second} wide />
        </div>
      ) : null}
      {rest.map((category) => (
        <div key={category.slug}>
          <CategoryTile category={category} />
        </div>
      ))}
    </div>
  );
}

function CategoryTile({
  category,
  large = false,
  wide = false,
  className,
}: {
  category: Category;
  large?: boolean;
  wide?: boolean;
  className?: string;
}) {
  const ratio = wide ? 'aspect-[16/9]' : large ? 'aspect-[3/4] lg:aspect-[4/5]' : 'aspect-[3/4]';

  return (
    <Link
      href={`/categoria/${category.slug}`}
      className={cn('group relative block overflow-hidden', ratio, className)}
    >
      <Image
        src={category.image}
        alt=""
        fill
        sizes={imageSizes.categoryTile}
        className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="type-heading text-heading-md text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
          {category.name}
        </span>
        <ArrowRight
          size={18}
          strokeWidth={1.6}
          aria-hidden="true"
          className="translate-x-[-4px] text-white opacity-0 transition-[opacity,transform] duration-[var(--duration-base)] group-hover:translate-x-0 group-hover:opacity-100"
        />
      </span>
    </Link>
  );
}
