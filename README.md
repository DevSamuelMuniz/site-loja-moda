# AURA — site de loja de roupas

Site de marca e catálogo para uma loja de roupas, construído com **Next.js (App Router)**,
**TypeScript** e **Tailwind CSS v4**. Não é uma landing page: é uma experiência de
marca + catálogo + conversão, pronta para evoluir para e-commerce completo.

Todo o conteúdo demonstrativo pertence à marca fictícia **AURA** e pode ser trocado sem
tocar em nenhum componente.

---

## Começando

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros scripts:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config flat) |
| `npm run format` | Prettier em todo o projeto |
| `npm run verify` | `typecheck` + `lint` + `build` |

Requisitos: Node 20.9 ou superior.

---

## Estrutura

```
src/
├── app/                  Rotas (App Router), layout raiz, sitemap, robots, 404
├── components/           layout · navigation · hero · products · collections · categories
│                         cart · wishlist · search · filters · lookbook · marketing · ui · seo
├── config/               Marca, tema, navegação, e-commerce, SEO, social, analytics, WhatsApp, formulários
├── data/                 Produtos, categorias, coleções, lookbook, depoimentos, conteúdo institucional
├── lib/                  Repositório do catálogo, tema, formatação, analytics, SEO, formulários
├── styles/               Tokens estáticos e mapeamento do tema para o Tailwind
└── types/                Tipos do domínio
```

Regra central: **componente não conhece dado**. Produto vem de `src/lib/catalog`, identidade
visual vem de `src/config/theme.ts`, textos de marca vêm de `src/config/brand.ts`.

---

## Onde mudar cada coisa

| Quero mudar… | Edite |
| --- | --- |
| Nome, slogan, logo, contatos, endereço | `src/config/brand.ts` |
| Cores, fontes, raios, sombras, estilo de botão | `src/config/theme.ts` |
| Menus do header, rodapé e faixa de aviso | `src/config/navigation.ts` |
| Frete, parcelamento, prazo de troca, paginação | `src/config/ecommerce.ts` |
| Título, descrição, Open Graph, indexação | `src/config/seo.ts` |
| Instagram, TikTok, Facebook | `src/config/social.ts` |
| WhatsApp (número, mensagem, botão flutuante) | `src/config/whatsapp.ts` |
| Analytics (GA4, GTM, Meta Pixel) | `src/config/analytics.ts` + variáveis de ambiente |
| Produtos | `src/data/products/index.ts` |
| Categorias | `src/data/categories/index.ts` |
| Coleções | `src/data/collections/index.ts` |
| Lookbook | `src/data/lookbook/index.ts` |
| Depoimentos | `src/data/testimonials/index.ts` |
| Perguntas frequentes, políticas, guia de tamanhos, Instagram | `src/data/content/` |
| Sobre a marca e benefícios | `src/data/brand/index.ts` |
| Imagens (manifesto) | `src/data/media.ts` |

O passo a passo de cada troca está em [`docs/`](docs/), começando por
[`docs/customization.md`](docs/customization.md).

---

## Identidade visual

As cores, fontes, raios e sombras **não** ficam nos componentes. Elas são um tema em
`src/config/theme.ts`, convertido em variáveis CSS por `src/lib/theme.ts` e injetado no
`<html>` pelo layout raiz.

Isso significa que:

- o briefing pede sete variáveis (`--color-primary`, `--color-background`,
  `--color-foreground`, `--color-muted`, `--color-surface`, `--color-border`,
  `--color-accent`) e elas existem com esses nomes;
- trocar de tema não exige alterar componente nenhum;
- os componentes usam utilitários do Tailwind (`bg-primary`, `text-muted`, `rounded-sm`),
  que apontam para essas variáveis.

Temas prontos: `minimal` (padrão), `luxury`, `streetwear`, `feminine`, `bold`, `sport`,
`corporate` e `custom`. Detalhes em [`docs/themes.md`](docs/themes.md).

---

## O que é demonstrativo e o que é real

Para não prometer o que não existe:

- **Pagamento não está integrado.** O checkout está desligado
  (`ecommerceConfig.checkout.enabled: false`) e a sacola orienta a finalizar pelo
  atendimento. Nenhum gateway falso, nenhum pagamento simulado.
- **Formulários não inventam envio.** Newsletter e contato postam para um endpoint
  configurado por variável de ambiente. Sem endpoint, a interface avisa que o envio ainda
  não está conectado.
- **Analytics não dispara nada** enquanto não houver um identificador de medição
  configurado.
- **Preços, prazos e condições** são valores demonstrativos editáveis em
  `src/config/ecommerce.ts` e nos dados — não são condições comerciais reais.
- **Fotografias** editoriais são URLs verificadas do Unsplash CDN; a arte dos produtos é
  vetorial, gerada para o catálogo demonstrativo. Ambas trocáveis sem tocar em componente.

---

## Acessibilidade e desempenho

- HTML semântico, marcos de navegação nomeados e hierarquia de títulos consistente.
- Todo controle tem rótulo; ícones isolados têm `aria-label`; o resultado de ações aparece em
  regiões `aria-live`.
- Foco visível em todo o site, foco preso em modais e painéis laterais, `Esc` fecha.
- `prefers-reduced-motion` desliga animações e rolagem suave.
- Server Components por padrão; cada `use client` tem uma justificativa no arquivo.
- `next/image` com `sizes` por contexto, AVIF/WebP, e apenas o necessário em JavaScript no
  cliente (sacola, favoritos, seletores de produto, filtros do mobile, formulários).

---

## Documentação

- [Arquitetura](docs/architecture.md)
- [Instalação](docs/installation.md)
- [Configuração](docs/configuration.md)
- [Produtos](docs/products.md) · [Coleções](docs/collections.md) · [Categorias](docs/categories.md)
- [Temas](docs/themes.md) · [Personalização](docs/customization.md)
- [E-commerce](docs/ecommerce.md) · [SEO](docs/seo.md) · [Analytics](docs/analytics.md)
- [Deploy](docs/deployment.md) · [Integrações futuras](docs/future-integrations.md)
