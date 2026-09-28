import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Cliente Prisma.
 *
 * No Prisma 7 o engine Rust saiu: a conexao passa por um driver adapter e o
 * `PrismaClient` recebe `adapter` em vez de `datasources`.
 *
 * Regras de uso:
 * - **Somente servidor.** Rotas, server actions e o repositorio do catalogo. Importar
 *   isto em componente cliente colocaria credencial de banco no bundle (escopo §30, §33).
 * - **Criacao preguicosa.** O cliente nasce na primeira consulta, nunca no `import`. Isto
 *   nao e estilo: `import` de ESM e avaliado antes de qualquer codigo do modulo, entao um
 *   `throw` no escopo do modulo dispararia antes de o `dotenv` carregar `.env.local` — e o
 *   seed depende disso. De quebra, evita efeito colateral em tempo de importacao.
 * - O singleton fica no `globalThis` para nao abrir um pool novo a cada hot reload.
 * - `DATABASE_URL` ausente e erro de configuracao, nao estado valido: a loja nao funciona
 *   sem banco, e falhar alto e melhor do que servir catalogo vazio em silencio.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL nao configurada. Copie `.env.example` para `.env.local` e preencha com a connection string do Neon.',
    );
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  globalForPrisma.prisma = client;
  return client;
}
