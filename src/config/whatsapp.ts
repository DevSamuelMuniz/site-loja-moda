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

/**
 * Resolve o numero de atendimento.
 *
 * Tres casos, de proposito:
 * - nada configurado: usa o numero demonstrativo, para a loja abrir funcionando;
 * - configurado e valido: usa o que foi informado;
 * - configurado em branco ou invalido: desliga o WhatsApp em vez de publicar um link
 *   quebrado. Uma variavel criada vazia no painel chega como string vazia, nao como
 *   `undefined`, entao `??` sozinho nao resolveria.
 */
const demoNumber = '5581999999999';

function resolveNumber(value: string | undefined): string | null {
  if (value === undefined) return demoNumber;

  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 ? digits : null;
}

const whatsappNumber = resolveNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);

export const whatsappConfig: WhatsappConfig = {
  enabled: whatsappNumber !== null,
  number: whatsappNumber ?? '',
  message: 'Olá! Gostaria de saber mais sobre um produto.',
  displayName: 'Atendimento AURA',
  floating: true,
  hours: 'Segunda a sexta, das 9h às 18h',
  productMessageTemplate: 'Olá! Tenho interesse na peça {product}. Poderia me ajudar?',
};
