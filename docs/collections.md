# Coleções

Arquivo: `src/data/collections/index.ts`. Coleções agrupam peças por ideia de uso, não por
tipo de peça — isso é papel das categorias.

## Estrutura

```ts
interface Collection {
  slug: string;         // endereço: /colecoes/<slug>
  name: string;
  tagline: string;      // frase curta, usada em banner e metadata
  description: string;  // parágrafo da página da coleção
  image: string;        // foto do banner
  badge?: string;       // selo curto: "Coleção", "Cápsula", "até 40% off"
  featured?: boolean;
  order: number;        // ordem de exibição
  releasedAt: string;   // data ISO
}
```

## As coleções demonstrativas

| Slug | Nome | Papel |
| --- | --- | --- |
| `essential-26` | Essential 26 | Base do guarda-roupa. É a coleção mostrada no destaque da home |
| `urban` | Urban | Volumes maiores e tecidos resistentes |
| `new-season` | New Season | Lançamentos da estação |
| `sale` | Sale | **Virtual** — ver abaixo |

## A coleção `sale` é virtual

`Sale` não é atribuída a nenhum produto. Ela é resolvida pelo estado promocional da peça:

```ts
// src/lib/catalog/filters.ts
export function matchesCollection(product, collectionSlug) {
  if (collectionSlug === SALE_COLLECTION_SLUG) return productIsOnSale(product);
  return product.collection === collectionSlug;
}
```

Ou seja: um produto entra em Sale quando tem `isSale: true` ou um `compareAtPrice` maior que o
preço. Não existe lista paralela para manter.

## Adicionar uma coleção

```ts
{
  slug: 'verao-27',
  name: 'Verão 27',
  tagline: 'Peso leve para os dias longos.',
  description: 'Linho, algodão fino e modelagens soltas, pensadas para o calor.',
  image: photo('collectionNewSeason'),
  badge: 'Nova coleção',
  featured: true,
  order: 5,
  releasedAt: '2026-11-02',
}
```

Depois:

1. vincule produtos a ela com `collection: 'verao-27'` em `src/data/products/index.ts`;
2. se quiser no menu, acrescente um item em `mainNav` (`src/config/navigation.ts`), dentro de
   "Coleções";
3. a página `/colecoes/verao-27` passa a existir automaticamente.

## Onde a coleção aparece

| Lugar | Como |
| --- | --- |
| `/colecoes` | Uma faixa por coleção, na ordem de `order`, com a contagem de peças |
| `/colecoes/[slug]` | Banner com nome, `badge` e descrição, mais a listagem com filtros |
| Home | `CollectionBanner` usa a coleção `essential-26` |
| Menu do header | Os itens em "Coleções" vêm de `navigation.ts` |
| Sitemap | Todas as coleções, com `lastModified` de `releasedAt` |
| Rodapé | O link "Coleções" aponta para o índice |

## Ordenação

`order` define a sequência em `/colecoes` e nos menus. O rodapé e o sitemap também respeitam
esse campo (via `getCollections()`), então não é preciso ordenar em nenhum outro lugar.

## Filtro por coleção

Na listagem, o filtro "Coleção" mostra a contagem de cada coleção — calculada ignorando os
próprios filtros de coleção, para que você veja as alternativas antes de trocar a seleção. A
contagem da `sale` considera as peças promocionais, então ela nunca aparece zerada se houver
promoção ativa.
