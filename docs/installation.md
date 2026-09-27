# Instalação

## Requisitos

- **Node.js 20.9** ou superior (o projeto usa Next.js 16 com React 19)
- **npm** 10 ou superior

Confira:

```bash
node --version
npm --version
```

## Instalar e rodar

```bash
npm install
npm run dev
```

O site sobe em `http://localhost:3000`.

## Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com recarga rápida |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção (rode `build` antes) |
| `npm run typecheck` | Verificação de tipos com `tsc --noEmit` |
| `npm run lint` | ESLint com a configuração flat do Next.js |
| `npm run format` | Formata todo o projeto com Prettier |
| `npm run format:check` | Verifica formatação sem alterar arquivos |
| `npm run verify` | `typecheck` + `lint` + `build`, na ordem |

## Variáveis de ambiente

O projeto funciona sem nenhuma variável — todos os campos têm valor padrão demonstrativo.
Para publicar, copie o modelo e preencha:

```bash
cp .env.example .env.local
```

| Variável | Para que serve | Padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL absoluta do site (canonical, Open Graph, sitemap, robots) | `http://localhost:3000` |
| `NEXT_PUBLIC_THEME` | Tema ativo (`minimal`, `luxury`, `streetwear`, `feminine`, `bold`, `sport`, `corporate`) | `minimal` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número no formato internacional, só dígitos | `5581999999999` |
| `NEXT_PUBLIC_GA_ID` | Measurement ID do Google Analytics 4 | vazio |
| `NEXT_PUBLIC_GTM_ID` | ID do Google Tag Manager | vazio |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID do Meta Pixel | vazio |
| `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` | Endpoint que recebe o POST do cadastro | vazio |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Endpoint que recebe o POST do formulário de contato | vazio |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Código de verificação do Search Console | vazio |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` bloqueia toda a indexação | indexação liberada |

Depois de alterar variáveis, reinicie o `npm run dev` — o Next.js lê `.env.local` na
inicialização.

## Antes de publicar

1. `npm run verify` precisa passar sem erro de tipo e sem erro de lint.
2. Preencha `NEXT_PUBLIC_SITE_URL` com o domínio real: canonical, Open Graph, `sitemap.xml` e
   `robots.txt` dependem dele.
3. Revise os valores de `src/config/ecommerce.ts` (frete, prazo de troca, parcelamento) — são
   demonstrativos.
4. Troque as imagens demonstrativas (veja [`customization.md`](customization.md)).
5. Configure WhatsApp e, se for usar, os identificadores de analytics.

## Problemas comuns

**A porta 3000 está ocupada**

```bash
npm run dev -- --port 3001
```

**Erro de tipo depois de editar dados**

Rode `npm run typecheck`. Os tipos de `src/types/` são a fonte da verdade: um campo novo em
`Product` precisa existir em todos os produtos de `src/data/products/index.ts`.

**Imagens remotas não carregam**

Fotos editoriais vêm de `images.unsplash.com`, autorizado em `next.config.ts`. Se você trocar
a origem das imagens, atualize `images.remotePatterns` lá.

**Build falha ao baixar fontes**

As fontes são carregadas por `next/font` em `src/lib/fonts.ts`, que baixa os arquivos em tempo
de build. Em ambiente sem rede, troque por `next/font/local` com os arquivos em `public/fonts/`.
