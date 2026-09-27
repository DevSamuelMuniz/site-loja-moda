# Deploy

## Build local

```bash
npm install
npm run verify      # typecheck + lint + build
npm run start       # http://localhost:3000
```

`npm run build` gera 45 páginas estáticas (home, listagens, políticas e uma por produto) e
deixa dinâmicas as rotas que leem filtros da URL (`/produtos`, `/categoria/[slug]`,
`/colecoes/[slug]`, `/busca`).

## Variáveis de ambiente

Mínimo para produção:

```bash
NEXT_PUBLIC_SITE_URL=https://minhaloja.com.br
```

Recomendado:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=5511987654321
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ALLOW_INDEXING=false     # em homologação
```

Tabela completa em [`installation.md`](installation.md#variáveis-de-ambiente).

> Sem `NEXT_PUBLIC_SITE_URL`, canonical, Open Graph, sitemap e robots apontam para
> `http://localhost:3000`. É o erro de deploy mais fácil de cometer.

## Vercel

1. Suba o repositório no Git.
2. Importe o projeto na Vercel. O framework é detectado automaticamente.
3. Configure as variáveis de ambiente no painel (as `NEXT_PUBLIC_*` valem no build).
4. Deploy.

## Node em servidor próprio

```bash
npm ci
npm run build
NODE_ENV=production npm run start
```

Coloque um proxy reverso (Nginx, Caddy) na frente e sirva em HTTPS. O Next cuida das rotas,
dos assets e do cache de imagens.

## Docker

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

As variáveis `NEXT_PUBLIC_*` precisam existir **no estágio de build**, porque o Next as
incorpora no bundle.

## Imagens

- Fotos editoriais vêm de `images.unsplash.com`, autorizado em `next.config.ts`.
- A arte do catálogo é SVG local, servida pelo otimizador com `dangerouslyAllowSVG: true`.
- Ao passar a usar só arquivos próprios em `public/images/`, remova o `remotePatterns`. Ao
  remover o último SVG, desligue `dangerouslyAllowSVG` e `contentDispositionType`.

Não é preciso configurar domínio de terceiro quando tudo é local.

## Cache e atualização

O catálogo vem de arquivos do próprio projeto, então cada alteração de conteúdo gera um novo
build. Nada de revalidação em tempo de execução.

Quando os dados passarem a vir de banco ou CMS, defina a estratégia (ISR com `revalidate`,
ou `dynamic = 'force-dynamic'` nas rotas de catálogo) — veja
[`future-integrations.md`](future-integrations.md).

## Checklist antes de publicar

- [ ] `npm run verify` passa sem erro.
- [ ] `NEXT_PUBLIC_SITE_URL` com o domínio real.
- [ ] `src/config/brand.ts` com nome, contatos e endereço reais.
- [ ] `src/config/ecommerce.ts` com frete, prazo de troca e parcelamento revisados.
- [ ] `src/config/whatsapp.ts` com o número de atendimento.
- [ ] Imagens trocadas por fotos próprias (veja [`customization.md`](customization.md)).
- [ ] Termos, privacidade e cookies revisados por quem responde pela loja.
- [ ] `/sitemap.xml` e `/robots.txt` conferidos na URL publicada.
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=false` removido no ambiente de produção.
