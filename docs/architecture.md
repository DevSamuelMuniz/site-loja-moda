# Arquitetura

## Visão geral

O site é um projeto Next.js com App Router. A regra que organiza tudo:

> **Componente não conhece dado.** Ele recebe props e, quando precisa de conteúdo, passa
> por uma camada de acesso.

Isso é o que permite trocar AURA por outra loja, migrar os dados para um banco e mudar a
identidade visual sem reescrever interface.

```
Configuração ─┐
Dados ────────┼─► Repositório (src/lib/catalog) ─► Rotas (src/app) ─► Componentes
Tema ─────────┘
```

## Camadas

### 1. Configuração — `src/config/`

Valores de negócio e de identidade, separados por assunto:

| Arquivo | Responsabilidade |
| --- | --- |
| `brand.ts` | Nome, slogan, logo, contatos, endereço, horários, dados fiscais |
| `theme.ts` | Tokens visuais (cor, tipografia, raio, sombra, botão) e os temas prontos |
| `navigation.ts` | Header, menu mobile, rodapé, links legais, faixa de aviso |
| `ecommerce.ts` | Frete, parcelamento, prazo de troca, limites de sacola, paginação, cupons, checkout |
| `seo.ts` | URL do site, títulos, descrições, Open Graph, verificação, indexação |
| `social.ts` | Redes sociais e a grade do Instagram |
| `analytics.ts` | Identificadores de medição e a lista de eventos |
| `whatsapp.ts` | Número, mensagem padrão, botão flutuante, horário |
| `forms.ts` | Endpoints de newsletter e contato |
| `index.ts` | Reexporta tudo e monta `siteConfig` |

Nenhum componente importa valores de negócio direto do briefing: ele lê daqui.

### 2. Domínio — `src/types/`

Tipos de `Product`, `ProductColor`, `ProductVariant`, `Category`, `Collection`, `LookbookLook`,
`Testimonial`, `CartLine`, `CartTotals`, `WishlistEntry`, `ProductFilters`, `FilterFacets`,
`Policy`, `FaqItem`, `SizeGuide`, `Theme` e do conteúdo editorial.

### 3. Dados — `src/data/`

Conteúdo demonstrativo em arquivos TypeScript tipados:

```
data/
├── products/      Catálogo (14 peças), com cores, tamanhos, SKU, estoque, medidas
├── categories/    As 9 categorias, nos eixos "público" e "tipo de peça"
├── collections/   Essential 26, Urban, New Season e Sale
├── lookbook/      Looks, cada um apontando para os slugs dos produtos
├── testimonials/  Depoimentos
├── brand/         Sobre a marca, pontos de história e benefícios
├── content/       FAQ, políticas, guia de tamanhos e posts do Instagram
└── media.ts       Manifesto de imagens (fotos editoriais e arte de produto)
```

### 4. Repositório — `src/lib/catalog/`

A única porta de entrada para o catálogo:

| Arquivo | Responsabilidade |
| --- | --- |
| `index.ts` | API pública: produtos, categorias, coleções, facetas, relacionados, busca, paginação |
| `filters.ts` | Regras puras: busca textual, filtragem, ordenação, faixas de preço |
| `params.ts` | Contrato entre a URL (`?categoria=jeans&cor=azul`) e os filtros |
| `commerce.ts` | Índice enxuto (nome, preço, imagem) que o cliente usa na sacola |

Migrar para Postgres, Supabase ou uma API significa reescrever esses arquivos mantendo as
assinaturas — as rotas não mudam. Veja [`future-integrations.md`](future-integrations.md).

### 5. Sistema visual — `src/styles/` + `src/lib/theme.ts`

- `src/config/theme.ts` guarda os tokens de cada tema.
- `src/lib/theme.ts` (Theme Engine) converte os tokens em variáveis CSS e gera o bloco
  `:root { … }` mais um bloco `[data-theme="…"]` por tema.
- `src/styles/tokens.css` guarda só o que não muda com o tema: larguras, espaçamentos,
  durações, camadas e proporções.
- `src/styles/theme.css` mapeia as variáveis para utilitários do Tailwind com `@theme inline`
  e define a escala tipográfica e os utilitários `type-display`, `type-heading`, `type-body`,
  `type-label`, `type-button`, `link-rule`, `reveal-up`.

