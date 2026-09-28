# AGENTS.md

Este repositório é a base de uma **plataforma de e-commerce para lojas de moda** — não um site
institucional nem uma vitrine estática.

O escopo é **vinculante** e vive em [`escopo.txt`](escopo.txt). Leia-o inteiro antes de
implementar qualquer funcionalidade.

## Checklist obrigatório antes de implementar (escopo §43)

1. A funcionalidade pertence à loja pública ou ao painel administrativo?
2. Precisa de persistência em banco?
3. Precisa de autenticação?
4. Precisa de controle de permissão?
5. Precisa respeitar o tenant (`store_id`)?
6. Afeta estoque?
7. Afeta pedidos?
8. Afeta pagamentos?
9. Afeta analytics?
10. Precisa ser configurável pelo lojista, sem tocar em código?

Se qualquer resposta for "sim" e a implementação não passar por backend + banco, **não
implemente**. Dado fictício no frontend não substitui backend real (escopo §3 e §40).

## Invariantes — não quebrar

- **A interface atual é a referência visual e estrutural** (escopo §4). Preserve hierarquia,
  responsividade, navegação, identidade da loja, componentização e a experiência de compra.
- **Nenhum dado de negócio dentro de componente.** Hoje isso vale via `src/config/**` e
  `src/lib/catalog/**`; na plataforma esses dados passam a vir do banco. A regra não muda.
- **Nada de backend falso.** Não existe "salvar" que só altera a tela, nem array fixo fingindo
  ser catálogo.
- **Multi-tenant desde a modelagem** (escopo §22): toda entidade isolável carrega `store_id`, e
  nenhuma loja lê dados de outra.
- **Permissão é validada no backend** (escopo §23). Esconder botão no frontend não é autorização.
- **Segredo só no servidor** (escopo §30). Nunca em variável `NEXT_PUBLIC_*`.
- **Nada de dependência desnecessária** (escopo §40).
- `npm run verify` precisa estar verde antes de qualquer entrega.

## Arquitetura atual

```
src/
├── app/            rotas (App Router): home, catálogo, produto, categoria, coleção, busca,
│                   favoritos, carrinho, páginas institucionais, sitemap, robots
├── components/     layout · navigation · hero · products · collections · categories · cart
│                   wishlist · search · filters · lookbook · marketing · ui · seo
├── config/         brand · theme · navigation · ecommerce · seo · social · analytics
│                   whatsapp · news · forms      ← identidade e regras (hoje, constantes)
├── data/           produtos · categorias · coleções · lookbook · depoimentos · conteúdo · mídia
├── lib/            catalog (repositório) · theme · seo · cart · analytics · forms · format
│                   images · fonts · dismiss · overlay-motion · utils
├── styles/         tokens.css (medidas e movimento) · theme.css (@theme e utilitários)
└── types/          product · category · collection · cart · content · filters · theme
```

O ponto de troca já existe: **as páginas só falam com `src/lib/catalog`**. Substituir os
arquivos de `src/data` por consultas ao banco não deve exigir alterar página nenhuma.

## De onde vem cada coisa

| Assunto | Hoje | Alvo na plataforma |
| --- | --- | --- |
| Catálogo, categorias, coleções | `src/data/**` | banco, lido via `src/lib/catalog` |
| Identidade da loja (nome, cores, fontes, banners) | `src/config/brand.ts`, `theme.ts` | tabela `settings` por tenant, editável no painel |
| Carrinho e favoritos | `localStorage` | banco por cliente; visitante em armazenamento local até fazer login |
| Pedidos, clientes, pagamentos | não existem | banco + API |
| Estoque | campo `stock` no produto/cor | `inventory` + `inventory_movements` |
| Frete, cupom, parcelamento | `src/config/ecommerce.ts` | configuração da loja no banco |
| Imagens | `public/images` + CDN externo | storage do provedor, com upload pelo painel |
| Analytics | eventos tipados, sem destino | eventos com destino configurado por loja |

## Comandos

```bash
npm run dev         # desenvolvimento
npm run verify      # typecheck + lint + build — obrigatório antes de entregar
npm run typecheck
npm run lint
npm run format
```

## Roadmap (escopo §41) e estado

| Fase | Conteúdo | Estado |
| --- | --- | --- |
| 1 — Fundação | backend, banco, autenticação, modelagem de loja, produtos, categorias, variações | não iniciada |
| 2 — Operação | estoque, carrinho, pedidos, clientes, admin | não iniciada |
| 3 — Venda | checkout, pagamentos, frete, cupons | não iniciada |
| 4 — Crescimento | avaliações, analytics, WhatsApp, carrinho abandonado, relatórios | não iniciada |
| 5 — Plataforma | multi-tenant, domínio próprio, personalização, múltiplos usuários, integrações | não iniciada |

As decisões técnicas de cada fase ficam registradas em [`docs/`](docs/) — a começar pelo
stack da FASE 1.
