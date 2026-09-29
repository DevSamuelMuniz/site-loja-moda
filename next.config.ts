import type { NextConfig } from 'next';

/**
 * Origens remotas autorizadas para `next/image`.
 *
 * Desde a FASE 2 o painel aceita imagem por URL (§20). Em vez de exigir deploy para liberar o
 * CDN da loja, as origens extras vem de `IMAGE_HOSTS` (lista separada por virgula), aceitando
 * curinga de subdominio: `cdn.minhaloja.com.br,*.cloudinary.com`.
 *
 * O caminho mais simples continua sendo arquivo proprio em `public/images`, servido por
 * caminho relativo — e o que o catalogo atual usa. Origem remota e a excecao.
 */
function remotePatterns() {
  const patterns: Array<{ protocol: 'https'; hostname: string; pathname: string }> = [
    { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
  ];

  for (const host of (process.env.IMAGE_HOSTS ?? '').split(',')) {
    const hostname = host.trim();
    if (!hostname) continue;
    if (patterns.some((pattern) => pattern.hostname === hostname)) continue;

    patterns.push({ protocol: 'https', hostname, pathname: '/**' });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: remotePatterns(),
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
