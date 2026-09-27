export interface Collection {
  slug: string;
  name: string;
  /** Frase curta exibida em banners e listagens. */
  tagline: string;
  description: string;
  image: string;
  /** Selo opcional, como "Nova coleção" ou "até 40%". */
  badge?: string;
  featured?: boolean;
  order: number;
  releasedAt: string;
}
