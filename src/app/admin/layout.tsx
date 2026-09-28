import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { requireStaff } from '@/lib/auth/guards';
import { logoutAction } from '@/app/entrar/actions';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * Casca do painel.
 *
 * A protecao acontece aqui, no servidor: `requireStaff` redireciona antes de qualquer
 * pagina filha renderizar. Esconder item de menu nao seria autorizacao (escopo §23).
 */

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  CUSTOMER: 'Cliente',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <Container className="py-12 lg:py-16">
      <header className="border-border flex flex-wrap items-end justify-between gap-6 border-b pb-6">
        <div>
          <p className="type-label text-label text-muted">Painel</p>
          <h1 className="type-display text-body-lg mt-2">{user.name}</h1>
          <p className="type-body text-body-sm text-muted mt-1">
            {roleLabels[user.role]} · {user.email}
          </p>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </header>

      <nav aria-label="Seções do painel" className="mt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/admin" className="type-body text-body link-rule">
              Visão geral
            </Link>
          </li>
          <li>
            <Link href="/" className="type-body text-body link-rule">
              Ver a loja
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-10">{children}</div>
    </Container>
  );
}
