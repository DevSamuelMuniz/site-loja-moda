import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { logoutAction } from '@/app/entrar/actions';
import { requireStaff } from '@/lib/auth/guards';
import { visibleModules } from '@/lib/auth/permissions';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * Casca do painel.
 *
 * A protecao acontece aqui, no servidor: `requireStaff` redireciona antes de qualquer pagina
 * filha renderizar. Esconder item de menu nao seria autorizacao (escopo §23) — a lista de
 * modulos e filtrada por permissao, e cada pagina confere de novo com `requirePermission`.
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
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="type-label text-label text-muted">Painel</p>
          <h1 className="type-display text-body-lg mt-2">{user.name}</h1>
          <p className="type-body text-body-sm text-muted mt-1">
            {roleLabels[user.role]} · {user.email}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="type-body text-body-sm link-rule text-primary">
            Ver a loja
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="mt-6">
        <AdminNav modules={visibleModules(user.role)} />
      </div>

      <div className="mt-10">{children}</div>
    </Container>
  );
}
