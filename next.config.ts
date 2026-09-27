import type { NextConfig } from 'next';

/**
 * Origens remotas autorizadas para `next/image`.
 * Ao trocar as imagens demonstrativas por arquivos proprios, o caminho mais simples e
 * remover a origem remota daqui e apontar `src/data/**` para arquivos em `public/images`.
 */
const remoteImagePatterns = [
  {
    protocol: 'https' as const,
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: remoteImagePatterns,
    formats: ['image/avif', 'image/webp'],
    /*
     * A arte demonstrativa do catalogo e vetorial (SVG em `public/images/products`).
     * Como so servimos SVG de primeira parte, escrito neste repositorio, liberamos o
     * otimizador para entrega-los e mantemos o download forcado como precaucao.
     * Se o catalogo passar a aceitar upload de terceiros, desligue esta opcao.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
