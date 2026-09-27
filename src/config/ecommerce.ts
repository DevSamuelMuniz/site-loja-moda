/**
 * Regras comerciais.
 *
 * Nada aqui e uma condicao definitiva de venda: sao valores demonstrativos,
 * centralizados para que frete, prazo, parcelamento e limites sejam revisados antes
 * de publicar. Nenhum componente pode inventar uma regra propria.
 */

export interface InstallmentConfig {
  enabled: boolean;
  maxInstallments: number;
  /** Valor minimo de cada parcela. Define o numero maximo exibido. */
  minInstallmentValue: number;
  interestFree: boolean;
}

export interface CouponConfig {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumSubtotal: number;
  description: string;
  active: boolean;
}

export interface EcommerceConfig {
  locale: string;
  currency: string;
  shipping: {
    /** Frete gratis a partir deste subtotal. `null` desliga o beneficio. */
    freeShippingThreshold: number | null;
    flatRate: number;
    estimatedDays: { min: number; max: number };
    /** Texto exibido na sacola quando o frete ainda nao foi calculado. */
    pendingLabel: string;
    note: string;
  };
  installments: InstallmentConfig;
  returns: {
    windowDays: number;
    note: string;
  };
  cart: {
    storageKey: string;
    maxQuantityPerItem: number;
    /** Abaixo deste estoque o produto aparece como ultimas unidades. */
    lowStockThreshold: number;
  };
  wishlist: {
    storageKey: string;
  };
  catalog: {
    pageSize: number;
    featuredLimit: number;
    newArrivalsLimit: number;
    saleLimit: number;
    relatedLimit: number;
  };
  coupons: CouponConfig[];
  checkout: {
    /** Vira `true` quando um gateway estiver integrado. */
    enabled: boolean;
    /** Gateways previstos na arquitetura. Nenhum esta integrado. */
    plannedProviders: string[];
    note: string;
  };
}

export const ecommerceConfig: EcommerceConfig = {
  locale: 'pt-BR',
  currency: 'BRL',
  shipping: {
    freeShippingThreshold: 299,
    flatRate: 24.9,
    estimatedDays: { min: 3, max: 9 },
    pendingLabel: 'Calculado no checkout',
    note: 'Valores demonstrativos. Revise as regras de frete antes de publicar a loja.',
  },
  installments: {
    enabled: true,
    maxInstallments: 6,
    minInstallmentValue: 30,
    interestFree: true,
  },
  returns: {
    windowDays: 7,
    note: 'Prazo demonstrativo. Ajuste conforme a politica real da loja.',
  },
  cart: {
    storageKey: 'aura.cart.v1',
    maxQuantityPerItem: 10,
    lowStockThreshold: 5,
  },
  wishlist: {
    storageKey: 'aura.wishlist.v1',
  },
  catalog: {
    pageSize: 12,
    featuredLimit: 8,
    newArrivalsLimit: 4,
    saleLimit: 4,
    relatedLimit: 4,
  },
  coupons: [],
  checkout: {
    enabled: false,
    plannedProviders: ['Mercado Pago', 'Stripe', 'PagSeguro'],
    note: 'Checkout desativado: nenhum gateway de pagamento esta integrado nesta versao.',
  },
};
