/**
 * Identidade da marca.
 *
 * Nenhum componente conhece estes valores: eles chegam por props ou por
 * `siteConfig`. Trocar a loja significa editar apenas este arquivo.
 */

export interface BrandAddress {
  street: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BrandLogo {
  /** Texto do logotipo principal. Usado quando nao ha arquivo de imagem. */
  wordmark: string;
  /** Marca reduzida, usada em espacos pequenos e no favicon textual. */
  monogram: string;
  /** Caminho do arquivo de logo, relativo a `public/`. Vazio usa o wordmark. */
  image: string;
  alt: string;
}

export interface BrandConfig {
  name: string;
  legalName: string;
  slogan: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  foundedYear: number;
  logo: BrandLogo;
  favicon: string;
  email: string;
  phone: string;
  address: BrandAddress;
  businessHours: Array<{ label: string; value: string }>;
  /**
   * Dados fiscais sao opcionais e ficam vazios no conteudo demonstrativo.
   * Preencha com os dados reais antes de publicar.
   */
  fiscal: { registrationNumber: string; registrationLabel: string };
}

export const brandConfig: BrandConfig = {
  name: 'AURA',
  legalName: 'AURA Comércio de Vestuário',
  slogan: 'Vista o seu momento.',
  tagline: 'Moda autoral feita para a vida real.',
  shortDescription:
    'Peças que acompanham seu estilo, sua rotina e tudo aquilo que faz você ser você.',
  longDescription:
    'AURA nasceu para criar peças que acompanham diferentes versões de você. Design, conforto e personalidade em uma coleção pensada para a vida real.',
  foundedYear: 2024,
  logo: {
    wordmark: 'AURA',
    monogram: 'A',
    image: '',
    alt: 'AURA',
  },
  favicon: '/favicon.svg',
  email: 'contato@auramoda.com.br',
  phone: '+55 81 99999-9999',
  address: {
    street: 'Rua das Alfaiatarias, 128',
    district: 'Recife Antigo',
    city: 'Recife',
    state: 'PE',
    postalCode: '50030-000',
    country: 'Brasil',
  },
  businessHours: [
    { label: 'Loja online', value: 'Todos os dias, 24 horas' },
    { label: 'Atendimento', value: 'Segunda a sexta, das 9h às 18h' },
  ],
  fiscal: { registrationNumber: '', registrationLabel: 'CNPJ' },
};
