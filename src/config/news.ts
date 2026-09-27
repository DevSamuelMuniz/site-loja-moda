/**
 * Faixa de novidades.
 *
 * Fica logo abaixo do header, em todas as paginas, e leva para o que acabou de entrar
 * no catalogo. Nao confundir com a faixa de avisos do topo
 * (`navigationConfig.announcement`): aquela lista condicoes da loja (frete, troca,
 * parcelamento); esta anuncia lancamento.
 */

export interface NewsBannerConfig {
  /** Desliga a faixa em todo o site. */
  enabled: boolean;
  /** Palavra que identifica a faixa. */
  label: string;
  /** Frase principal. */
  message: string;
  /** Rotulo do link. */
  linkLabel: string;
  /** Destino do link. */
  href: string;
}

export const newsBannerConfig: NewsBannerConfig = {
  enabled: true,
  label: 'Novidades',
  message: 'A coleção New Season acabou de chegar ao catálogo.',
  linkLabel: 'Ver o que chegou',
  href: '/produtos?novidades=1',
};
