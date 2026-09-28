# Plataforma — decisões técnicas e FASE 1

Este documento registra as decisões que sustentam a evolução do site atual para a plataforma
descrita em [`../escopo.txt`](../escopo.txt). Decisão registrada aqui é decisão que não fica
implícita em código.

## Decisões da FASE 1

| Assunto | Decisão | Por quê |
| --- | --- | --- |
| Banco | **Neon** (Postgres, via Vercel Marketplace) | A loja já roda na Vercel. Serverless, free tier, branch de banco por ambiente e sem servidor para administrar |
| Acesso a dados | **Prisma** | Schema declarativo, migrations versionadas, tipos gerados e seed — menos código repetido justamente onde não se pode errar (dinheiro, estoque, pedido) |
| Autenticação | **Auth.js (NextAuth v5)** com provedor de credenciais e **sessões em JWT** | Login por senha com papéis por loja, sem amarrar o login ao provedor de banco. Ver a decisão detalhada abaixo |
| Hash de senha | `scrypt` do próprio Node (`node:crypto`) | Sem dependência externa e sem módulo nativo para compilar (escopo §40) |

Backend e frontend ficam **na mesma aplicação** (route handlers e server actions do Next),
porque toda operação precisa de sessão, autorização e tenant resolvidos no servidor. Se algum
dia houver necessidade real de separar, a camada de repositório já isola o acesso a dados.

## Variáveis de ambiente

| Variável | Para que serve | Onde |
| --- | --- | --- |
| `DATABASE_URL` | Conexão **com pool** usada pela aplicação | `.env.local` e Vercel (todas as fases) |
| `DIRECT_URL` | Conexão **direta**, usada por `prisma migrate` (o pool não suporta migration) | `.env.local` e Vercel |
| `AUTH_SECRET` | Assinatura das sessões do Auth.js | `.env.local` e Vercel (produção) |
| `SEED_ADMIN_PASSWORD` | Senha da conta de equipe criada pelo seed | Só onde o seed roda; **nunca** em produção |
| `SEED_ADMIN_EMAIL` | E-mail dessa conta (padrão `admin@aura.test`) | Idem |
| `SEED_DEMO_USERS` | Cria as contas de demonstração (cliente e operador inativo) | Só em ambiente de demonstração |

`DATABASE_URL`, `DIRECT_URL` e `AUTH_SECRET` são **obrigatórias desde a FASE 1**: o catálogo vem
do banco, o build lê o banco e o login falha sem a terceira. Nunca colocá-las em `NEXT_PUBLIC_*`
(escopo §30). As variáveis públicas atuais (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
analytics) continuam como estão.

O seed **não cria conta nenhuma por conta própria**: sem `SEED_ADMIN_PASSWORD` ele termina com
`usuarios: 0`. É proposital — assim um deploy em produção nunca nasce com uma senha conhecida, e
criar a conta de acesso passa a ser ato explícito do operador.

## Modelagem multi-tenant (escopo §22)

Regras que valem para **todas** as tabelas:

1. Toda entidade isolável carrega `store_id` com chave estrangeira para `stores`.
2. Todo índice de consulta começa por `store_id` (`@@index([storeId, slug])`).
3. Unicidade é **composta** com a loja: `@@unique([storeId, slug])`, `@@unique([storeId, sku])`.
   Duas lojas podem ter o mesmo slug de produto.
4. Nenhuma consulta pode confiar em `store_id` vindo do cliente. O tenant é resolvido no
   servidor: pela sessão do usuário (painel) ou pelo host da requisição (loja pública).
5. Dinheiro é `Decimal(10, 2)`, nunca ponto flutuante. O `stores` define a moeda.

Na FASE 1 existe uma loja só (a atual), criada pelo seed. A estrutura já nasce pronta para a
segunda, que é quando o custo de não ter feito isso aparece.

## Convenções do Prisma

- `id` em `cuid()` (texto). IDs sequenciais expõem volume e facilitam enumeração.
- `createdAt` e `updatedAt` em todas as tabelas.
- Entidades de catálogo com `deletedAt` (exclusão lógica): um pedido antigo precisa continuar
  conseguindo referenciar o produto que foi vendido.
- `@@map` para nomes de tabela em `snake_case`, campos em `camelCase`.
- Estados como `enum` do banco, não strings livres (`OrderStatus`, `PaymentStatus`…).

## Autenticação e permissões (escopo §23)

- **Sessões em JWT, sem o Prisma adapter.** Duas razões concretas, nesta ordem:
  1. O adapter exige `User.email` **globalmente único** e as tabelas `Account`, `Session` e
     `VerificationToken`. Aqui o e-mail é único **por loja** (`@@unique([storeId, email])`)
     de propósito, porque a mesma pessoa pode administrar lojas diferentes — adotar o adapter
     quebraria a regra 3 do multi-tenant.
  2. O Auth.js só suporta sessão gravada no banco para provedores **sem senha**. Login por
     senha exige a estratégia JWT.

  Então a revogação não vem do banco de sessões: o painel **recarrega o usuário de `users` a
  cada acesso** (`requireStaff`) e exige `active: true`. Desativar uma conta passa a valer na
  hora, mesmo com um token válido em mãos. O custo é uma consulta indexada por acesso ao painel.

