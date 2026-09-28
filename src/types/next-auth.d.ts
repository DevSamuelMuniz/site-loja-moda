import type { UserRole } from '@/generated/prisma/enums';
import type { DefaultSession } from 'next-auth';

/**
 * O que a sessao carrega.
 *
 * `role` e `storeId` entram no token para a interface saber o que mostrar, mas **nao sao
 * autorizacao**: quem decide e `requireStaff`, lendo `users` no banco (escopo §23).
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      storeId: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    storeId: string;
  }
}

/* Sem augmentacao de `next-auth/jwt`: o `JWT` do @auth/core indexa `unknown` e o caminho
   reexportado nao funde, entao os campos do token sao validados na leitura, em `src/auth.ts`. */
