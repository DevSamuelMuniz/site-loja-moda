/**
 * Configuracao de formularios.
 *
 * Os formularios do site nao inventam integracao: eles enviam para um endpoint
 * configurado por variavel de ambiente. Enquanto o endpoint estiver vazio, o
 * formulario avisa que o cadastro ainda nao esta conectado, em vez de simular um
 * sucesso que nao aconteceu.
 */

export interface FormEndpointConfig {
  /** URL que recebe o POST. Vazio significa "nao conectado". */
  endpoint: string;
  /** Rotulo do canal, usado nas mensagens. */
  channel: string;
}

export const newsletterConfig = {
  endpoint: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ?? '',
  channel: 'newsletter',
  title: 'Receba novidades primeiro.',
  description: 'Cadastre seu e-mail e receba lançamentos, coleções e ofertas especiais.',
  placeholder: 'Seu melhor e-mail',
  submitLabel: 'Cadastrar',
  successMessage: 'Cadastro confirmado. Você vai receber as próximas novidades por e-mail.',
  disconnectedMessage:
    'O cadastro ainda não está conectado a um serviço de e-mail. Configure NEXT_PUBLIC_NEWSLETTER_ENDPOINT para ativar o envio.',
} as const;

export const contactConfig = {
  endpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? '',
  channel: 'contato',
  successMessage: 'Mensagem enviada. Respondemos em horário comercial, pelo e-mail informado.',
  disconnectedMessage:
    'O formulário ainda não está conectado a um serviço de mensagens. Fale com a gente pelo WhatsApp ou pelo e-mail de contato.',
} as const;
