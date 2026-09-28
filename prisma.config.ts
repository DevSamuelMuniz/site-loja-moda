import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

/**
 * Configuracao do Prisma CLI.
 *
 * No Prisma 7 este arquivo e obrigatorio: o bloco `datasource` do schema guarda apenas o
 * provider, e a URL vem daqui. O Prisma tambem deixou de carregar `.env` sozinho, entao o
 * `dotenv` e chamado de forma explicita — na mesma ordem que o Next usa (`.env.local`
 * primeiro, `.env` depois).
 *
 * `DATABASE_URL` vazia nao derruba o `prisma generate`: gerar o cliente e uma operacao
 * offline, e o build precisa funcionar em ambiente sem banco. Ja `migrate` e `db pull`
 * exigem a URL de verdade e falham com mensagem clara se ela nao existir.
 */
loadEnv({ path: ['.env.local', '.env'], quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    /* Conexao com pool: e a que a aplicacao usa em producao (Neon + pgBouncer). */
    url: databaseUrl,
    /* Conexao direta: migrations nao funcionam atraves do pool. */
    ...(process.env.DIRECT_URL ? { directUrl: process.env.DIRECT_URL } : {}),
  },
});