### 6. Rotas — `src/app/`

```
/                        Home editorial (marca → coleção → produto → desejo → compra)
/colecoes                Índice de coleções
/colecoes/[slug]         Coleção, com filtros e ordenação
/categoria/[slug]        Categoria (por público ou por tipo de peça)
/produtos                Catálogo completo, com filtros, ordenação e paginação
/produtos/[slug]         Página de produto
/busca                   Resultado de busca
/favoritos               Favoritos
/carrinho                Sacola
/sobre /contato /faq /trocas /frete /privacidade /termos /cookies
/sitemap.xml /robots.txt  Gerados por `sitemap.ts` e `robots.ts`
```

## Fluxo de dados de uma listagem

```
URL  ──►  readFilters(searchParams)   (src/lib/catalog/params.ts)
      ──►  getFacets(filters)         contagem por valor de filtro
      ──►  queryProducts(filters, p)  filtra, ordena, pagina
      ──►  CatalogResults             Server Component que monta barra, grade e paginação
```

Filtrar é navegar: cada opção é um `<Link>`. O estado vive na URL, então funciona sem
JavaScript, é compartilhável e o botão voltar do navegador se comporta como se espera.

## Estado no cliente

Três contextos, todos em `src/components/providers/`:

- **`CartProvider`** — linhas da sacola, itens salvos para depois, totais e o painel lateral.
  Persiste em `localStorage` com leitura só depois da montagem (o servidor sempre renderiza a
  sacola vazia, o que evita divergência de hidratação) e sincroniza entre abas via evento
  `storage`.
- **`WishlistProvider`** — favoritos, no mesmo modelo.
- **`AppProviders`** — junta os dois e entrega o índice comercial vindo do servidor.

O catálogo completo **não** vai para o cliente: o layout raiz envia apenas
`getCommerceIndex()` (nome, preço, imagem por cor) e `getSearchDocuments()` (índice de busca).

## Server vs Client

Por padrão, Server Component. São clientes apenas onde há estado ou evento:

| Componente | Por que é cliente |
| --- | --- |
| `Header`, `MobileMenu`, `SearchOverlay` | Estado de menu, busca instantânea, contagem da sacola |
| `CartDrawer`, `CartView`, `CartLineItem`, `QuantityStepper` | Sacola no navegador |
| `WishlistButton`, `WishlistView` | Favoritos |
| `ProductPurchase`, `ProductGallery`, `ColorSelector`, `SizeSelector`, `SizeGuideModal` | Cor, tamanho, quantidade e zoom |
| `QuickAdd` | Adição rápida no card |
| `FilterDrawer`, `SortSelect` | Painel de filtros no mobile e troca de ordenação |
| `Newsletter`, `ContactForm` | Validação e envio |
| `Modal`, `Drawer`, `Accordion` | Foco, teclado e `aria-expanded` |

## SEO

`src/lib/seo.ts` centraliza `buildMetadata`, `absoluteUrl` e os dados estruturados
(`Organization`, `Product`, `BreadcrumbList`, `ItemList`). Cada rota informa título,
descrição e caminho; canonical, Open Graph e Twitter Card saem daí.

## Tratamento de erro e vazio

- `not-found.tsx` cobre endereços inexistentes e slugs fora do catálogo.
- Lista filtrada sem resultado usa `EmptyState`, com o próximo passo.
- Carrinho e favoritos vazios explicam onde as coisas ficam salvas.

## Decisões que valem saber

1. **Filtros na URL, não em estado de componente.** Custo: mais navegação. Ganho: funciona sem
   JS, é indexável e compartilhável.
2. **Tema como dado.** O CSS não tem hex de marca espalhado; todo valor visual vem do tema.
3. **`discount` é informativo.** Os preços promocionais já entram no subtotal, então o valor
   economizado não é subtraído do total — isso fica reservado para cupom.
4. **Coleção `sale` é virtual.** Ela não está vinculada a nenhum produto; é resolvida pelo
   estado promocional da peça.
5. **Categoria tem dois eixos.** "Feminino" recorta por público e "Jeans" por tipo de peça;
   `category.kind` diz qual é qual, sem duplicar páginas.
