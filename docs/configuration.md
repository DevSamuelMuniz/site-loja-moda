# Configuração

Todos os valores de negócio e de identidade vivem em `src/config/`. Nenhum componente
escreve marca, cor ou número de frete.

## `brand.ts` — identidade

| Campo | O que é |
| --- | --- |
| `name` | Nome curto da loja, usado no logo e nos títulos |
| `legalName` | Razão social, exibida no rodapé |
| `slogan` | Frase de marca que abre o hero |
| `tagline` | Frase curta usada em metadata |
| `shortDescription` | Texto de uma linha, usado no hero e no rodapé |
| `longDescription` | Parágrafo institucional, usado no "Sobre" |
| `foundedYear` | Ano de fundação, exibido em `/sobre` |
| `logo.wordmark` | Texto do logo quando não há arquivo |
| `logo.monogram` | Marca reduzida |
| `logo.image` | Caminho do arquivo em `public/`. Vazio usa o wordmark |
| `logo.alt` | Texto alternativo do logo |
| `favicon` | Ícone do site |
| `email`, `phone` | Contatos exibidos no rodapé e em `/contato` |
| `address` | Endereço completo, usado no rodapé, em `/contato` e no dado estruturado |
| `businessHours` | Lista de rótulo + valor, exibida no rodapé e em `/contato` |
| `fiscal.registrationNumber` | Documento da empresa. Vazio não exibe a linha |

## `navigation.ts` — navegação

| Campo | O que é |
| --- | --- |
| `mainNav` | Itens do header. Um item com `children` abre um menu suspenso |
| `utilityNav` | Atalhos do menu mobile e do menu de conta |
| `footerColumns` | Colunas do rodapé |
| `legalNav` | Links da barra inferior do rodapé |
| `announcement` | Mensagens da faixa no topo (todas no desktop, a primeira no mobile) |

Os `href` de categoria e coleção apontam para slugs que precisam existir em `src/data`.
Um item aceita `badge` (selo curto, como `até 40%`), `description` (texto de apoio nos menus)
e `external` (abre em nova aba).

## `ecommerce.ts` — regras comerciais

| Campo | O que é |
| --- | --- |
| `locale`, `currency` | Formatação de preço e data |
| `shipping.freeShippingThreshold` | Subtotal a partir do qual o frete é grátis. `null` desliga |
| `shipping.flatRate` | Taxa fixa abaixo do limite |
| `shipping.estimatedDays` | Faixa de prazo exibida em `/frete` |
| `shipping.pendingLabel` | Texto mostrado até o cálculo no checkout |
| `installments` | Parcelamento: ligado/desligado, máximo de parcelas, valor mínimo, juros |
| `returns.windowDays` | Prazo de troca, usado em `/trocas` |
| `cart.storageKey` | Chave de armazenamento da sacola |
| `cart.maxQuantityPerItem` | Limite por item |
| `cart.lowStockThreshold` | Abaixo disso, o produto mostra "últimas peças" |
| `wishlist.storageKey` | Chave de armazenamento dos favoritos |
| `catalog.*` | Quantidades exibidas (destaques, novidades, promoção, relacionados) e tamanho da página |
| `coupons` | Lista de cupons. Vazia nesta versão |
| `checkout.enabled` | `false` mantém a finalização pelo atendimento |
| `checkout.plannedProviders` | Gateways previstos, apenas documentados |

> Os valores de frete, prazo e parcelamento são **demonstrativos**. Revise antes de publicar:
> eles aparecem em `/frete`, `/trocas`, na sacola e na página de produto.

## `seo.ts` — busca e metadados

`siteUrl` (vem de `NEXT_PUBLIC_SITE_URL`), `titleTemplate`, `defaultTitle`,
`defaultDescription`, `keywords`, `ogLocale`, `languageTag`, `twitterHandle`,
`defaultOgImage`, `verification` e `allowIndexing`.

## `social.ts` — redes

`handle`, `links` (com `enabled` por rede), `instagramGridEnabled` e `instagramGridSize`.
A grade da home e a coluna "Redes" do rodapé saem daqui.

## `analytics.ts` — medição

`googleAnalytics`, `googleTagManager`, `metaPixel` (todos vindos de variável de ambiente),
`enabled` (calculado: verdadeiro quando algum ID existe) e `debug`.

## `whatsapp.ts` — atendimento

`enabled`, `number`, `message`, `displayName`, `floating` (botão fixo no canto), `hours` e
`productMessageTemplate` (usa `{product}`).

## `forms.ts` — formulários

`newsletterConfig` e `contactConfig`: `endpoint`, `channel`,
`successMessage` e `disconnectedMessage`. Sem endpoint configurado, o formulário avisa que o
envio não está conectado.

## `news.ts` — faixa de novidades

`newsBannerConfig`: `enabled`, `label`, `message`, `linkLabel` e `href`. A faixa aparece logo
abaixo do header, em todas as páginas, e leva para a listagem de lançamentos. Não confundir com
`navigationConfig.announcement`: aquele é o aviso do topo, que lista condições da loja (frete,
troca, parcelamento); este anuncia o que entrou no catálogo.

Para tirar a faixa do site, use `enabled: false`.

## `index.ts` — `siteConfig`

Reexporta todos os módulos e monta um objeto único `siteConfig`, útil quando um componente
precisa de mais de uma área. No resto do código, prefira importar o módulo específico.

## Variáveis de ambiente

Veja a tabela completa em [`installation.md`](installation.md#variáveis-de-ambiente). Para
ativar analytics, por exemplo:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://minhaloja.com.br
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBER=5511987654321
```

Reinicie o servidor depois de alterar.
