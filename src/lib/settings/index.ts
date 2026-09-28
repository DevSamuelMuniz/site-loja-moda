import { cache } from 'react';
import { brandConfig } from '@/config/brand';
import { ecommerceConfig } from '@/config/ecommerce';
import { navigationConfig } from '@/config/navigation';
import { newsBannerConfig } from '@/config/news';
import { seoConfig } from '@/config/seo';
import { socialConfig } from '@/config/social';
import { defaultThemeId, themes } from '@/config/theme';
import { whatsappConfig } from '@/config/whatsapp';
import { getPrisma } from '@/lib/db';
import { isRecord, mergeSetting } from '@/lib/settings/merge';
import { loadActiveStore, type ActiveStore } from '@/lib/store';

/**
 * Configuracao da loja (escopo §21, §36).
 *
 * O lojista muda identidade, textos e regras **sem tocar em codigo**: os modulos abaixo saem
 * da tabela `settings` da loja, com `src/config/*` valendo apenas como **padrao** para o que
 * aquela loja ainda nao personalizou.
 *
 * Toda chave e sobreposta ao padrao (`mergeSetting`), entao linha ausente, parcial ou de
 * formato antigo cai no padrao em vez de quebrar a pagina.
 *
 * Estado: a leitura esta pronta e validada; a conversao dos consumidores acontece uma chave
 * por vez, comecando pelas que a loja publica mostra (marca, navegacao, novidades). Enquanto
 * um consumidor nao for convertido, ele continua lendo `src/config/*` — que e o mesmo valor
 * que o seed gravou, entao nada muda na tela.
 */

export type StoreThemeId = keyof typeof themes;
export type StoreTheme = (typeof themes)[StoreThemeId];

export interface StoreSettings {
  store: ActiveStore;
  brand: typeof brandConfig;
  navigation: typeof navigationConfig;
  ecommerce: typeof ecommerceConfig;
  seo: typeof seoConfig;
  social: typeof socialConfig;
  whatsapp: typeof whatsappConfig;
  news: typeof newsBannerConfig;
  themeId: StoreThemeId;
  /** Tokens do tema: o registro em codigo com as sobreposicoes gravadas pela loja. */
  theme: StoreTheme;
}

/** Padroes do projeto, chave por chave. */
export const settingDefaults = {
  brand: brandConfig,
  navigation: navigationConfig,
  ecommerce: ecommerceConfig,
  seo: seoConfig,
  social: socialConfig,
  whatsapp: whatsappConfig,
  news: newsBannerConfig,
} as const;

function isThemeId(value: unknown): value is StoreThemeId {
  return typeof value === 'string' && value in themes;
}

/**
 * Le a chave `theme`.
 *
 * A loja grava `{ activeThemeId, available, overrides? }`: o registro de tokens continua em
 * codigo (fonte do padrao) e a loja escolhe qual usar e, quando quiser, sobrepoe valores.
 */
function readTheme(row: unknown): { themeId: StoreThemeId; overrides: unknown } {
  if (!isRecord(row)) return { themeId: defaultThemeId, overrides: undefined };

  return {
    themeId: isThemeId(row.activeThemeId) ? row.activeThemeId : defaultThemeId,
    overrides: row.overrides,
  };
}

export const loadSettings = cache(async (): Promise<StoreSettings> => {
  const store = await loadActiveStore();
  const rows = await getPrisma().setting.findMany({ where: { storeId: store.id } });
  const byKey = new Map<string, unknown>(rows.map((row) => [row.key, row.value]));

  const { themeId, overrides } = readTheme(byKey.get('theme'));

  return {
    store,
    brand: mergeSetting(settingDefaults.brand, byKey.get('brand')),
    navigation: mergeSetting(settingDefaults.navigation, byKey.get('navigation')),
    ecommerce: mergeSetting(settingDefaults.ecommerce, byKey.get('ecommerce')),
    seo: mergeSetting(settingDefaults.seo, byKey.get('seo')),
    social: mergeSetting(settingDefaults.social, byKey.get('social')),
    whatsapp: mergeSetting(settingDefaults.whatsapp, byKey.get('whatsapp')),
    news: mergeSetting(settingDefaults.news, byKey.get('news')),
    themeId,
    theme: mergeSetting(themes[themeId], overrides),
  };
});
