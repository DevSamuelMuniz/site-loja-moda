import { brandConfig } from '@/config/brand';
import { ecommerceConfig } from '@/config/ecommerce';
import type { Policy } from '@/types';

/**
 * Politicas institucionais.
 *
 * Texto demonstrativo, escrito para ser revisado. Nenhuma regra de legislacao
 * especifica e afirmada aqui: prazos e condicoes vem de
 * `src/config/ecommerce.ts` e devem ser validados com a loja antes de publicar.
 */

const updatedAt = '2026-01-15';

export const policies: Policy[] = [
  {
    slug: 'trocas',
    title: 'Trocas e devoluções',
    summary:
      'Como solicitar a troca de uma peça, o que fazer em caso de defeito e em quanto tempo o pedido pode ser devolvido.',
    updatedAt,
    sections: [
      {
        heading: 'Prazo para solicitar',
        paragraphs: [
          `Você pode solicitar a troca ou a devolução em até ${ecommerceConfig.returns.windowDays} dias corridos, contados a partir da data de recebimento do pedido.`,
          ecommerceConfig.returns.note,
        ],
      },
      {
        heading: 'Como solicitar',
        paragraphs: [
          'Fale com o atendimento pelo WhatsApp informando o número do pedido e o motivo da troca. Vamos combinar a coleta ou o envio da peça e confirmar o endereço de retorno.',
        ],
        list: [
          'A peça precisa estar sem uso, sem lavagem e com as etiquetas originais fixadas.',
          'Envie a peça na embalagem original ou em embalagem equivalente.',
          'Guarde o comprovante de postagem até a conclusão da troca.',
        ],
      },
      {
        heading: 'Troca de tamanho ou cor',
        paragraphs: [
          'A primeira troca por tamanho ou cor não tem custo de envio. Se o item desejado estiver indisponível, você pode escolher outra peça de valor equivalente ou receber o reembolso.',
        ],
      },
      {
        heading: 'Peça com defeito',
        paragraphs: [
          'Se a peça apresentar defeito de fabricação, envie fotos da região afetada e da etiqueta. Nesse caso, tanto o envio da peça correta quanto a coleta ficam por nossa conta, independentemente do prazo de troca.',
        ],
      },
      {
        heading: 'Reembolso',
        paragraphs: [
          'O reembolso é feito pelo mesmo meio de pagamento usado na compra, depois de recebermos e conferirmos a peça devolvida. O prazo para o valor aparecer na sua fatura depende do meio de pagamento.',
        ],
      },
    ],
  },
  {
    slug: 'frete',
    title: 'Política de envio',
    summary:
      'Prazos, valores de frete e como o pedido é despachado e rastreado até o endereço de entrega.',
    updatedAt,
    sections: [
      {
        heading: 'Prazo de entrega',
        paragraphs: [
          `O prazo estimado é de ${ecommerceConfig.shipping.estimatedDays.min} a ${ecommerceConfig.shipping.estimatedDays.max} dias úteis após a confirmação do pagamento, variando conforme a região de entrega.`,
          'O prazo definitivo é sempre o calculado no checkout para o seu CEP.',
        ],
      },
      {
        heading: 'Frete grátis',
        paragraphs: [
          ecommerceConfig.shipping.freeShippingThreshold
            ? `Pedidos acima de R$ ${ecommerceConfig.shipping.freeShippingThreshold.toFixed(2).replace('.', ',')} têm frete grátis. Abaixo desse valor, é cobrada uma taxa fixa.`
            : 'O frete grátis está desativado nesta configuração da loja.',
        ],
      },
      {
        heading: 'Rastreamento',
        paragraphs: [
          'Depois do despacho você recebe um e-mail com o código de rastreio. O código pode levar até um dia útil para aparecer no site da transportadora.',
        ],
      },
      {
        heading: 'Tentativas de entrega',
        paragraphs: [
          'A transportadora faz mais de uma tentativa de entrega no endereço informado. Se todas falharem, o pedido retorna para nós e entramos em contato para combinar o reenvio.',
        ],
      },
    ],
  },
  {
    slug: 'privacidade',
    title: 'Política de privacidade',
    summary:
      'Quais dados a loja coleta, para que eles são usados e como você pode solicitar acesso ou exclusão.',
    updatedAt,
    sections: [
      {
        heading: 'Dados que coletamos',
        paragraphs: [
          'Coletamos apenas os dados necessários para processar um pedido e prestar atendimento: nome, e-mail, telefone, endereço de entrega e histórico de compras.',
        ],
        list: [
          'Dados de navegação: páginas visitadas e produtos vistos, usados para melhorar a loja.',
          'Dados de contato: apenas o necessário para responder a sua solicitação.',
          'Preferências locais: favoritos e sacola ficam salvos no seu próprio navegador.',
        ],
      },
      {
        heading: 'Como usamos os dados',
        paragraphs: [
          'Usamos seus dados para processar pedidos, prestar atendimento, cumprir obrigações fiscais e enviar comunicações que você autorizou. Não vendemos nem cedemos dados a terceiros para publicidade.',
        ],
      },
      {
        heading: 'Seus direitos',
        paragraphs: [
          'Você pode pedir a confirmação, a correção, a portabilidade ou a exclusão dos seus dados a qualquer momento, pelo e-mail de contato da loja.',
        ],
      },
      {
        heading: 'Cookies e armazenamento local',
        paragraphs: [
          'Usamos armazenamento local do navegador para manter a sacola e os favoritos, e cookies apenas quando os serviços de medição de audiência estiverem configurados pela loja.',
        ],
      },
    ],
  },
  {
    slug: 'termos',
    title: 'Termos de uso',
    summary: 'Condições para navegar e comprar neste site, e regras de uso do conteúdo da marca.',
    updatedAt,
    sections: [
      {
        heading: 'Aceite dos termos',
        paragraphs: [
          'Ao navegar neste site ou concluir um pedido, você concorda com as condições descritas nesta página e nas demais políticas da loja.',
        ],
      },
      {
        heading: 'Preços e disponibilidade',
        paragraphs: [
          'Os preços exibidos estão em reais e podem mudar sem aviso. Em caso de erro evidente de preço ou de estoque, o pedido pode ser cancelado com reembolso integral.',
        ],
      },
      {
        heading: 'Conteúdo do site',
        paragraphs: [
          'Textos, imagens e a identidade visual deste site pertencem à marca e não podem ser reproduzidos sem autorização. As fotografias demonstrativas deste template pertencem aos seus respectivos autores.',
        ],
      },
      {
        heading: 'Responsabilidade',
        paragraphs: [
          'A loja não se responsabiliza por informações incorretas de endereço informadas no pedido, nem por atrasos causados pela transportadora ou por eventos fora do nosso controle.',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookies e armazenamento local',
    summary: 'O que fica salvo no seu navegador, quais cookies podem ser usados e como recusá-los.',
    updatedAt,
    sections: [
      {
        heading: 'O que fica salvo',
        paragraphs: [
          'A sacola e os favoritos ficam no armazenamento local do seu navegador. Eles não identificam você e podem ser apagados a qualquer momento ao limpar os dados do site.',
        ],
      },
      {
        heading: 'Cookies de medição',
        paragraphs: [
          'Cookies de medição só existem quando a loja configura um identificador de analytics. Nesta configuração demonstram os campos vazios, então nenhum cookie de terceiro é criado.',
        ],
      },
      {
        heading: 'Como recusar',
        paragraphs: [
          'Você pode bloquear ou apagar cookies nas configurações do navegador. Bloquear o armazenamento local impede o funcionamento da sacola e dos favoritos.',
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}

/** Texto de contato reaproveitado nas políticas. */
export const policyContact = {
  email: brandConfig.email,
  address: brandConfig.address,
} as const;
