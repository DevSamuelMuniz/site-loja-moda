/**
 * WhatsApp.
 *
 * Usado pelo botao flutuante, pelo rodape e pelo formulario de contato.
 * O numero vem de `NEXT_PUBLIC_WHATSAPP_NUMBER`, no formato internacional apenas
 * com digitos (55 + DDD + numero). O valor abaixo e demonstrativo.
 */

export interface WhatsappConfig {
  enabled: boolean;
  number: string;
  message: string;
  displayName: string;
  /** Exibe o botao flutuante em todas as paginas. */
  floating: boolean;
  hours: string;
  /** Modelo da mensagem enviada a partir de uma pagina de produto. */
  productMessageTemplate: string;
}

export const whatsappConfig: WhatsappConfig = {
  enabled: true,
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5581999999999',
  message: 'Olá! Gostaria de saber mais sobre um produto.',
  displayName: 'Atendimento AURA',
  floating: true,
  hours: 'Segunda a sexta, das 9h às 18h',
  productMessageTemplate: 'Olá! Tenho interesse na peça {product}. Poderia me ajudar?',
};
