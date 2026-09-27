export type CategoryAudience = 'feminino' | 'masculino' | 'unissex';

/**
 * Eixo de recorte da categoria:
 * - `audience`: por publico (Feminino, Masculino);
 * - `product`: por tipo de peca (Vestidos, Jeans, ...).
 *
 * A distincao existe porque as duas categorias de publico atravessam as categorias
 * de peca: uma camiseta pode ser feminina, masculina ou unissex.
 */
export type CategoryKind = 'audience' | 'product';

export interface Category {
  slug: string;
  name: string;
  kind: CategoryKind;
  description: string;
  image: string;
  audience: CategoryAudience;
  /** Categoria em destaque na home. */
  featured?: boolean;
  order: number;
}
