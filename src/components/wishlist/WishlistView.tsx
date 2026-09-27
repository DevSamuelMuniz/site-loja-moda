'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { imageSizes } from '@/lib/images';

/**
 * Favoritos.
 *
 * A lista usa o indice comercial que ja esta no cliente, entao a pagina nao precisa
 * carregar o catalogo inteiro para mostrar nome, preco e imagem. O botao leva para a
 * pagina da peca, porque escolher tamanho aqui seria adivinhar pelo cliente.
 */
export function WishlistView() {
  const { entries, hydrated, remove, clear } = useWishlist();
  const { catalog } = useCart();

  if (!hydrated) {
    return <p className="type-body text-body text-muted">Carregando seus favoritos…</p>;
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nenhuma peça salva ainda"
        description="Toque no coração de qualquer peça para guardá-la aqui. Os favoritos ficam salvos neste navegador e continuam disponíveis quando você voltar."
        action={
          <ButtonLink href="/produtos" variant="outline" size="sm">
            Ver todos os produtos
          </ButtonLink>
        }
      />
    );
  }

  const items = entries
    .map((entry) => ({
      entry,
      product: catalog.find((item) => item.slug === entry.productSlug),
    }))
    .filter(
      (
        item,
      ): item is {
        entry: (typeof entries)[number];
        product: NonNullable<(typeof item)['product']>;
      } => item.product !== undefined,
    );

  return (
    <div>
      <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <p className="type-body text-body text-muted">
          {items.length === 1 ? '1 peça salva' : `${items.length} peças salvas`}
        </p>
        <button
          type="button"
          onClick={clear}
          className="type-body text-body-sm text-muted hover:text-danger inline-flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
          Limpar favoritos
        </button>
      </div>

      <ul className="divide-border mt-2 flex flex-col divide-y">
        {items.map(({ product }) => (
          <li key={product.slug} className="py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/produtos/${product.slug}`}
                className="bg-surface relative block h-32 w-28 shrink-0 overflow-hidden"
              >
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes={imageSizes.cartLine}
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="type-heading text-heading-md">
                  <Link href={`/produtos/${product.slug}`} className="link-rule">
                    {product.name}
                  </Link>
                </h2>
                <p className="type-body text-body-sm text-muted">
                  {Object.values(product.colorNames).join(', ')}
                </p>
                <p className="type-body text-body">{formatCurrency(product.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href={`/produtos/${product.slug}`} size="sm">
                  <ShoppingBag size={15} strokeWidth={1.6} aria-hidden="true" />
                  Escolher tamanho
                </ButtonLink>
                <button
                  type="button"
                  onClick={() => remove(product.slug)}
                  className="type-body text-body-sm text-muted hover:text-danger inline-flex items-center gap-1.5 transition-colors"
                >
                  <Heart size={14} strokeWidth={1.6} aria-hidden="true" className="fill-current" />
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
