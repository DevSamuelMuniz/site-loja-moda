import type { FaqItem } from '@/types';

/**
 * Perguntas frequentes.
 *
 * As respostas evitam qualquer condicao definitiva: elas apontam para a
 * configuracao da loja, que e o lugar correto para definir prazo e frete.
 */
export const faqItems: FaqItem[] = [
  {
    id: 'faq-01',
    group: 'Pedidos',
    question: 'Como acompanho o status do meu pedido?',
    answer:
      'Depois da confirmação da compra você recebe um e-mail com o código de rastreio. A partir dele é possível acompanhar cada etapa da entrega no site da transportadora.',
  },
  {
    id: 'faq-02',
    group: 'Pedidos',
    question: 'Posso alterar ou cancelar um pedido depois de finalizar?',
    answer:
      'Sim, enquanto o pedido ainda não tiver sido despachado. Fale com o atendimento pelo WhatsApp informando o número do pedido e a alteração desejada.',
  },
  {
    id: 'faq-03',
    group: 'Pedidos',
    question: 'Os produtos têm garantia?',
    answer:
      'Sim. Qualquer defeito de fabricação pode ser reportado pelo canal de atendimento, com foto da peça e número do pedido. A partir daí combinamos a troca ou o reparo.',
  },
  {
    id: 'faq-04',
    group: 'Tamanhos',
    question: 'Como escolho o tamanho certo?',
    answer:
      'Cada página de produto traz o botão "Guia de tamanhos", com as medidas de referência em centímetros. Se ainda ficar em dúvida, envie suas medidas pelo WhatsApp que ajudamos a escolher.',
  },
  {
    id: 'faq-05',
    group: 'Tamanhos',
    question: 'A modelagem é fiel ao tamanho indicado?',
    answer:
      'Sim. Peças de malha têm caimento mais ajustado e peças de tecido plano seguem a medida da tabela. Quando a peça é oversized, isso está destacado na descrição.',
  },
  {
    id: 'faq-06',
    group: 'Entrega',
    question: 'Quanto tempo leva para chegar?',
    answer:
      'O prazo é calculado no checkout, de acordo com o seu CEP. As faixas de prazo configuradas para a loja aparecem também na página de política de envio.',
  },
  {
    id: 'faq-07',
    group: 'Entrega',
    question: 'O frete é grátis?',
    answer:
      'Há frete grátis acima do valor mínimo configurado pela loja. Abaixo desse valor, é cobrada uma taxa fixa, sempre visível antes de finalizar a compra.',
  },
  {
    id: 'faq-08',
    group: 'Trocas',
    question: 'Como funciona a troca de tamanho?',
    answer:
      'Você tem um prazo configurado pela loja, contado a partir do recebimento, para solicitar troca sem custo de envio. O passo a passo está na página de trocas e devoluções.',
  },
  {
    id: 'faq-09',
    group: 'Trocas',
    question: 'Recebi uma peça diferente do que pedi. E agora?',
    answer:
      'Nos avise pelo WhatsApp com uma foto da peça e da etiqueta. Nesse caso o envio da peça correta e a coleta da peça errada ficam por nossa conta.',
  },
  {
    id: 'faq-10',
    group: 'Pagamento',
    question: 'Quais formas de pagamento a loja aceita?',
    answer:
      'As formas de pagamento aparecem no checkout no momento da compra. O checkout online desta versão está desativado e o pedido é finalizado pelo atendimento.',
  },
  {
    id: 'faq-11',
    group: 'Pagamento',
    question: 'Consigo parcelar minha compra?',
    answer:
      'O parcelamento disponível é o configurado pela loja e aparece na página de cada produto, com o valor de cada parcela e a informação sobre juros.',
  },
  {
    id: 'faq-12',
    group: 'Conta',
    question: 'Preciso criar uma conta para comprar?',
    answer:
      'Não. Os favoritos e a sacola ficam salvos no seu navegador, sem necessidade de cadastro. A conta de cliente entra na próxima fase da loja.',
  },
];

/** Agrupamentos na ordem em que aparecem na pagina. */
export const faqGroups = [
  'Pedidos',
  'Tamanhos',
  'Entrega',
  'Trocas',
  'Pagamento',
  'Conta',
] as const;
