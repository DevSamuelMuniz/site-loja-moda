/** Conteudo editorial e institucional do site. */

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  city: string;
  rating: number;
}

export interface LookbookLook {
  id: string;
  name: string;
  caption: string;
  image: string;
  /** Slugs dos produtos que compoem o look. */
  products: string[];
}

/** Icones disponiveis para os beneficios, mapeados em `src/components/marketing/Benefits`. */
export type BenefitIcon = 'truck' | 'shield' | 'refresh' | 'headset';

export interface BrandBenefit {
  id: string;
  title: string;
  description: string;
  icon: BenefitIcon;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Agrupamento exibido na pagina de perguntas frequentes. */
  group: string;
}

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Policy {
  slug: string;
  title: string;
  summary: string;
  /** Ultima revisao do texto, exibida no topo da pagina. */
  updatedAt: string;
  sections: PolicySection[];
}

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  href: string;
}

export interface SizeGuideRow {
  size: string;
  /** Valores na mesma ordem das colunas de `SizeGuide.columns`. */
  values: string[];
}

export interface SizeGuide {
  unit: string;
  columns: string[];
  rows: SizeGuideRow[];
  note: string;
}

export interface BrandStoryPoint {
  title: string;
  description: string;
}
