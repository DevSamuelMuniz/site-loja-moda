# SEO

## Onde fica cada coisa

| Peça | Arquivo |
| --- | --- |
| Configuração (URL, títulos, palavras-chave) | `src/config/seo.ts` |
| Construtores de metadata e dados estruturados | `src/lib/seo.ts` |
| Metadata do site (padrão, Open Graph, Twitter) | `src/app/layout.tsx` |
| Metadata por página | cada `page.tsx` |
| Sitemap | `src/app/sitemap.ts` |
| robots.txt | `src/app/robots.ts` |
| JSON-LD | `src/components/seo/JsonLd.tsx` + `src/lib/seo.ts` |

## `buildMetadata` — o atalho padrão

Toda rota usa:

```ts
export const metadata: Metadata = buildMetadata({
  title: 'Nome da página',
  description: 'Uma frase que diz o que a página é.',
  path: '/caminho',
  images: ['/imagem.jpg'],   // opcional; sem isso usa a imagem padrão
  keywords: ['termo'],       // opcional
  noIndex: true,             // opcional (sacola, favoritos, busca)
});
```

Ele monta: `title`, `description`, `canonical` absolutizado, Open Graph (`type`, `url`,
`siteName`, `locale`, `images`) e Twitter Card. Você informa o caminho; o resto sai
consistente.

Rota dinâmica usa o mesmo construtor dentro de `generateMetadata`:

```ts
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return buildMetadata({ title: 'Não encontrado', description: '', path: `/produtos/${slug}`, noIndex: true });
  return buildMetadata({ title: product.name, description: product.description, path: `/produtos/${product.slug}`, images: product.images });
}
```

## URL absoluta

Canonical, Open Graph e sitemap precisam de URL absoluta. Elas vêm de
`NEXT_PUBLIC_SITE_URL`:

```bash
NEXT_PUBLIC_SITE_URL=https://minhaloja.com.br
```

Sem essa variável, o padrão é `http://localhost:3000` — o que quebra canonical em produção.
**Configure isso antes de publicar.**

## Dados estruturados

| Schema | Onde | Conteúdo |
| --- | --- | --- |
| `Organization` | layout raiz | Nome, razão social, URL, logo, slogan, contatos, redes, endereço |
| `Product` | página de produto | Nome, descrição, SKU, imagens, marca, cores, avaliação, oferta com preço, moeda, disponibilidade |
| `BreadcrumbList` | página de produto | Trilha: início → produtos → categoria → peça |
| `ItemList` | categoria e coleção | As peças listadas, com nome e URL |

`Product` usa `productStock()` para decidir entre `InStock` e `OutOfStock`, e só publica
`aggregateRating` quando o produto tem `rating`.

## Sitemap

`src/app/sitemap.ts` inclui:

- rotas fixas: `/`, `/produtos`, `/colecoes`, `/sobre`, `/contato`, `/faq`, `/trocas`,
  `/frete`, `/privacidade`, `/termos`, `/cookies`;
- todas as categorias, coleções e produtos;
- `lastModified` a partir de `releasedAt` nos itens de catálogo.

Ficam de fora `/carrinho`, `/favoritos` e `/busca` — são pessoais ou duplicam o catálogo.

## robots.txt

`src/app/robots.ts` permite tudo e bloqueia as três rotas privadas. Com
`NEXT_PUBLIC_ALLOW_INDEXING=false`, bloqueia o site inteiro — útil em homologação.

## Imagens de compartilhamento

`seoConfig.defaultOgImage` é usada quando a página não informa imagem. Produtos passam as
imagens do próprio catálogo, o que gera cards melhores nas redes.

Uma melhoria natural (não implementada): `opengraph-image.tsx` por rota, gerando a imagem em
tempo de build com o nome da peça e o preço.

## Adicionar uma rota nova

1. Crie a pasta em `src/app/` com `page.tsx`.
2. Exporte `metadata` usando `buildMetadata`.
3. Se for uma página de conteúdo, acrescente o caminho em `src/app/sitemap.ts`.
4. Se for privada, adicione em `privateRoutes` no `robots.ts` e use `noIndex: true`.

## Verificação

```bash
npm run build && npm run start
curl -s localhost:3000/sitemap.xml | head
curl -s localhost:3000/robots.txt
curl -s localhost:3000/produtos/camiseta-essential | grep -o 'application/ld+json'
```

Para validar os dados estruturados, use o Rich Results Test do Google ou o validador do
schema.org com a URL publicada.

## Palavras-chave

`seoConfig.keywords` alimenta o padrão do site; páginas de produto acrescentam o nome, as tags
e o SKU. Ajuste o padrão em `src/config/seo.ts` para o vocabulário da sua loja.
