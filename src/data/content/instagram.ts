import { socialConfig } from '@/config/social';
import { photo } from '@/lib/images';
import type { InstagramPost } from '@/types';

/**
 * Grade do Instagram exibida na home.
 *
 * Cada post tem `href` proprio: troque pelo link real da publicacao.
 * Quando `socialConfig.instagramGridEnabled` for falso, a secao nao e renderizada.
 */
const profileUrl = socialConfig.links.find((link) => link.id === 'instagram')?.href ?? '#';

export const instagramPosts: InstagramPost[] = [
  {
    id: 'post-01',
    image: photo('instagram01'),
    caption: 'Camiseta Essential no dia a dia.',
    href: profileUrl,
  },
  {
    id: 'post-02',
    image: photo('instagram02'),
    caption: 'Vestido Flow, lançamento da New Season.',
    href: profileUrl,
  },
  {
    id: 'post-03',
    image: photo('instagram03'),
    caption: 'Look completo com Jaqueta Urban.',
    href: profileUrl,
  },
  {
    id: 'post-04',
    image: photo('instagram04'),
    caption: 'Bastidores do ateliê.',
    href: profileUrl,
  },
  {
    id: 'post-05',
    image: photo('instagram05'),
    caption: 'Camisa Linen, nossa peça mais leve.',
    href: profileUrl,
  },
  {
    id: 'post-06',
    image: photo('instagram06'),
    caption: 'Combinando Essential 26 e Urban.',
    href: profileUrl,
  },
];
