import { photo } from '@/lib/images';
import type { Testimonial } from '@/types';

/**
 * Depoimentos exibidos na home e na pagina da marca.
 * Conteudo demonstrativo: substitua por depoimentos reais antes de publicar.
 */
export const testimonials: Testimonial[] = [
  {
    id: 'depoimento-01',
    quote:
      'Comprei a Camiseta Essential em três cores. Caimento impecável, e depois de muitos lavados continua igual.',
    author: 'Marina Alves',
    role: 'Cliente desde 2024',
    city: 'Recife, PE',
    rating: 5,
  },
  {
    id: 'depoimento-02',
    quote:
      'A Calça Wide Leg resolveu meu dia a dia: uso no trabalho e no fim de semana sem trocar de roupa.',
    author: 'Camila Ribeiro',
    role: 'Arquiteta',
    city: 'São Paulo, SP',
    rating: 5,
  },
  {
    id: 'depoimento-03',
    quote:
      'Tecido firme, costura bem acabada e a modelagem oversized não fica largada demais. Virou minha peça de todo dia.',
    author: 'Rafael Menezes',
    role: 'Fotógrafo',
    city: 'Belo Horizonte, MG',
    rating: 4,
  },
  {
    id: 'depoimento-04',
    quote:
      'Troquei o tamanho do vestido sem nenhuma complicação e chegou em quatro dias. Atendimento direto pelo WhatsApp.',
    author: 'Letícia Andrade',
    role: 'Cliente desde 2025',
    city: 'Curitiba, PR',
    rating: 5,
  },
];

/** Retrato usado nas citacoes da home, quando houver espaco para imagem. */
export const testimonialPortrait = photo('instagram03');
