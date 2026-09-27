# E-commerce

O que já está implementado, o que está deliberadamente desligado e onde cada coisa vai quando
o checkout entrar.

## Estado atual

| Área | Situação |
| --- | --- |
| Catálogo, busca, filtros, ordenação, paginação | Completo |
| Página de produto (galeria, cor, tamanho, estoque, SKU, parcelamento) | Completo |
| Sacola (quantidade, item, salvar para depois, totais, frete estimado) | Completo, no navegador |
| Favoritos | Completo, no navegador |
| **Checkout e pagamento** | **Desligado** — `ecommerceConfig.checkout.enabled: false` |
| Conta de cliente | Não existe nesta versão |
| Cupom | Estrutura de dados pronta, sem aplicação |

Nada aqui simula pagamento: a sacola orienta a finalizar pelo atendimento e mostra a nota
configurada em `ecommerceConfig.checkout.note`.

## Sacola

- **Onde vive**: `localStorage`, na chave `ecommerceConfig.cart.storageKey` (`aura.cart.v1`).
  Itens salvos para depois ficam na mesma chave com sufixo `.saved`.
- **Formato**: `CartLine[]` — `{ key, productSlug, colorSlug, size, quantity, addedAt }`.
  A `key` é `produto::cor::tamanho`, então a mesma peça em tamanhos diferentes são linhas
  distintas.
- **Hidratação**: a leitura acontece só depois da montagem, e o servidor sempre renderiza a
  sacola vazia. Isso evita divergência de hidratação.
- **Sincronização**: o evento `storage` mantém duas abas abertas alinhadas.
- **Limites**: `cart.maxQuantityPerItem` (padrão 10).
- **Falha de armazenamento** (modo privado): a sacola continua funcionando só na sessão.

## Cálculo dos totais

`src/lib/cart.ts` → `computeTotals(lines, index)`:

```
subtotal = Σ (preço × quantidade)
discount = Σ ((preço anterior − preço) × quantidade)   ← informativo, NÃO é subtraído
shipping = 0 se o subtotal atingiu o frete grátis, senão a taxa fixa
total    = subtotal + shipping
```

> `discount` é a economia acumulada, exibida como "Você economiza". Os preços promocionais já
> entram no subtotal, então subtraí-lo de novo seria descontar duas vezes. O campo fica
> reservado para cupom.

Enquanto o checkout está desligado, a linha de frete mostra
`ecommerceConfig.shipping.pendingLabel` ("Calculado no checkout").

## Favoritos

Mesmo modelo da sacola, chave `ecommerceConfig.wishlist.storageKey`. A estrutura já é uma
lista de entradas com data (`{ productSlug, addedAt }`), para que associar favoritos a uma
conta no futuro seja só trocar a origem dos dados — a interface não muda.

## Frete e prazo

Definidos em `src/config/ecommerce.ts`:

```ts
shipping: {
  freeShippingThreshold: 299,      // null desliga o frete grátis
  flatRate: 24.9,
  estimatedDays: { min: 3, max: 9 },
  pendingLabel: 'Calculado no checkout',
  note: 'Valores demonstrativos…',
}
```

Esses valores aparecem na sacola, em `/frete` e no resumo do pedido. São **demonstrativos**:
substitua pelas condições reais antes de publicar.

## Parcelamento

`installments` controla se aparece, o máximo de parcelas, o valor mínimo por parcela e se há
juros. O cálculo está em `src/lib/format.ts` → `buildInstallmentPlan(price)` e é exibido na
página de produto, abaixo do preço.

## Cupom

`ecommerceConfig.coupons` é uma lista tipada (`CouponConfig`: código, tipo, valor, subtotal
mínimo, descrição, ativo) que já está no formato certo, mas ainda não há campo de aplicação na
sacola. O caminho natural:

1. aplicar o cupom na sacola (`CartProvider`);
2. guardar o cupom aplicado junto das linhas;
3. subtrair de `discount` no `computeTotals`;
4. emitir o evento `begin_checkout` com o valor final.

## Ligar o checkout

1. Configure o gateway e as chaves de API **no servidor** (variáveis sem `NEXT_PUBLIC_`).
2. Crie uma route handler que valide o pedido e crie a preferência de pagamento.
3. Marque `ecommerceConfig.checkout.enabled = true`.
4. Troque o bloco de finalização em `src/components/cart/CartView.tsx` pelo fluxo real
   (endereço → frete → pagamento → confirmação).

Enquanto `checkout.enabled` for `false`, a interface mantém o aviso e nunca finge um pagamento.

## Estrutura de dados prevista

Os tipos já existem em `src/types/` para o que vem depois:

| Conceito | Hoje | Depois |
| --- | --- | --- |
| `Product` | `src/data/products` | tabela `products` |
| `ProductVariant` | campo opcional no produto | tabela `product_variants` |
| `ProductColor` | campo do produto | tabela `product_colors` |
| `CartLine` | `localStorage` | carrinho no servidor, por sessão ou conta |
| `WishlistEntry` | `localStorage` | favoritos por conta |
| Estoque | `stock` na cor/produto | inventário transacional |
| `Order`, `Payment`, `Coupon`, `Address` | não implementados | veja [`future-integrations.md`](future-integrations.md) |

## Eventos de conversão

Já disparados a partir da sacola e da página de produto (quando há analytics configurado):

`view_item`, `add_to_cart`, `remove_from_cart`, `search`, `view_category`,
`add_to_wishlist`, `newsletter_signup`.

Falta apenas `begin_checkout`, que depende do checkout existir. Detalhes em
[`analytics.md`](analytics.md).
