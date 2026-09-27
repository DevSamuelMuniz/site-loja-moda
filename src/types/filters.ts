/** Filtros e ordenacao do catalogo. */

export type SortKey = 'relevancia' | 'recentes' | 'menor-preco' | 'maior-preco' | 'mais-vendidos';

export interface SortOption {
  key: SortKey;
  label: string;
}

/** Filtros normalizados, ja independentes da forma como chegaram na URL. */
export interface ProductFilters {
  query: string;
  categories: string[];
  collections: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable: boolean;
  onlySale: boolean;
  onlyNew: boolean;
  sort: SortKey;
}

/** Um valor selecionavel de filtro, com a contagem de resultados que ele produz. */
export interface FacetValue {
  value: string;
  label: string;
  count: number;
  /** Amostra de cor, quando o filtro e por cor. */
  hex?: string;
}

export interface FilterFacets {
  categories: FacetValue[];
  collections: FacetValue[];
  sizes: FacetValue[];
  colors: FacetValue[];
  tags: FacetValue[];
  priceRange: { min: number; max: number };
  total: number;
}
