import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/db';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * Autorizacao no servidor (escopo §23).
 *
 * Esconder botao no frontend nao e autorizacao. Estas funcoes sao a unica porta de entrada
 * do painel e devolvem o usuario **lido do banco**, nao o que o token afirma: papel e
 * situacao vem de `users` a cada acesso.
 */

/** Papeis com acesso ao painel. Permissao por modulo entra na FASE 2 (escopo §23). */
const STAFF_ROLES: readonly UserRole[] = ['ADMIN', 'MANAGER', 'OPERATOR'];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string;
}

export function isStaff(role: UserRole | undefined | null): boolean {
  return role !== undefined && role !== null && STAFF_ROLES.includes(role);
}

/** Usuario autenticado e ativo, ou `null`. A sessao sozinha nao basta. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const user = await getPrisma().user.findFirst({
    where: { id, active: true },
    select: { id: true, name: true, email: true, role: true, storeId: true },
  });

  return user;
}

/**
 * Exige uma conta de equipe ativa. Redireciona quem nao tem direito — a pagina protegida
 * nunca chega a renderizar.
 */
export async function requireStaff(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect('/entrar?erro=sessao');

  const user = await currentUser();
  if (!user) redirect('/entrar?erro=sessao');
  if (!isStaff(user.role)) redirect('/entrar?erro=permissao');

  return user;
}
