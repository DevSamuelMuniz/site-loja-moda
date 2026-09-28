import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { fakeVerify, verifyPassword } from '@/lib/auth/password';
import { isUserRole } from '@/lib/auth/roles';
import { getPrisma } from '@/lib/db';

/**
 * Autenticacao (escopo §23).
 *
 * Decisao registrada em `docs/platform.md`: sessoes em JWT, sem o adaptador Prisma.
 * Motivo concreto — o adaptador exige `User.email` globalmente unico e as tabelas
 * `Account`/`Session`/`VerificationToken`, mas aqui o e-mail e unico **por loja**
 * (`@@unique([storeId, email])`), porque a mesma pessoa pode administrar lojas diferentes
 * (escopo §22). Alem disso o Auth.js so suporta sessao em banco para provedores sem senha:
 * login por senha exige a estrategia JWT.
 *
 * O token carrega identidade, papel e loja; a **autoridade continua no banco**: quem entra
 * no painel e recarregado de `users` a cada acesso (`requireStaff`), entao desativar uma
 * conta passa a valer na hora, mesmo com um token valido em maos.
 *
 * O tenant nunca vem do cliente: a loja e resolvida no servidor e a busca do usuario e
 * escopada por ela.
 */

const credentials = z.object({
  email: z.string().trim().toLowerCase().min(3),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  trustHost: true,
  pages: { signIn: '/entrar' },
  providers: [
    Credentials({
      credentials: { email: { label: 'E-mail' }, password: { label: 'Senha' } },
      async authorize(raw) {
        const parsed = credentials.safeParse(raw);
        if (!parsed.success) return null;

        const prisma = getPrisma();
        const store = await prisma.store.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        });
        if (!store) return null;

        const user = await prisma.user.findUnique({
          where: { storeId_email: { storeId: store.id, email: parsed.data.email } },
        });

        /* Mesmo custo quando a conta nao existe, para nao revelar quais existem. */
        if (!user) {
          await fakeVerify();
          return null;
        }
        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid || !user.active) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      /* `user` so existe no login; depois disso o token ja carrega o que precisa. */
      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
      }
      return token;
    },
    session({ session, token }) {
      /* O JWT do @auth/core indexa `unknown`: validamos na leitura em vez de confiar. */
      session.user.id = typeof token.sub === 'string' ? token.sub : '';
      session.user.role = isUserRole(token.role) ? token.role : 'CUSTOMER';
      session.user.storeId = typeof token.storeId === 'string' ? token.storeId : '';
      return session;
    },
  },
});
