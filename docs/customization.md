# Personalização

Guia de troca: o que editar para transformar esta loja demonstrativa na sua.

## Trocar AURA por outra loja

### 1. Identidade — `src/config/brand.ts`

```ts
export const brandConfig: BrandConfig = {
  name: 'SUA MARCA',
  legalName: 'Sua Marca Comércio de Vestuário',
  slogan: 'Sua frase de marca.',
  tagline: 'Uma linha explicando o que você faz.',
  shortDescription: 'Uma frase para o hero e o rodapé.',
  longDescription: 'Um parágrafo para a seção "Sobre".',
  logo: { wordmark: 'SUA MARCA', monogram: 'S', image: '', alt: 'Sua Marca' },
  favicon: '/favicon.svg',
  email: 'contato@suamarca.com.br',
  phone: '+55 11 99999-9999',
  // …endereço, horários, dados fiscais
};
```

Colocou um arquivo de logo em `public/images/`? Preencha `logo.image` com o caminho
(`/images/logo.svg`) e o wordmark sai de cena.

### 2. Cores e tipografia — `src/config/theme.ts`

Edite o tema `custom` (ou crie um novo, veja [`themes.md`](themes.md)) com a sua paleta, seus
raios e suas sombras. Depois aponte o tema ativo:

```bash
NEXT_PUBLIC_THEME=custom
```

### 3. Fontes — `src/lib/fonts.ts`

```ts
export const displayFont = Manrope({ subsets: ['latin'], weight: ['200','300','400','500'], variable: '--font-manrope' });
export const bodyFont = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

Depois atualize as pilhas em `fontStacks` (`src/config/theme.ts`) para os novos nomes de
variável. Sem pasta `src/`? Não: as fontes vivem sempre em `src/lib/fonts.ts`.

### 4. Navegação — `src/config/navigation.ts`

Ajuste `mainNav`, `utilityNav`, `footerColumns`, `legalNav` e `announcement`. Os `href` de
categoria e coleção precisam apontar para slugs que existam.

### 5. Contatos, redes, WhatsApp

- `src/config/social.ts` — Instagram, TikTok, Facebook (e `enabled: false` para esconder).
- `src/config/whatsapp.ts` — número, mensagem padrão e botão flutuante.
- `src/config/brand.ts` — e-mail, telefone, endereço e horários.

### 6. Textos institucionais

| Texto | Arquivo |
| --- | --- |
| Sobre a marca, pontos de história, benefícios | `src/data/brand/index.ts` |
| Perguntas frequentes | `src/data/content/faq.ts` |
| Políticas (trocas, frete, privacidade, termos, cookies) | `src/data/content/policies.ts` |
| Guia de tamanhos | `src/data/content/size-guide.ts` |
| Posts do Instagram | `src/data/content/instagram.ts` |
| Depoimentos | `src/data/testimonials/index.ts` |
| Lookbook | `src/data/lookbook/index.ts` |

### 7. Catálogo

- Produtos: `src/data/products/index.ts` — veja [`products.md`](products.md).
- Categorias: `src/data/categories/index.ts` — veja [`categories.md`](categories.md).
- Coleções: `src/data/collections/index.ts` — veja [`collections.md`](collections.md).

### Resumo: os dez arquivos que trocam a marca

```
src/config/brand.ts
src/config/theme.ts
src/config/navigation.ts
src/config/social.ts
src/config/whatsapp.ts
src/lib/fonts.ts          (+ fontStacks em src/config/theme.ts)
src/data/products/index.ts
src/data/categories/index.ts
src/data/collections/index.ts
src/data/media.ts         (imagens)
```

## Trocar as imagens

### Fotos editoriais (hero, campanha, coleções, lookbook, sobre, Instagram)

Elas vêm de `src/data/media.ts`:

```ts
export const photoLibrary = {
  heroPrimary: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  // …
} as const;
```

**Opção A — usar arquivos próprios** (recomendado):

1. Salve as fotos em `public/images/editorial/`.
2. Troque os valores por caminhos locais:

```ts
heroPrimary: '/images/editorial/hero-01.jpg',
```

3. Se nenhuma imagem remota continuar em uso, remova o `remotePatterns` de `next.config.ts`.

**Opção B — manter o CDN**: só adicione uma URL depois de conferir que ela responde 200, e
garanta que o domínio está liberado em `next.config.ts`.

### Arte do catálogo

A arte demonstrativa dos produtos é vetorial e fica em `public/images/products/`:

```
nome-do-produto-front.svg     imagem principal
nome-do-produto-detail.svg    segundo ângulo (aparece no hover do card)
colors/nome-do-produto-cor.svg  imagem por variante de cor
```

Para substituir por fotos: salve os arquivos com os mesmos nomes de base (troque `.svg` por
`.jpg`) e ajuste as chamadas em `src/data/products/index.ts`:

```ts
images: ['/images/products/camiseta-essential-front.jpg', '/images/products/camiseta-essential-detail.jpg'],
// e, em cada cor:
image: '/images/products/camiseta-essential-preto.jpg',
```

Depois remova `dangerouslyAllowSVG` de `next.config.ts` se não sobrar nenhum SVG.

## Alterar preços e condições

| O que | Onde |
| --- | --- |
| Preço e preço anterior de um produto | `src/data/products/index.ts` (`price`, `compareAtPrice`) |
| Desconto exibido | calculado a partir de `compareAtPrice` — não é digitado |
| Frete grátis, taxa, prazo | `src/config/ecommerce.ts` (`shipping`) |
| Parcelamento | `src/config/ecommerce.ts` (`installments`) |
| Prazo de troca | `src/config/ecommerce.ts` (`returns.windowDays`) |

## Navegação e busca

- A busca cobre nome, categoria, coleção, SKU, tags, público e descrição. Quer que um termo
  novo encontre a peça? Adicione-o em `tags` no produto.
- O menu do header aceita `description` nos filhos — útil nos menus suspensos.
- A faixa de aviso aceita quantas mensagens você quiser; no mobile aparece só a primeira.

## Marca d'água de conteúdo demonstrativo

Nenhuma página esconde que a loja é demonstrativa: o rodapé mostra a URL configurada, o
checkout avisa que não está ativo e os formulários avisam quando não estão conectados. Ao
publicar de verdade, essas mensagens deixam de aparecer naturalmente quando você configurar
os endpoints e o checkout.
