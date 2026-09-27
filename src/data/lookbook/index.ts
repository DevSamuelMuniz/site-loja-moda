import { photo } from '@/lib/images';
import type { LookbookLook } from '@/types';

/**
 * Lookbook.
 *
 * Cada look aponta para os slugs dos produtos que o compoem, para que a secao
 * "Inspire-se" leve a peca certa. Os slugs precisam existir em `src/data/products`.
 */
export const lookbook: LookbookLook[] = [
  {
    id: 'look-01',
    name: 'Look 01',
    caption: 'Camiseta Essential, Calça Wide Leg e Tênis Urban.',
    image: photo('lookbook01'),
    products: ['camiseta-essential', 'calca-wide-leg', 'tenis-urban'],
  },
  {
    id: 'look-02',
    name: 'Look 02',
    caption: 'Camisa Linen, Jeans Straight e Bolsa Tote.',
    image: photo('lookbook02'),
    products: ['camisa-linen', 'jeans-straight', 'bolsa-tote'],
  },
  {
    id: 'look-03',
    name: 'Look 03',
    caption: 'Vestido Flow com Bolsa Tote.',
    image: photo('lookbook03'),
    products: ['vestido-flow', 'bolsa-tote'],
  },
  {
    id: 'look-04',
    name: 'Look 04',
    caption: 'Jaqueta Urban, Calça Cargo e Tênis Urban.',
    image: photo('lookbook04'),
    products: ['jaqueta-urban', 'calca-cargo', 'tenis-urban'],
  },
  {
    id: 'look-05',
    name: 'Look 05',
    caption: 'Blazer Minimal com Calça Wide Leg.',
    image: photo('lookbook05'),
    products: ['blazer-minimal', 'calca-wide-leg'],
  },
  {
    id: 'look-06',
    name: 'Look 06',
    caption: 'Moletom Aura, Jeans Straight e Tênis Urban.',
    image: photo('lookbook06'),
    products: ['moletom-aura', 'jeans-straight', 'tenis-urban'],
  },
];
