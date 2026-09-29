/**
 * Miniatura de imagem no painel.
 *
 * Usa `<img>` de proposito: a URL e digitada pelo operador e pode apontar para um host que
 * ainda nao esta em `IMAGE_HOSTS`. O otimizador do Next recusaria a URL e derrubaria a pagina
 * inteira do produto; aqui a imagem simplesmente nao carrega e o operador ve o problema. O
 * catalogo publico continua usando `next/image`.
 */
export function Thumbnail({ url, alt, size = 56 }: { url: string; alt: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL arbitraria do painel; ver o comentario acima
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className="border-border bg-surface h-14 w-14 rounded-sm border object-cover"
    />
  );
}
