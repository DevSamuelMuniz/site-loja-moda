import type { CategoryAudience } from '@/types/category';

/** Uma variante de cor de um produto. */
export interface ProductColor {
  name: string;
  slug: string;
  /** Cor exibida no seletor e nas amostras da listagem. */
  hex: string;
  /** Imagem propria da variante. Quando ausente, usa a imagem principal. */
  image?: string;
  /**
   * SKU da cor. Opcional de proposito: no banco o codigo pertence a variacao (cor ×
   * tamanho), nao a cor. Onde a cor nao tem codigo, a interface cai para o SKU da variacao
   * selecionada e depois para o do produto.
   */
  sku?: string;
  stock: number;
  /** Preco proprio da variante, quando difere do preco do produto. */
  price?: number;
  compareAtPrice?: number;
}

/** Combinacao de cor e tamanho, com estoque e SKU proprios. */
export interface ProductVariant {
  id: string;
  colorSlug: string;
  size: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface ProductMeasurement {
  label: string;
  value: string;
}

/**
 * Produto do catalogo.
 *
 * Os campos `category` e `collection` guardam slugs, nunca nomes: a ligacao com
 * `src/data/categories` e `src/data/collections` acontece no repositorio.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Descricao curta usada em cards, listagens e resultados de busca. */
  description: string;
  /** Texto editorial exibido na pagina de produto. */
  story: string;
  category: string;
  collection?: string;
  /** Publico da peca; alimenta as categorias Feminino e Masculino. */
  audience: CategoryAudience;
  price: number;
  compareAtPrice?: number;
  /** Primeira imagem e a principal; a segunda aparece no hover do card. */
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  stock?: number;
  sku: string;
  composition: string;
  care: string[];
  details: string[];
  measurements: ProductMeasurement[];
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  /** Data ISO de entrada no catalogo, usada na ordenacao por novidades. */
  releasedAt: string;
  variants?: ProductVariant[];
}

/** Estoque derivado de um produto, para rotulos de disponibilidade. */
export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock';
