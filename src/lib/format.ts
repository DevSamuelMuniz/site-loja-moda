import { ecommerceConfig } from '@/config/ecommerce';
import { whatsappConfig } from '@/config/whatsapp';

/**
 * Formatacao de valores exibidos na interface.
 * Todas as funcoes leem `src/config/ecommerce.ts`, para que moeda, idioma e regras
 * de parcelamento sejam alterados em um unico lugar.
 */

const currencyFormatter = new Intl.NumberFormat(ecommerceConfig.locale, {
  style: 'currency',
  currency: ecommerceConfig.currency,
});

const numberFormatter = new Intl.NumberFormat(ecommerceConfig.locale, {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(ecommerceConfig.locale, {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

/** Data e hora curtas, para listas do painel: `28/09/2026 14:32`. */
const shortDateTimeFormatter = new Intl.DateTimeFormat(ecommerceConfig.locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat(ecommerceConfig.locale, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return shortDateTimeFormatter.format(date);
}

/** Somente a data numerica — usado nas listas, onde a hora nao ajuda a decidir nada. */
export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return shortDateFormatter.format(date);
}

/** Percentual de desconto entre `compareAtPrice` e `price`. */
export function formatDiscount(price: number, compareAtPrice?: number): string | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `${discount}% off`;
}

export function discountPercentage(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export interface InstallmentPlan {
  installments: number;
  value: number;
  interestFree: boolean;
  label: string;
}

/**
 * Calcula o parcelamento exibido na pagina de produto.
 * As regras vem de `ecommerceConfig.installments` e nunca sao inventadas no componente.
 */
export function buildInstallmentPlan(price: number): InstallmentPlan | null {
  const { enabled, maxInstallments, minInstallmentValue, interestFree } =
    ecommerceConfig.installments;

  if (!enabled || price <= 0) return null;

  const byValue = Math.floor(price / minInstallmentValue);
  const installments = Math.max(1, Math.min(maxInstallments, byValue));
  if (installments < 2) return null;

  const value = price / installments;
  const label = `${installments}x de ${formatCurrency(value)}${interestFree ? ' sem juros' : ''}`;

  return { installments, value, interestFree, label };
}

/** Formata "P, M, G" a partir de uma lista de tamanhos. */
export function formatSizeList(sizes: readonly string[]): string {
  return sizes.join(', ');
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return value;
}

/**
 * Link de WhatsApp com mensagem pre-definida.
 * O numero e a mensagem vem de `src/config/whatsapp.ts`.
 */
export function whatsappLink(message?: string): string | null {
  if (!whatsappConfig.enabled || !whatsappConfig.number) return null;

  const digits = whatsappConfig.number.replace(/\D/g, '');
  const text = encodeURIComponent(message ?? whatsappConfig.message);
  return `https://wa.me/${digits}?text=${text}`;
}

/** Remove protocolo e barra final para exibir um dominio legivel. */
export function formatUrl(value: string): string {
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
