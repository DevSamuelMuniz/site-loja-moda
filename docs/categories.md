# Categorias

Arquivo: `src/data/categories/index.ts`.

## Dois eixos, uma página

O catálogo tem categorias de **público** (Feminino, Masculino) e de **tipo de peça**
(Vestidos, Jeans…). As duas atravessam o mesmo conjunto de produtos: uma camiseta pode ser
feminina, masculina ou unissex.

Por isso existe `kind`:

```ts
interface Category {
  slug: string;
  name: string;
  kind: 'audience' | 'product';   // por público ou por tipo de peça
  description: string;
  image: string;
  audience: 'feminino' | 'masculino' | 'unissex';
  featured?: boolean;
  order: number;
}
```

E o produto declara os dois eixos:

```ts
{ category: 'camisetas', audience: 'unissex' }
```

- `/categoria/camisetas` filtra por `product.category === 'camisetas'`.
- `/categoria/feminino` filtra por `product.audience === 'feminino'`.

A regra está em um único lugar na página de categoria; nenhuma das duas precisa de página
própria.

## As categorias demonstrativas

| Slug | Nome | Eixo |
| --- | --- | --- |
| `feminino` | Feminino | público |
| `masculino` | Masculino | público |
| `vestidos` | Vestidos | peça |
| `camisetas` | Camisetas | peça |
| `camisas` | Camisas | peça |
| `calcas` | Calças | peça |
| `jeans` | Jeans | peça |
| `jaquetas` | Jaquetas | peça (inclui moletons e casacos) |
| `acessorios` | Acessórios | peça |

> "Jaquetas" cobre sobreposição em geral — jaquetas, moletons e blazers. Se preferir separar,
> crie novas categorias e ajuste o `category` dos produtos.

## Adicionar uma categoria

```ts
{
  slug: 'saias',
  name: 'Saias',
  kind: 'product',
  description: 'Midi, longa e reta, com modelagens que não pedem ajuste.',
  image: photo('categoryVestidos'),
  audience: 'feminino',
  featured: true,
  order: 10,
}
```

1. Vincule produtos com `category: 'saias'`.
2. A rota `/categoria/saias` passa a existir, entra no sitemap e nos filtros.
3. `featured: true` faz a categoria aparecer na grade "Explore por categoria" da home.

Uma categoria nova sem produtos funciona: ela aparece nos filtros com contagem zero (exibida
como texto, não como link) e a página mostra o estado vazio convidando a limpar os filtros.

## Onde a categoria aparece

| Lugar | Como |
| --- | --- |
| Home | `CategoryGrid` monta a grade editorial com as categorias `featured` |
| Header | Os itens de Feminino e Masculino listam categorias de peça em `navigation.ts` |
| Filtros de listagem | Grupo "Categoria", com contagem por valor |
| Trilha de navegação | Produto → categoria → catálogo |
| Dado estruturado | `category` no schema `Product` |

## Grade editorial

`CategoryGrid` tem quatro variantes, escolhidas por prop em
`src/app/page.tsx`:

| Variante | Composição |
| --- | --- |
| `editorial` (padrão) | Primeira categoria ocupando duas linhas, segunda em faixa larga, demais em colunas |
| `grid` | Grade uniforme de 2 a 4 colunas |
| `split` | Uma categoria grande à esquerda, as demais em grade à direita |
| `masonry` | Colunas com alturas variadas |

## Ordem e destaque

- `order` define a sequência na home, nos filtros e nos menus.
- `featured: true` inclui a categoria na home; `false` mantém a categoria apenas nos filtros e
  na navegação.

## Imagens de categoria

As imagens vêm de `src/data/media.ts` (`categoryFeminino`, `categoryVestidos`,
`categoryAcessorios`…). Para usar arquivos próprios, aponte para
`/images/editorial/categoria-vestidos.jpg` — o resto não muda.
