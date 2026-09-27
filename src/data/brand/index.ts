import { brandConfig } from '@/config/brand';
import { photo } from '@/lib/images';
import type { BrandStoryPoint } from '@/types';

/**
 * Conteudo editorial da marca.
 * A secao "Sobre" da home e a pagina `/sobre` leem daqui.
 */

export const brandStory = {
  headline: 'Mais que roupa. É identidade.',
  intro: brandConfig.longDescription,
  /** Paragrafo maior, usado na pagina `/sobre`. */
  body: [
    'Cada coleção começa com uma pergunta simples: o que você veste quando ninguém está dizendo o que vestir? A partir dela escolhemos tecidos, ajustamos modelagens e cortamos o que sobra.',
    'Trabalhamos com pequenos lotes e produção local, o que permite revisar cada peça antes de ela chegar até você. O resultado são roupas que duram mais do que a estação em que foram lançadas.',
  ],
  image: photo('aboutAtelier'),
  imageCaption: 'Ateliê AURA, onde as modelagens são ajustadas peça por peça.',
  ctaLabel: 'Conheça a AURA',
  ctaHref: '/sobre',
} as const;

export const brandStoryPoints: BrandStoryPoint[] = [
  {
    title: 'Modelagem revisada',
    description:
      'Cada peça passa por prova em três tipos de corpo antes de entrar em produção. Modelagem é ajuste, não tamanho.',
  },
  {
    title: 'Tecido escolhido a dedo',
    description:
      'Priorizamos fibras naturais e fornecedores que informam a composição real. O toque da peça é parte do desenho.',
  },
  {
    title: 'Produção em pequenos lotes',
    description:
      'Menos estoque parado, mais controle de qualidade. Quando uma peça esgota, ela volta apenas se fizer sentido.',
  },
];

/**
 * Beneficios exibidos na home.
 * Os textos sao propositalmente genericos: as condicoes reais de frete e troca
 * ficam em `src/config/ecommerce.ts` e devem ser revisadas antes de publicar.
 */
export const brandBenefits = [
  {
    id: 'frete',
    title: 'Frete grátis',
    description: 'Em compras acima do valor configurado para a loja.',
    icon: 'truck',
  },
  {
    id: 'seguranca',
    title: 'Compra segura',
    description: 'Seus dados trafegam em conexão criptografada.',
    icon: 'shield',
  },
  {
    id: 'troca',
    title: 'Troca fácil',
    description: 'Processo simples e transparente, sem letras miúdas.',
    icon: 'refresh',
  },
  {
    id: 'atendimento',
    title: 'Atendimento direto',
    description: 'Fale com a gente pelo WhatsApp em horário comercial.',
    icon: 'headset',
  },
] satisfies Array<{
  id: string;
  title: string;
  description: string;
  icon: 'truck' | 'shield' | 'refresh' | 'headset';
}>;
