import { photo } from '@/lib/images';
import type { Category } from '@/types';

/**
 * Categorias do catalogo.
 *
 * A ordem define a exibicao na grade da home e no menu de filtros. `featured`
 * controla o que aparece na secao "Explore por categoria".
 */
export const categories: Category[] = [
  {
    slug: 'feminino',
    name: 'Feminino',
    kind: 'audience',
    description: 'Peças pensadas para o corpo feminino, do básico ao statement.',
    image: photo('categoryFeminino'),
    audience: 'feminino',
    featured: true,
    order: 1,
  },
  {
    slug: 'masculino',
    name: 'Masculino',
    kind: 'audience',
    description: 'Modelagens retas, tecidos firmes e acabamento limpo.',
    image: photo('categoryMasculino'),
    audience: 'masculino',
    featured: true,
    order: 2,
  },
  {
    slug: 'vestidos',
    name: 'Vestidos',
    kind: 'product',
    description: 'Do dia a dia ao jantar, com modelagens que não pedem ajuste.',
    image: photo('categoryVestidos'),
    audience: 'feminino',
    featured: true,
    order: 3,
  },
  {
    slug: 'camisetas',
    name: 'Camisetas',
    kind: 'product',
    description: 'Malha de algodão, golas reforçadas e caimento confiável.',
    image: photo('categoryCamisetas'),
    audience: 'unissex',
    featured: true,
    order: 4,
  },
  {
    slug: 'camisas',
    name: 'Camisas',
    kind: 'product',
    description: 'Linho e algodão em peças que funcionam no trabalho e fora dele.',
    image: photo('categoryCamisas'),
    audience: 'unissex',
    featured: true,
    order: 5,
  },
  {
    slug: 'calcas',
    name: 'Calças',
    kind: 'product',
    description: 'Wide leg, cargo e retas: escolha pelo caimento, não pelo número.',
    image: photo('categoryCalcas'),
    audience: 'unissex',
    featured: true,
    order: 6,
  },
  {
    slug: 'jeans',
    name: 'Jeans',
    kind: 'product',
    description: 'Denim de gramatura média, com lavagens discretas e duráveis.',
    image: photo('categoryJeans'),
    audience: 'unissex',
    featured: true,
    order: 7,
  },
  {
    slug: 'jaquetas',
    name: 'Jaquetas',
    kind: 'product',
    description: 'Jaquetas, moletons e casacos para sobrepor em qualquer estação.',
    image: photo('categoryJaquetas'),
    audience: 'unissex',
    featured: true,
    order: 8,
  },
  {
    slug: 'acessorios',
    name: 'Acessórios',
    kind: 'product',
    description: 'Tênis, bolsas e peças pequenas que fecham o look.',
    image: photo('categoryAcessorios'),
    audience: 'unissex',
    featured: true,
    order: 9,
  },
];
