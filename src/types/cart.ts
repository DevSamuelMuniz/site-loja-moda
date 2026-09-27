/**
 * Sacola e favoritos.
 *
 * As chaves de armazenamento vem de `src/config/ecommerce.ts`. A forma abaixo e a
 * que sera persistida, entao mudar de formato exige versionar a chave.
 */

export interface CartLine {
  /** Chave unica da linha: produto + cor + tamanho. */
  key: string;
  productSlug: string;
  colorSlug: string;
  size: string;
  quantity: number;
  /** Momento de entrada na sacola, usado para manter a ordem estavel. */
  addedAt: number;
}

export interface WishlistEntry {
  productSlug: string;
  addedAt: number;
}

export interface CartTotals {
  /** Soma das quantidades. */
  itemCount: number;
  /** Numero de linhas distintas. */
  lineCount: number;
  subtotal: number;
  /**
   * Economia acumulada em relacao ao preco anterior. E informativa: os precos
   * promocionais ja entram no subtotal, entao este valor nao e subtraido do total.
   */
  discount: number;
  shipping: number;
  total: number;
  /** Quanto falta para o frete gratis. `0` quando ja foi atingido ou esta desligado. */
  freeShippingRemaining: number;
}
