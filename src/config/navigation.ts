import { brandConfig } from '@/config/brand';
import { whatsappLink } from '@/lib/format';

/**
 * Navegacao do site.
 *
 * Todos os rotulos do header, do menu mobile e do rodape vem daqui. Os `href` de
 * categoria e colecao apontam para slugs que precisam existir em `src/data`.
 */

export interface NavLink {
  label: string;
  href: string;
  /** Texto de apoio exibido nos menus abertos. */
  description?: string;
  /** Selo curto, como o percentual de uma promocao. */
  badge?: string;
  /** Abre em nova aba e recebe `rel="noreferrer"`. */
  external?: boolean;
}

export interface NavItem extends NavLink {
  /** Colunas exibidas no menu aberto daquele item. */
  children?: NavLink[];
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface NavigationConfig {
  mainNav: NavItem[];
  /** Atalhos do menu mobile, alem da navegacao principal. */
  utilityNav: NavLink[];
  footerColumns: FooterColumn[];
  legalNav: NavLink[];
  /** Mensagens da faixa no topo do site. Uma por vez, em rotacao. */
  announcement: string[];
}

export const navigationConfig: NavigationConfig = {
  mainNav: [
    {
      label: 'Novos',
      href: '/produtos?ordenar=recentes',
      description: 'As últimas peças que entraram no catálogo.',
    },
    {
      label: 'Feminino',
      href: '/categoria/feminino',
      children: [
        { label: 'Vestidos', href: '/categoria/vestidos' },
        { label: 'Camisetas', href: '/categoria/camisetas' },
        { label: 'Camisas', href: '/categoria/camisas' },
        { label: 'Calças', href: '/categoria/calcas' },
        { label: 'Jeans', href: '/categoria/jeans' },
        { label: 'Jaquetas', href: '/categoria/jaquetas' },
      ],
    },
    {
      label: 'Masculino',
      href: '/categoria/masculino',
      children: [
        { label: 'Camisetas', href: '/categoria/camisetas' },
        { label: 'Camisas', href: '/categoria/camisas' },
        { label: 'Calças', href: '/categoria/calcas' },
        { label: 'Jeans', href: '/categoria/jeans' },
        { label: 'Jaquetas', href: '/categoria/jaquetas' },
      ],
    },
    {
      label: 'Coleções',
      href: '/colecoes',
      children: [
        {
          label: 'Essential 26',
          href: '/colecoes/essential-26',
          description: 'Peças básicas e versáteis.',
        },
        {
          label: 'Urban',
          href: '/colecoes/urban',
          description: 'Inspirado no ritmo da cidade.',
        },
        {
          label: 'New Season',
          href: '/colecoes/new-season',
          description: 'O que acabou de chegar.',
        },
      ],
    },
    {
      label: 'Sale',
      href: '/colecoes/sale',
      badge: 'até 40%',
      children: [
        { label: 'Toda a seleção', href: '/colecoes/sale' },
        { label: 'Camisetas', href: '/categoria/camisetas?colecao=sale' },
        { label: 'Jeans', href: '/categoria/jeans?colecao=sale' },
      ],
    },
    {
      label: 'Sobre',
      href: '/sobre',
      children: [
        { label: 'A marca', href: '/sobre' },
        { label: 'Contato', href: '/contato' },
        { label: 'Perguntas frequentes', href: '/faq' },
      ],
    },
  ],
  utilityNav: [
    { label: 'Todos os produtos', href: '/produtos' },
    { label: 'Coleções', href: '/colecoes' },
    { label: 'Favoritos', href: '/favoritos' },
    { label: 'Sacola', href: '/carrinho' },
  ],
  footerColumns: [
    {
      title: brandConfig.name,
      links: [
        { label: 'Sobre nós', href: '/sobre' },
        { label: 'Nossa história', href: '/sobre#historia' },
        { label: 'Contato', href: '/contato' },
      ],
    },
    {
      title: 'Comprar',
      links: [
        { label: 'Feminino', href: '/categoria/feminino' },
        { label: 'Masculino', href: '/categoria/masculino' },
        { label: 'Novidades', href: '/produtos?ordenar=recentes' },
        { label: 'Sale', href: '/colecoes/sale' },
        { label: 'Coleções', href: '/colecoes' },
      ],
    },
    {
      title: 'Atendimento',
      links: [
        { label: 'WhatsApp', href: whatsappLink() ?? '/contato', external: true },
        { label: 'Trocas e devoluções', href: '/trocas' },
        { label: 'Frete', href: '/frete' },
        { label: 'Perguntas frequentes', href: '/faq' },
      ],
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Política de privacidade', href: '/privacidade' },
        { label: 'Termos de uso', href: '/termos' },
        { label: 'Cookies', href: '/cookies' },
      ],
    },
  ],
  legalNav: [
    { label: 'Privacidade', href: '/privacidade' },
    { label: 'Termos de uso', href: '/termos' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Trocas e devoluções', href: '/trocas' },
  ],
  announcement: [
    'Frete grátis acima do valor configurado na loja',
    'Troca sem custo em até 7 dias após o recebimento',
    'Parcele em até 6x sem juros',
  ],
};
