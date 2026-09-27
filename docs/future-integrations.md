# Integrações futuras

O que já está preparado e onde encaixar cada peça.

## O caminho de migração

```
Hoje                          Depois
src/data/**        ──────►    PostgreSQL / Supabase / API
src/lib/catalog    ──────►    mesma assinatura, outra origem
localStorage       ──────►    sacola e favoritos no servidor, por conta
config/checkout    ──────►    gateway de pagamento
```

Como as páginas falam apenas com `src/lib/catalog`, a troca de origem não toca em componente.

## Banco de dados

Tabelas sugeridas:

```sql
products            id, slug, name, description, story, category_id, collection_id,
                    audience, price, compare_at_price, sku, composition, care, details,
                    measurements, tags, rating, review_count, sold_count, released_at,
                    featured, is_new, is_sale, stock, published_at
product_colors      id, product_id, name, slug, hex, image, sku, stock, price, compare_at_price
product_variants    id, product_id, color_id, size, sku, stock, price
categories          id, slug, name, kind, audience, description, image, featured, position
collections         id, slug, name, tagline, description, image, badge, featured, released_at
customers           id, name, email, phone, created_at
addresses           id, customer_id, label, street, number, complement, district, city,
                    state, postal_code, country
orders              id, number, customer_id, status, subtotal, discount, shipping, total,
                    coupon_id, created_at
order_items         id, order_id, product_id, variant_id, quantity, unit_price, total
payments            id, order_id, provider, method, status, amount, external_id, payload
coupons             id, code, type, value, minimum_subtotal, active, expires_at
inventory_movements id, variant_id, quantity, reason, created_at
```

Depois, em `src/lib/catalog/index.ts`, troque as leituras de `src/data` por consultas,
mantendo as assinaturas (`getProductBySlug`, `queryProducts`, `getFacets`,
`getRelatedProducts`…). As páginas não mudam.

**Atenção aos pontos que hoje são calculados em memória:** facetas, contagem por filtro,
relacionados e paginação. Em banco, isso vira `GROUP BY` para as facetas e `ORDER BY`/`LIMIT`
para a listagem — mesmo resultado, outra implementação.

## Painel administrativo e CMS

Estrutura prevista:

```
Admin  →  Banco  →  Produtos · Coleções · Categorias · Conteúdo  →  Site
```

Enquanto o admin não existe, o conteúdo demonstrativo em `src/data/` cumpre o papel. Quando
existir, as telas do admin escrevem nas tabelas acima e o site lê pelo repositório.

## Pagamento

Gateways previstos (apenas documentados, **nada integrado**):
Mercado Pago, Stripe, PagSeguro.

Fluxo sugerido:

1. `POST /api/checkout` no servidor: valida a sacola, recalcula preços **no servidor** (nunca
   confie no valor enviado pelo cliente), cria o pedido com status `pending` e uma preferência
   no gateway.
2. Redireciona para o gateway (Pix, cartão, boleto).
3. `POST /api/webhooks/<provider>` recebe a confirmação, valida a assinatura, atualiza
   `payments` e `orders`, e dá baixa no estoque.
4. `/pedido/[number]` mostra o status.

Chaves de API ficam em variáveis de ambiente **sem** `NEXT_PUBLIC_`, usadas somente no
servidor.

## Cálculo de frete

Hoje o frete é uma configuração (`ecommerceConfig.shipping`). Para cálculo real: crie uma
route handler que receba o CEP e o subtotal, consulte a transportadora e devolva as opções. O
`computeTotals` passa a receber o valor escolhido em vez da taxa fixa.

## Conta de cliente

`WishlistEntry` já tem o formato `{ productSlug, addedAt }` e `CartLine` já é uma lista de
itens — ou seja, migrar sacola e favoritos para o servidor é trocar a origem dos dados nos
providers, sem mexer na interface.

Recomendado: autenticação com sessão em cookie `httpOnly`, rota `/conta` com pedidos,
endereços e favoritos, e o menu de conta do header (`src/components/navigation/Header.tsx`)
passando a apontar para ela em vez de exibir a nota atual.

## Cupons

A estrutura `CouponConfig` já existe em `src/config/ecommerce.ts` (código, tipo, valor,
subtotal mínimo, ativo) e `CartTotals.discount` está reservado para isso. Falta: campo na
sacola, validação no servidor e aplicação no total.

## Busca

A busca atual é textual sobre o catálogo em memória e cobre nome, categoria, coleção, SKU e
tags. Quando o catálogo crescer, os pontos de troca são `matchesQuery` e `searchProducts`
(`src/lib/catalog/`) — a interface de busca não muda.

## Multi-tenant

A arquitetura já separa conteúdo (dados), identidade (tema) e regras (configuração). Para
servir várias lojas:

```
Plataforma
├── Loja A  →  tema A + dados A + configuração A + domínio A
├── Loja B  →  tema B + dados B + configuração B + domínio B
└── Loja C  →  …
```

Passos concretos:

1. Trocar os módulos de `src/config/` por uma função que recebe o tenant
   (`getConfig(tenantId)`) — o formato dos objetos não muda.
2. Resolver o tenant no middleware a partir do domínio e injetá-lo no contexto da requisição.
3. Filtrar dados por `tenant_id` no repositório.
4. Manter tema, SEO, analytics, WhatsApp e integrações por loja na mesma estrutura de tabelas.

## Lista de prioridades sugeridas

| Ordem | Item | Por quê |
| --- | --- | --- |
| 1 | Trocar imagens e revisar textos e políticas | É o que mais afeta a percepção da marca |
| 2 | Configurar `NEXT_PUBLIC_SITE_URL` e analytics | Sem isso, medição e SEO ficam incompletos |
| 3 | Banco de dados + admin | Sem isso, cada mudança de catálogo é um deploy |
| 4 | Checkout + gateway | Habilita a venda direta |
| 5 | Cálculo de frete real | Reduz atrito e erro de cobrança |
| 6 | Conta de cliente | Persiste sacola e favoritos entre dispositivos |
| 7 | Cupons | Ação comercial |
