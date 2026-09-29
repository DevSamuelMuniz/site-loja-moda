'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_LABELS, MODULE_PATHS, type AdminModule } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

/**
 * Navegacao do painel (escopo §34: `AdminSidebar`).
 *
 * A lista chega pronta do servidor, ja filtrada por permissao: quem nao pode ver "Estoque"
 * nao ve o link. Isto e conveniencia, nao autorizacao — a barreira continua sendo
 * `requirePermission` em cada pagina e em cada action (§23).
 */
export function AdminNav({ modules }: { modules: AdminModule[] }) {
  const pathname = usePathname();

  const isActive = (module: AdminModule) => {
    const path = MODULE_PATHS[module];
    return path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);
  };

  return (
    <nav aria-label="Módulos do painel" className="border-border border-b">
      <ul className="flex gap-x-6 overflow-x-auto">
        {modules.map((module) => (
          <li key={module} className="shrink-0">
            <Link
              href={MODULE_PATHS[module]}
              aria-current={isActive(module) ? 'page' : undefined}
              className={cn(
                'type-body text-body-sm inline-flex border-b-2 py-4 transition-colors',
                isActive(module)
                  ? 'border-primary text-primary'
                  : 'text-muted hover:text-primary border-transparent',
              )}
            >
              {MODULE_LABELS[module]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
