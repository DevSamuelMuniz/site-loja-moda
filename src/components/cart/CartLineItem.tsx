'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookmarkPlus, Trash2 } from 'lucide-react';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { formatCurrency } from '@/lib/format';
import { imageSizes } from '@/lib/images';
import type { CommerceEntry } from '@/lib/catalog/commerce';
import type { CartLine } from '@/types';

/**
 * Linha da sacola.
 *
 * Usada no painel lateral e na pagina da sacola, para que as duas superficies
 * mostrem exatamente a mesma informacao e tenham os mesmos controles.
 */
export function CartLineItem({
  line,
  entry,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  className,
}: {
  line: CartLine;
  entry: CommerceEntry | undefined;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater?: () => void;
  className?: string;
}) {
  if (!entry) {
    return (
      <li className={className}>
        <p className="type-body text-body-sm text-muted">
          Esta peça não está mais no catálogo.{' '}
          <button type="button" onClick={onRemove} className="underline">
            Remover da sacola
          </button>
        </p>
      </li>
    );
  }

  const image = entry.colorImages[line.colorSlug] ?? entry.image;
  const colorName = entry.colorNames[line.colorSlug] ?? line.colorSlug;
  const lineTotal = entry.price * line.quantity;

  return (
    <li className={className}>
      <div className="flex gap-4">
        <Link
          href={`/produtos/${line.productSlug}`}
          className="bg-surface relative block h-24 w-20 shrink-0 overflow-hidden"
        >
          {image ? (
            <Image src={image} alt="" fill sizes={imageSizes.cartLine} className="object-cover" />
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="type-heading text-body leading-snug">
                <Link href={`/produtos/${line.productSlug}`} className="link-rule">
                  {entry.name}
                </Link>
              </h3>
              <p className="type-body text-body-sm text-muted mt-1">
                {colorName} · Tamanho {line.size}
              </p>
            </div>
            <p className="type-body text-body shrink-0 tabular-nums">{formatCurrency(lineTotal)}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={line.quantity}
              onChange={onQuantityChange}
              label={`${entry.name}, tamanho ${line.size}`}
            />
            <button
              type="button"
              onClick={onRemove}
              className="type-body text-body-sm text-muted hover:text-danger inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} strokeWidth={1.6} aria-hidden="true" />
              Remover
            </button>
            {onSaveForLater ? (
              <button
                type="button"
                onClick={onSaveForLater}
                className="type-body text-body-sm text-muted hover:text-primary inline-flex items-center gap-1.5 transition-colors"
              >
                <BookmarkPlus size={14} strokeWidth={1.6} aria-hidden="true" />
                Salvar para depois
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
