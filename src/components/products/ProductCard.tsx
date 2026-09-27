import Image from 'next/image';
import Link from 'next/link';
import { QuickAdd, type QuickAddModel } from '@/components/products/QuickAdd';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { formatDiscount } from '@/lib/format';
import { imageSizes } from '@/lib/images';
import {
  productCompareAtPrice,
  productIsOnSale,
  productPrice,
  productStock,
} from '@/lib/catalog/filters';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

/**
 * Card de produto.
 *
 * Sem moldura, sem sombra e sem cantos arredondados: a hierarquia vem da imagem e
 * do espaco. O segundo angulo entra no hover por troca de opacidade, o que mantem o
 * layout estavel e nao dispara animacao a cada rolagem.
 */

export type ProductCardVariant = 'minimal' | 'fashion' | 'compact' | 'featured';

const imageRatio: Record<ProductCardVariant, string> = {
  minimal: 'aspect-[4/5]',
  fashion: 'aspect-[4/5]',
  compact: 'aspect-[3/4]',
  featured: 'aspect-[3/4]',
};

export function ProductCard({
  product,
  variant = 'fashion',
  priority = false,
  className,
}: {
  product: Product;
  variant?: ProductCardVariant;
  priority?: boolean;
  className?: string;
}) {
  const href = `/produtos/${product.slug}`;
  const price = productPrice(product);
  const compareAtPrice = productCompareAtPrice(product);
  const discount = formatDiscount(price, compareAtPrice);
  const stock = productStock(product);
  const primaryImage = product.images[0];
  const hoverImage = product.images[1];
  const categoryLabel = product.tags[0] ?? '';

  const quickAdd: QuickAddModel = {
    slug: product.slug,
    name: product.name,
    sizes: product.sizes,
    defaultColorSlug: product.colors[0]?.slug ?? 'unico',
    inStock: stock > 0,
  };

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className={cn('bg-surface relative overflow-hidden', imageRatio[variant])}>
        <Link href={href} className="block h-full w-full" tabIndex={-1} aria-hidden="true">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt=""
              fill
              sizes={imageSizes.productCard}
              priority={priority}
              className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
            />
          ) : null}
          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={imageSizes.productCard}
              className="object-cover opacity-0 transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.02] group-hover:opacity-100"
            />
          ) : null}
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-col items-start gap-1.5">
            {product.isNew ? <Badge tone="dark">Novo</Badge> : null}
            {discount ? <Badge tone="sale">{discount}</Badge> : null}
            {stock === 0 ? <Badge tone="neutral">Esgotado</Badge> : null}
          </span>
        </div>

        <WishlistButton
          productSlug={product.slug}
          productName={product.name}
          className="absolute top-3 right-3"
        />

        {variant !== 'minimal' ? (
          <div className="absolute inset-x-3 bottom-3 translate-y-1 opacity-100 transition-[opacity,transform] duration-[var(--duration-base)] md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <QuickAdd model={quickAdd} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        {variant === 'compact' ? null : categoryLabel ? (
          <p className="type-body text-body-sm text-muted">{categoryLabel}</p>
        ) : null}

        <h3 className="type-heading text-heading-md leading-snug">
          <Link href={href} className="link-rule">
            {product.name}
          </Link>
        </h3>

        {variant === 'featured' ? (
          <p className="type-body text-body-sm text-muted max-w-[var(--measure-tight)]">
            {product.description}
          </p>
        ) : null}

        <Price price={price} compareAtPrice={compareAtPrice} className="mt-1" />

        {variant === 'minimal' || variant === 'compact' ? null : product.colors.length > 1 ? (
          <ul className="mt-2 flex items-center gap-1.5" aria-label="Cores disponíveis">
            {product.colors.map((color) => (
              <li key={color.slug}>
                <span
                  title={color.name}
                  className="border-border rounded-pill inline-block h-3 w-3 border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="sr-only">{color.name}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {variant === 'featured' && productIsOnSale(product) ? (
          <p className="type-body text-body-sm text-danger mt-1">
            Preço promocional por tempo limitado.
          </p>
        ) : null}
      </div>
    </article>
  );
}
