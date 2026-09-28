import { productCompareAtPrice, productPrice } from '@/lib/catalog/filters';
import { loadCatalog } from '@/lib/catalog/source';
import type { Product } from '@/types';

/**
 * Indice comercial.
 *
 * A sacola e os favoritos vivem no navegador, entao eles nao podem importar o catalogo
 * inteiro: seria enviar descricoes, composicao e medidas de todo o catalogo para o cliente.
 * Este modulo produz apenas o necessario para montar a sacola e a lista de favoritos, e o
 * layout raiz entrega esse indice aos providers uma unica vez.
 */

export interface CommerceEntry {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  /** Imagem por slug de cor, usada para trocar a miniatura da linha. */
  colorImages: Record<string, string>;
  colorNames: Record<string, string>;
}

function toEntry(product: Product): CommerceEntry {
  const colorImages: Record<string, string> = {};
  const colorNames: Record<string, string> = {};

  for (const color of product.colors) {
    colorNames[color.slug] = color.name;
    const image = color.image ?? product.images[0];
    if (image) colorImages[color.slug] = image;
  }

  return {
    slug: product.slug,
    name: product.name,
    price: productPrice(product),
    compareAtPrice: productCompareAtPrice(product) ?? null,
    image: product.images[0] ?? '',
    colorImages,
    colorNames,
  };
}

export async function getCommerceIndex(): Promise<CommerceEntry[]> {
  const { products } = await loadCatalog();
  return products.map(toEntry);
}

export function toCommerceEntry(product: Product): CommerceEntry {
  return toEntry(product);
}
