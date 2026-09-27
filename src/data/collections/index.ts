import { photo } from '@/lib/images';
import type { Collection } from '@/types';

/**
 * Colecoes do catalogo.
 *
 * A colecao `sale` e virtual: ela nao e atribuida a nenhum produto, e sim resolvida
 * a partir de `isSale` / `compareAtPrice` no repositorio (`src/lib/catalog`).
 */
export const collections: Collection[] = [
  {
    slug: 'essential-26',
    name: 'Essential 26',
    tagline: 'Peças para todos os momentos.',
    description:
      'A base do guarda-roupa: algodão penteado, modelagens retas e cores que combinam entre si. É a coleção que sustenta as outras.',
    image: photo('collectionEssential'),
    badge: 'Coleção',
    featured: true,
    order: 1,
    releasedAt: '2026-01-10',
  },
  {
    slug: 'urban',
    name: 'Urban',
    tagline: 'Inspirado no ritmo da cidade.',
    description:
      'Volumes maiores, tecidos resistentes e detalhes funcionais. Peças para quem passa o dia inteiro na rua.',
    image: photo('collectionUrban'),
    badge: 'Cápsula',
    featured: true,
    order: 2,
    releasedAt: '2025-11-05',
  },
  {
    slug: 'new-season',
    name: 'New Season',
    tagline: 'O que acabou de chegar.',
    description:
      'Os lançamentos da estação, em lotes pequenos. Quando esgota, só volta se a modelagem se provar.',
    image: photo('collectionNewSeason'),
    badge: 'Novidades',
    featured: true,
    order: 3,
    releasedAt: '2026-02-01',
  },
  {
    slug: 'sale',
    name: 'Sale',
    tagline: 'Seleção especial com preços reduzidos.',
    description:
      'Peças de coleções anteriores com desconto. Mesmo produto, mesmo acabamento, preço menor.',
    image: photo('collectionSale'),
    badge: 'até 40% off',
    featured: false,
    order: 4,
    releasedAt: '2026-01-20',
  },
];

/** Colecao virtual resolvida por promocao, e nao por vinculo direto no produto. */
export const SALE_COLLECTION_SLUG = 'sale';

/** Colecao atribuida aos lancamentos que nao pertencem a uma colecao nomeada. */
export const NEW_SEASON_COLLECTION_SLUG = 'new-season';
