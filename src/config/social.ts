/**
 * Redes sociais e presenca publica.
 * O Instagram alimenta a secao `@handle` da home e o icone do rodape.
 */

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  handle: string;
  enabled: boolean;
}

export interface SocialConfig {
  handle: string;
  links: SocialLink[];
  /** Liga a grade de imagens do Instagram na home. */
  instagramGridEnabled: boolean;
  /** Quantidade de imagens exibidas na grade. */
  instagramGridSize: number;
}

export const socialConfig: SocialConfig = {
  handle: '@auramoda',
  links: [
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com/auramoda',
      handle: '@auramoda',
      enabled: true,
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      href: 'https://tiktok.com/@auramoda',
      handle: '@auramoda',
      enabled: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://facebook.com/auramoda',
      handle: '/auramoda',
      enabled: true,
    },
    {
      id: 'pinterest',
      label: 'Pinterest',
      href: 'https://pinterest.com/auramoda',
      handle: '@auramoda',
      enabled: false,
    },
  ],
  instagramGridEnabled: true,
  instagramGridSize: 6,
};
