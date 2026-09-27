'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';

/**
 * Galeria do produto.
 *
 * A imagem principal aceita aproximacao no hover: a origem do zoom acompanha a
 * posicao do ponteiro, o que mostra exatamente a regiao que a pessoa esta olhando.
 * As miniaturas abaixo permitem trocar de angulo sem sair da pagina.
 */
export function ProductGallery({
  images,
  name,
  className,
}: {
  images: string[];
  name: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const active = images[activeIndex] ?? images[0];

  if (!active) return null;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        className="bg-surface relative aspect-[4/5] w-full overflow-hidden"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false);
          setOrigin('50% 50%');
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
      >
        <Image
          src={active}
          alt={`${name} — imagem ${activeIndex + 1} de ${images.length}`}
          fill
          priority
          sizes={imageSizes.productGalleryMain}
          className="object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)]"
          style={{ transformOrigin: origin, transform: zoomed ? 'scale(1.75)' : 'none' }}
        />
        <p className="type-label text-label text-muted bg-background/80 absolute right-3 bottom-3 px-2 py-1 backdrop-blur-sm max-lg:hidden">
          Passe o mouse para ampliar
        </p>
      </div>

      {images.length > 1 ? (
        <ul className="scroll-hidden flex gap-3 overflow-x-auto" aria-label="Imagens do produto">
          {images.map((image, index) => (
            <li key={`${image}-${index}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagem ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={cn(
                  'bg-surface relative block h-24 w-20 overflow-hidden border transition-colors',
                  index === activeIndex ? 'border-primary' : 'border-border hover:border-muted',
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes={imageSizes.productGalleryThumb}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
