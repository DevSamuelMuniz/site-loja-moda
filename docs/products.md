# Produtos

Todo o catálogo vive em `src/data/products/index.ts`. Nenhum componente conhece um produto —
as páginas leem pelo repositório (`src/lib/catalog`).

## Estrutura de um produto

```ts
interface Product {
  id: string;                    // identificador estável interno
  slug: string;                  // endereço: /produtos/<slug>
  name: string;
  description: string;           // uma linha, usada em cards e busca
  story: string;                 // texto editorial da página de produto
  category: string;              // slug de src/data/categories
  collection?: string;           // slug de src/data/collections
  audience: 'feminino' | 'masculino' | 'unissex';
  price: number;                 // em reais, sem formatação
  compareAtPrice?: number;       // preço anterior; a partir dele o desconto é calculado
  images: string[];              // [principal, segundo ângulo]
  colors: ProductColor[];
  sizes: string[];
  tags: string[];
  featured?: boolean;            // entra em "Mais desejados"
  isNew?: boolean;               // selo NOVO e "Acabou de chegar"
  isSale?: boolean;              // reforça o estado promocional
  stock?: number;                // estoque total; sem ele, soma o estoque das cores
  sku: string;
  composition: string;
  care: string[];
  details: string[];
  measurements: Array<{ label: string; value: string }>;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;            // usado na ordenação "Mais vendidos"
  releasedAt: string;            // data ISO; ordenação "Mais recentes"
  variants?: ProductVariant[];   // grade fina de cor × tamanho (opcional)
}
```

### Cores

```ts
interface ProductColor {
  name: string;      // exibido no seletor
  slug: string;      // usado na URL, no SKU e no arquivo de imagem
  hex: string;       // amostra de cor
  image?: string;    // imagem própria da variante
  sku: string;
  stock: number;
  price?: number;            // preço próprio, quando difere
  compareAtPrice?: number;
}
```

Uma cor com `stock: 0` aparece riscada no seletor, e a imagem da variante troca a galeria.

## Adicionar um produto

1. Abra `src/data/products/index.ts`.
2. Acrescente um item ao array `products`, usando as funções auxiliares já disponíveis:
   `buildColors(slug, skuBase, ['preto', 'branco'], [10, 8])` para as cores e
   `productArtwork(slug, 'front')` / `productArtwork(slug, 'detail')` para as imagens.
3. Garanta que `category` e `collection` apontem para slugs existentes.
4. Coloque a arte em `public/images/products/` com o nome do slug — ou aponte `images` para
   fotos próprias.
5. Rode `npm run typecheck` — o compilador aponta qualquer campo faltando.

### Regras que evitam problema

| Regra | Por quê |
| --- | --- |
| `slug` em minúsculas, sem acento, com hífen | Vira URL e nome de arquivo de imagem |
| `slug` único | É a chave de busca do repositório |
| `releasedAt` no formato `AAAA-MM-DD` | Ordenação por novidades e `lastModified` do sitemap |
| `compareAtPrice` maior que `price` | Um valor menor não produz desconto e é ignorado |
| `isNew` coerente com a data | O selo NOVO aparece a partir do campo, não da data |
| `tags` com palavras que o cliente usaria | É por elas que a busca encontra a peça |
| Cores com `slug` igual ao do arquivo de arte | `colors/<slug>-<cor>.svg` |

### Exemplo completo

```ts
{
  id: 'prod-015',
  slug: 'calca-reta-alfaiataria',
  name: 'Calça Reta Alfaiataria',
  description: 'Corte reto com pence traseira e barra com 4 cm para ajuste.',
  story: 'Alfaiataria leve para o dia inteiro. Cintura média, bolso faca e caimento reto.',
  category: 'calcas',
  collection: 'new-season',
  audience: 'feminino',
  price: 379.9,
  compareAtPrice: 449.9,
  images: [
    productArtwork('calca-reta-alfaiataria', 'front'),
    productArtwork('calca-reta-alfaiataria', 'detail'),
  ],
  colors: buildColors('calca-reta-alfaiataria', 'AURA-CAL-015', ['preto', 'grafite'], [10, 8]),
  sizes: [...denimSizes],
  tags: ['alfaiataria', 'reta', 'trabalho', 'feminino'],
  isNew: true,
  isSale: true,
  stock: 18,
  sku: 'AURA-CAL-015',
  composition: '62% poliéster, 34% viscose, 4% elastano',
  care: wovenCare,
  details: ['Cintura média com passantes', 'Bolso faca nas laterais', 'Barra com 4 cm'],
  measurements: [
    { label: 'Comprimento total (38)', value: '102 cm' },
    { label: 'Gancho frontal (38)', value: '29 cm' },
  ],
  rating: 4.7,
  reviewCount: 12,
  soldCount: 24,
  releasedAt: '2026-02-18',
}
```

## Editar um produto existente

Encontre pelo `slug` e altere o campo. Preço, estoque e flags são imediatos; `slug` exige
atenção porque muda a URL — links antigos deixam de existir, então prefira manter o slug e
mudar só o `name`.

## Remover um produto

Apague o item. O que acontece automaticamente:

- ele sai das listagens, da busca, dos relacionados e do sitemap;
- o lookbook ignora silenciosamente o slug removido (`getProductsBySlugs` filtra o que não
  existe) — vale revisar `src/data/lookbook/index.ts` para não ficar com look incompleto;
- uma sacola salva no navegador de alguém mostra "Esta peça não está mais no catálogo", com
  opção de remover da linha.

## Como o produto aparece em cada lugar

| Lugar | Regra |
| --- | --- |
| "Mais desejados" | `featured: true`, ordenado por relevância |
| "Acabou de chegar" | `isNew: true`, ordenado por `releasedAt` |
| "Seleção especial" / coleção Sale | `isSale: true` ou `compareAtPrice` válido |
| Relacionados | mesma coleção (peso 3), mesma categoria (peso 2), mesmo público (1), tags em comum |
| Sitemap | todos os produtos, com `lastModified` de `releasedAt` |

## Variantes finas (opcional)

`variants` permite estoque e SKU por combinação de cor e tamanho:

```ts
variants: [
  { id: 'camiseta-essential-preto-p', colorSlug: 'preto', size: 'P', sku: 'AURA-CAM-001-01-P', stock: 4 },
]
```

Sem `variants`, o estoque considerado é o da cor (`colors[].stock`) e o do produto (`stock`).
