'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { ColorSelector } from '@/components/products/ColorSelector';
import { ProductGallery } from '@/components/products/ProductGallery';
import { SizeGuideModal } from '@/components/products/SizeGuideModal';
import { SizeSelector } from '@/components/products/SizeSelector';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { RatingStars } from '@/components/ui/RatingStars';
import { ecommerceConfig } from '@/config/ecommerce';
import { whatsappConfig } from '@/config/whatsapp';
import { trackViewItem } from '@/lib/analytics';
import {
  productCompareAtPrice,
  productIsOnSale,
  productPrice,
  productStock,
} from '@/lib/catalog/filters';
import { buildInstallmentPlan, whatsappLink } from '@/lib/format';
import type { Product } from '@/types';

/**
 * Compra do produto.
 *
 * E o unico componente cliente da pagina de produto, e existe por um motivo
 * concreto: cor e tamanho escolhidos precisam alimentar a galeria e o botao de
 * adicionar. A pagina em volta — trilha, detalhes e relacionados — continua sendo
 * renderizada no servidor.
 */
export function ProductPurchase({
  product,
  categoryLabel,
  collectionLabel,
}: {
  product: Product;
  categoryLabel: string;
  collectionLabel?: string;
}) {
  const price = productPrice(product);
  const compareAtPrice = productCompareAtPrice(product);
  const stock = productStock(product);
  const installment = buildInstallmentPlan(price);

  const [colorSlug, setColorSlug] = useState(product.colors[0]?.slug ?? 'unico');
  const [size, setSize] = useState(product.sizes[0] ?? 'Único');
  const [quantity, setQuantity] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const selectedColor = product.colors.find((color) => color.slug === colorSlug);
  const inWishlist = has(product.slug);

  const galleryImages = useMemo(() => {
    const primary = selectedColor?.image;
    if (!primary) return product.images;
    return [primary, ...product.images.filter((image) => image !== primary)];
  }, [product.images, selectedColor?.image]);

  useEffect(() => {
    trackViewItem(
      { slug: product.slug, name: product.name, price, category: categoryLabel },
      ecommerceConfig.currency,
    );
  }, [product.slug, product.name, price, categoryLabel]);

  const availability =
    stock === 0
      ? 'Sem estoque no momento'
      : stock <= ecommerceConfig.cart.lowStockThreshold
        ? `Últimas ${stock} peças`
        : 'Disponível em estoque';

  const whatsappHref = whatsappLink(
    whatsappConfig.productMessageTemplate.replace('{product}', product.name),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <ProductGallery key={colorSlug} images={galleryImages} name={product.name} />

      <div className="flex flex-col">
        <p className="type-body text-body-sm text-muted">
          {categoryLabel}
          {collectionLabel ? ` · ${collectionLabel}` : ''}
        </p>

        <h1 className="type-display text-display-lg mt-3">{product.name}</h1>

        <p className="type-body text-body-lg text-muted mt-4 max-w-[var(--measure-prose)]">
          {product.description}
        </p>

        {product.rating !== undefined ? (
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} className="mt-4" />
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <Price price={price} compareAtPrice={compareAtPrice} size="lg" />
          {installment ? (
            <p className="type-body text-body-sm text-muted">ou {installment.label}</p>
          ) : null}
          {productIsOnSale(product) ? (
            <p className="type-body text-body-sm text-danger">
              Preço promocional por tempo limitado.
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <ColorSelector colors={product.colors} value={colorSlug} onChange={setColorSlug} />

          <SizeSelector
            sizes={product.sizes}
            value={size}
            onChange={setSize}
            onOpenGuide={() => setGuideOpen(true)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={ecommerceConfig.cart.maxQuantityPerItem}
              label={product.name}
            />
            <Button
              variant="primary"
              size="lg"
              disabled={stock === 0}
              onClick={() => add({ productSlug: product.slug, colorSlug, size, quantity })}
              className="grow gap-2 sm:grow-0"
            >
              <ShoppingBag size={17} strokeWidth={1.6} aria-hidden="true" />
              {stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => toggle(product.slug)}
            aria-pressed={inWishlist}
            className="type-button text-body-sm hover:text-accent inline-flex items-center gap-2 self-start transition-colors"
          >
            <Heart
              size={16}
              strokeWidth={1.6}
              aria-hidden="true"
              className={inWishlist ? 'text-danger fill-current' : undefined}
            />
            {inWishlist ? 'Nos favoritos' : 'Adicionar aos favoritos'}
          </button>
        </div>

        <dl className="border-border mt-8 grid gap-x-6 gap-y-3 border-t pt-6 sm:grid-cols-2">
          <div>
            <dt className="type-body text-body-sm text-muted">Disponibilidade</dt>
            <dd className="type-body text-body">{availability}</dd>
          </div>
          <div>
            <dt className="type-body text-body-sm text-muted">Código da peça</dt>
            <dd className="type-body text-body tabular-nums">
              {selectedColor?.sku ?? product.sku}
            </dd>
          </div>
          <div>
            <dt className="type-body text-body-sm text-muted">Composição</dt>
            <dd className="type-body text-body">{product.composition}</dd>
          </div>
          <div>
            <dt className="type-body text-body-sm text-muted">Cores disponíveis</dt>
            <dd className="type-body text-body">
              {product.colors.map((color) => color.name).join(', ')}
            </dd>
          </div>
        </dl>

        {whatsappHref ? (
          <p className="type-body text-body-sm text-muted mt-6">
            Prefere falar com alguém?{' '}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="link-rule text-primary"
            >
              Tire dúvidas pelo WhatsApp
            </a>
            .
          </p>
        ) : null}
      </div>

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
