# Analytics

## Princípio

Nada é enviado enquanto a loja não configurar um identificador de medição. Nenhum ID está
escrito no código, e nenhum script de terceiro é carregado pelo projeto: se o provedor estiver
configurado, ele já terá publicado `window.gtag`, `window.dataLayer` ou `window.fbq`.

## Configuração

`src/config/analytics.ts`:

```ts
export const analyticsConfig = {
  enabled: Boolean(googleAnalytics || googleTagManager || metaPixel),
  debug: process.env.NODE_ENV === 'development',
  googleAnalytics: process.env.NEXT_PUBLIC_GA_ID ?? '',
  googleTagManager: process.env.NEXT_PUBLIC_GTM_ID ?? '',
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
};
```

Ativar é só preencher `.env.local`:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# ou
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

`enabled` vira verdadeiro automaticamente e os eventos começam a sair.

## Eventos

Nome, onde dispara e o que leva:

| Evento | Onde dispara | Payload |
| --- | --- | --- |
| `view_item` | Página de produto, ao montar | `currency`, `value`, `items` |
| `add_to_cart` | Adicionar na página, na adição rápida do card e no drawer | `currency`, `value`, `quantity`, `items` |
| `remove_from_cart` | Remover uma linha da sacola | `currency`, `value`, `quantity`, `items` |
| `search` | Busca do header, página `/busca` | `search_term`, `results` |
| `view_category` | Página de categoria | `category`, `category_label` |
| `add_to_wishlist` | Favoritar uma peça | `item_id` |
| `newsletter_signup` | Cadastro confirmado pela newsletter | `source` |
| `begin_checkout` | **Ainda não disparado** — depende do checkout existir | — |

Os eventos são funções tipadas em `src/lib/analytics.ts`:

```ts
trackViewItem({ slug, name, price, category }, currency);
trackAddToCart({ slug, name, price }, quantity, currency);
trackRemoveFromCart(item, quantity, currency);
trackSearch(term, results);
trackViewCategory(slug, label);
trackAddToWishlist(slug);
trackNewsletterSignup(source);
track('nome_customizado', { chave: 'valor' });
```

Itens são convertidos para o formato de e-commerce (`item_id`, `item_name`, `price`,
`item_category`), o mesmo aceito por GA4.

## Como cada provedor recebe

Em `track()`:

1. **GA4** — `gtag('event', nome, payload)`;
2. **GTM** — `dataLayer.push({ event, ...payload })`;
3. **Meta Pixel** — eventos equivalentes (`ViewContent`, `AddToCart`, `InitiateCheckout`,
   `Search`) e `trackCustom` para os demais.

## Verificar se está funcionando

Com `NEXT_PUBLIC_GA_ID` vazio, a função retorna na primeira linha — nada acontece, nem no
console. Para conferir o comportamento sem serviço externo, defina um ID de teste e observe a
aba Network: as chamadas aparecem apenas depois de configurar o provedor correspondente.

Durante o desenvolvimento, `analyticsConfig.debug` faz o evento ser registrado com
`console.warn('[analytics]', evento, payload)`. Desligue `debug` em produção.

## Adicionar um provedor novo

1. Acrescente o campo em `analyticsConfig` lendo de uma variável de ambiente.
2. Inclua o campo no cálculo de `enabled`.
3. Trate o provedor dentro de `track()` (`src/lib/analytics.ts`), sem criar ramificação nos
   componentes.

## Adicionar um evento novo

1. Registre o nome em `analyticsEvents` (`src/config/analytics.ts`).
2. Crie uma função tipada em `src/lib/analytics.ts` (evita nome de evento divergente entre
   telas).
3. Chame a função no ponto em que a ação acontece — nunca no componente de apresentação.

## Privacidade

- Cookies de medição só existem quando um ID está configurado. Caso contrário, nenhum cookie
  de terceiro é criado — é o que a página `/cookies` afirma.
- O armazenamento local (sacola e favoritos) é do próprio site e não identifica a pessoa.
- Ao ativar analytics em produção, revise o texto de `/privacidade` e `/cookies` para
  descrever exatamente o que passou a ser medido.
