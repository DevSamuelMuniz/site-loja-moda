'use client';

import Link from 'next/link';
import { navigationConfig } from '@/config/navigation';
import { socialConfig } from '@/config/social';
import { Drawer } from '@/components/ui/Drawer';

/**
 * Menu mobile.
 *
 * Os grupos usam `<details>`, que ja entrega o comportamento de abrir e fechar com
 * teclado e leitor de tela, sem precisar recriar o padrao.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const socialLinks = socialConfig.links.filter((link) => link.enabled);

  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left" bodyClassName="px-0 py-0">
      <nav aria-label="Navegação principal (mobile)" className="px-5 py-4">
        <ul className="divide-border flex flex-col divide-y">
          {navigationConfig.mainNav.map((item) => (
            <li key={item.href} className="py-1">
              {item.children ? (
                <details className="group">
                  <summary className="type-heading text-heading-md flex cursor-pointer list-none items-center justify-between py-3">
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="text-muted transition-transform duration-[var(--duration-base)] group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-1 pb-3 pl-1">
                    <li>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="type-body text-body text-muted hover:text-primary block py-2 transition-colors"
                      >
                        Ver tudo em {item.label}
                      </Link>
                    </li>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className="type-body text-body text-muted hover:text-primary block py-2 transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="type-heading text-heading-md hover:text-accent block py-3 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-border mt-2 border-t px-5 py-6">
        <h2 className="type-label text-label text-muted">Atalhos</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {navigationConfig.utilityNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="type-body text-body hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border border-t px-5 py-6">
        <h2 className="type-label text-label text-muted">Redes</h2>
        <ul className="mt-3 flex flex-wrap gap-4">
          {socialLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="type-body text-body hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
}