- Papéis em `users.role`: `CUSTOMER`, `ADMIN`, `MANAGER`, `OPERATOR`. Quem entra no painel são
  `ADMIN`, `MANAGER` e `OPERATOR` (`src/lib/auth/guards.ts`). Permissão por módulo entra na
  FASE 2 — o eixo já está isolado em uma função só.
- Autorização é verificada **no backend**, em toda server action e route handler. Esconder
  botão no frontend não é autorização.
- O token carrega identidade, papel e loja para a interface saber o que mostrar, mas os campos
  são **validados na leitura** (`isUserRole`): token é entrada externa, não confiança.
- O tenant do login nunca vem do cliente: a loja é resolvida no servidor e a busca do usuário
  é escopada por ela (`storeId_email`).
- O cliente pode comprar **sem conta** quando a loja permitir (escopo §12). Nesse caso ele não
  é um `user`; é um `customer` identificado pelo pedido. Conta é conveniência, não pré-requisito.

## Caminho de migração a partir de `src/data`

O catálogo demonstrativo **não é descartado**: ele vira semente. Isso atende ao escopo §40
(nada de dado fictício como substituto de backend) sem jogar fora conteúdo já escrito.

1. **Schema + seed.** ✅ O seed lê `src/data/**` e grava no banco: loja, configuração, usuários,
   categorias, coleções, produtos, cores, tamanhos, estoque e imagens. Rodar de novo não duplica.
2. **Troca do repositório.** ✅ `src/lib/catalog` consulta o banco via `src/lib/catalog/source.ts`,
   mantendo as mesmas assinaturas (`getProductBySlug`, `queryProducts`, `getFacets`,
   `getRelatedProducts`…). As funções passaram a ser assíncronas.
3. **Páginas não mudam.** ✅ Elas já falavam só com o repositório: o que mudou foi `await`.
4. **`src/data` fica só como fonte do seed.** Pendente: quando o painel administrativo entrar
   (FASE 2), ele passa a ser o caminho de escrita e o seed deixa de ser usado.

## Escopo da FASE 1

**Entra:**

- `stores` — a loja, com moeda, idioma e identidade
- `settings` — configuração editável (marca, tema, e-commerce, SEO, redes) em JSON por loja
- `users` — acesso ao sistema, com papel
- `customers` — quem compra, com ou sem conta
- `categories` — os dois eixos já usados pelo site (público e tipo de peça)
- `collections`
- `products` e `product_variants` — a grade cor × tamanho, com SKU e estoque próprios
- `product_images`
- `inventory` e `inventory_movements` — saldo e movimentação (entrada, venda, ajuste…)
- Seed a partir do conteúdo atual
- Leitura pública pelo banco nas rotas de catálogo
- **Login da equipe** (`/entrar`) e **casca autenticada do painel** (`/admin`), com papéis
  validados no servidor

**Não entra (fica para FASE 2/3, conforme §41):** carrinho persistente, pedidos, checkout,
pagamentos, frete, cupons, avaliações, **edição de conteúdo no painel** e upload de imagens.

## Pronto quando

- ✅ `npx prisma validate` e `npx prisma generate` passam sem erro.
- ⏳ `npx prisma migrate` aplica contra o banco da Neon — **verificado em Postgres 16 local**;
  falta rodar contra o Neon provisionado.
- ✅ O seed cria 1 loja, 8 chaves de configuração, 9 categorias, 4 coleções e 14 produtos com
  cores, tamanhos e estoque (201 variações, 520 peças), e é idempotente.
- ✅ `/produtos`, `/produtos/[slug]`, `/categoria/[slug]`, `/colecoes` e `/busca` leem do banco.
  Prova: alterar uma linha em `products` e reconstruir muda a página; o arquivo em `src/data`
  não manda mais.
- ✅ As páginas continuam **visualmente idênticas** — a FASE 1 troca a origem do dado, não o design.
- ✅ `npm run verify` verde.
- ✅ Visita anônima a `/admin` redireciona para `/entrar`; conta `CUSTOMER` é recusada com
  `erro=permissao` mesmo com sessão válida; conta inativa não recebe sessão nem com a senha certa.

## O que depende de você

1. **Provisionar o Neon** (Vercel → Storage → Neon) e copiar as duas connection strings.
2. Colocar `DATABASE_URL`, `DIRECT_URL` e `AUTH_SECRET` no `.env.local` — e, para produção, nas
   Environment Variables da Vercel. Depois: `npm run db:deploy` e `npm run db:seed` apontando
   para o Neon, com `SEED_ADMIN_PASSWORD` definido **apenas** naquele momento (a conta de acesso
   precisa existir; a senha não pode ser conhecida).
3. `git add escopo.txt AGENTS.md prisma/ prisma.config.ts src/auth.ts src/lib/auth src/lib/db.ts
   src/lib/catalog/source.ts docs/platform.md` — hoje boa parte disso está fora do versionamento.
