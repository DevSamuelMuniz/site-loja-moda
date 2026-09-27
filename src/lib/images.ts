import { photoLibrary, productArt, type PhotoKey, type ProductArtKind } from '@/data/media';

/**
 * Acesso a midia.
 *
 * Componentes nunca escrevem um caminho de imagem: eles pedem uma chave aqui.
 * Isso mantem o manifesto (`src/data/media.ts`) como unico ponto de troca.
 */

/** URL da fotografia editorial correspondente a chave. */
export function photo(key: PhotoKey): string {
  return photoLibrary[key];
}

/** Caminho da arte local de um produto. */
export function productArtwork(slug: string, kind: ProductArtKind = 'front'): string {
  return `${productArt.directory}/${slug}-${kind}.svg`;
}

/** Caminho da imagem de uma variante de cor, quando ela existir. */
export function colorArtwork(slug: string, colorSlug: string): string {
  return `${productArt.colorDirectory}/${slug}-${colorSlug}.svg`;
}

/**
 * Atributo `sizes` do `next/image`, por contexto de uso.
 * Sem isso o navegador baixa a imagem maior do que precisa em telas pequenas.
 */
export const imageSizes = {
  hero: '100vw',
  editorialFull: '100vw',
  categoryTile: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  productCard: '(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  productFeatured: '(min-width: 1024px) 33vw, 100vw',
  productGalleryThumb: '88px',
  productGalleryMain: '(min-width: 1024px) 46vw, (min-width: 640px) 60vw, 100vw',
  lookbook: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw',
  instagram: '(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw',
  cartLine: '96px',
  avatar: '56px',
} as const;
