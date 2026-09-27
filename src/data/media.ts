/**
 * Manifesto de midia.
 *
 * Toda imagem do site passa por aqui. Nenhum componente escreve uma URL.
 *
 * As fotografias editoriais (hero, campanha, colecoes, lookbook, sobre e Instagram)
 * apontam para URLs verificadas de `images.unsplash.com`, autorizadas em
 * `next.config.ts`. Ao publicar com fotos proprias:
 *
 *   1. coloque os arquivos em `public/images/editorial/`;
 *   2. troque os valores abaixo por caminhos locais, como
 *      `/images/editorial/hero-01.jpg`;
 *   3. remova o `remotePatterns` de `next.config.ts`, se nenhuma imagem remota
 *      continuar em uso.
 *
 * As fotos de produto sao arte local, gerada para o catalogo demonstrativo e
 * substituivel pelos arquivos reais em `public/images/products/`.
 */

/** Fotografias editoriais verificadas. Nao adicione uma URL sem conferir o status 200. */
export const photoLibrary = {
  heroPrimary: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  heroSecondary: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',

  campaignPrimary: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
  campaignSecondary: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',

  collectionEssential: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
  collectionUrban: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  collectionNewSeason: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
  collectionSale: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',

  categoryFeminino: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
  categoryMasculino: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  categoryVestidos: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
  categoryCamisetas: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  categoryCamisas: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
  categoryCalcas: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
  categoryJeans: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
  categoryJaquetas: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
  categoryAcessorios: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',

  lookbook01: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
  lookbook02: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
  lookbook03: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
  lookbook04: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1',
  lookbook05: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
  lookbook06: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',

  aboutAtelier: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',

  instagram01: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  instagram02: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  instagram03: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  instagram04: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  instagram05: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  instagram06: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04',

  /* Alternativas ja verificadas, para quando uma foto nao servir ao contexto. */
  spareStudioPortrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
  spareMenswearPortrait: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
  spareSneaker: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  spareStoreRack: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
  spareHeadphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  spareBag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
  spareWorkTable: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
} as const;

export type PhotoKey = keyof typeof photoLibrary;

/** Arte local do catalogo de produtos. */
export const productArt = {
  directory: '/images/products',
  kinds: ['front', 'detail'] as const,
  /**
   * Cada cor de produto pode ter uma imagem propria. Quando o arquivo existir em
   * `public/images/products/`, o seletor de cor passa a trocar a foto principal.
   */
  colorDirectory: '/images/products/colors',
} as const;

export type ProductArtKind = (typeof productArt.kinds)[number];
