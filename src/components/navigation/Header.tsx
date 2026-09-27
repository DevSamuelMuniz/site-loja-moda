'use client';

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { Logo } from '@/components/ui/Logo';
import { navigationConfig } from '@/config/navigation';
import type { SearchDocument } from '@/lib/catalog';
import { useDismissOnOutside } from '@/lib/dismiss';
import { cn } from '@/lib/utils';

/**
 * Header.
 *
 * Sticky e sem filete no topo da pagina; ao rolar, ganha fundo translucido e o filete
 * inferior se desenha da esquerda para a direita.
 *
 * Os menus suspensos sao controlados por estado, nao por `:hover` do CSS. Menu de
 * hover abre bem e fecha mal: depois de clicar em um item ele continuava pendurado
 * sobre a pagina ate o ponteiro sair. Agora qualquer clique (no item, em outro lugar da
 * pagina) fecha, e `Esc` tambem.
 */
export function Header({ searchIndex }: { searchIndex: SearchDocument[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openNavItem, setOpenNavItem] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const { totals, openDrawer } = useCart();
  const { count: wishlistCount, hydrated } = useWishlist();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useDismissOnOutside(openNavItem !== null, () => setOpenNavItem(null), navRef);
  useDismissOnOutside(accountOpen, () => setAccountOpen(false), accountRef);

  const cartCount = hydrated ? totals.itemCount : 0;
  const savedCount = hydrated ? wishlistCount : 0;

  const iconButton =
    'relative inline-flex h-10 w-10 items-center justify-center rounded-pill text-primary hover:text-accent transition-colors';

  /** Fecha os menus suspensos antes de abrir uma superficie que cobre a pagina. */
  function closeMenus() {
    setOpenNavItem(null);
    setAccountOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[var(--z-header)] transition-[background-color,backdrop-filter] duration-[var(--duration-base)]',
          scrolled ? 'bg-background/88 backdrop-blur-md' : 'bg-background',
        )}
      >
        <Container width="wide">
          {/* Barra mobile */}
          <div className="grid h-[var(--header-height)] grid-cols-[1fr_auto_1fr] items-center lg:hidden">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  setMenuOpen(true);
                }}
                aria-label="Abrir menu"
                className={iconButton}
              >
                <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="flex justify-center">
              <Logo />
            </div>
            <div className="flex items-center justify-end gap-0.5">
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  setSearchOpen(true);
                }}
                aria-label="Buscar produtos"
                className={iconButton}
              >
                <Search size={19} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={openDrawer}
                aria-label={cartCount > 0 ? `Abrir sacola com ${cartCount} itens` : 'Abrir sacola'}
                className={iconButton}
              >
                <ShoppingBag size={19} strokeWidth={1.5} aria-hidden="true" />
                <CountBadge count={cartCount} />
              </button>
            </div>
          </div>

          {/* Barra desktop */}
          <div className="hidden h-[var(--header-height)] items-center justify-between gap-8 lg:flex">
            <Logo />

            <nav
              ref={navRef}
              aria-label="Navegação principal"
              className="flex items-center gap-7"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setOpenNavItem(null);
                }
              }}
            >
              {navigationConfig.mainNav.map((item) => {
                const open = openNavItem === item.href;

                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenNavItem(item.href)}
                    onMouseLeave={() =>
                      setOpenNavItem((current) => (current === item.href ? null : current))
                    }
                    onFocus={() => setOpenNavItem(item.href)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpenNavItem(null)}
                      aria-expanded={item.children ? open : undefined}
                      className="type-button text-body link-rule inline-flex items-baseline gap-1.5"
                    >
                      {item.label}
                      {item.badge ? (
                        <span className="type-label text-label text-accent">{item.badge}</span>
                      ) : null}
                    </Link>

                    {item.children ? (
                      <div
                        className={cn(
                          'absolute top-full left-1/2 -translate-x-1/2 pt-5 transition-[opacity,translate,transform,visibility] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
                          open
                            ? 'visible translate-y-0 opacity-100'
                            : 'invisible -translate-y-1 opacity-0',
                        )}
                      >
                        <div className="bg-background border-border shadow-lifted min-w-60 border p-4">
                          <ul className="flex flex-col gap-1">
                            {item.children.map((child) => (
                              <li key={`${item.href}-${child.href}`}>
                                <Link
                                  href={child.href}
                                  onClick={() => setOpenNavItem(null)}
                                  className="hover:bg-surface block px-3 py-2 transition-colors"
                                >
                                  <span className="type-body text-body block">{child.label}</span>
                                  {child.description ? (
                                    <span className="type-body text-body-sm text-muted block">
                                      {child.description}
                                    </span>
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  setSearchOpen(true);
                }}
                aria-label="Buscar produtos"
                className={iconButton}
              >
                <Search size={19} strokeWidth={1.5} aria-hidden="true" />
              </button>

              <Link
                href="/favoritos"
                onClick={closeMenus}
                aria-label={savedCount > 0 ? `Favoritos, ${savedCount} peças salvas` : 'Favoritos'}
                className={iconButton}
              >
                <Heart size={19} strokeWidth={1.5} aria-hidden="true" />
                <CountBadge count={savedCount} />
              </Link>

              <button
                type="button"
                onClick={openDrawer}
                aria-label={cartCount > 0 ? `Abrir sacola com ${cartCount} itens` : 'Abrir sacola'}
                className={iconButton}
              >
                <ShoppingBag size={19} strokeWidth={1.5} aria-hidden="true" />
                <CountBadge count={cartCount} />
              </button>

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setOpenNavItem(null);
                    setAccountOpen((value) => !value);
                  }}
                  aria-expanded={accountOpen}
                  aria-controls="header-account-menu"
                  aria-label="Conta e ajuda"
                  className={iconButton}
                >
                  <User size={19} strokeWidth={1.5} aria-hidden="true" />
                </button>

                <div
                  id="header-account-menu"
                  className={cn(
                    'bg-background border-border shadow-lifted absolute top-full right-0 mt-3 min-w-64 border p-4 transition-[opacity,translate,transform,visibility] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
                    accountOpen
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-1 opacity-0',
                  )}
                >
                  <p className="type-body text-body-sm text-muted">
                    A conta de cliente entra na próxima fase da loja. Por enquanto, favoritos e
                    sacola ficam salvos neste navegador.
                  </p>
                  <ul className="mt-3 flex flex-col gap-1">
                    {navigationConfig.utilityNav.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setAccountOpen(false)}
                          className="type-body text-body hover:bg-surface block px-3 py-2 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/faq"
                        onClick={() => setAccountOpen(false)}
                        className="type-body text-body hover:bg-surface block px-3 py-2 transition-colors"
                      >
                        Perguntas frequentes
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/*
         * Filete inferior: em vez de aparecer por mudanca de cor, ele se desenha da
         * esquerda para a direita, o que acompanha a sensacao de rolagem.
         */}
        <span
          aria-hidden="true"
          className={cn(
            'bg-border absolute inset-x-0 bottom-0 h-px origin-left transition-[scale,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]',
            scrolled ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* A `key` remonta a busca a cada abertura, o que limpa o texto digitado. */}
      <SearchOverlay
        key={searchOpen ? 'busca-aberta' : 'busca-fechada'}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        documents={searchIndex}
      />
    </>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      key={count}
      aria-hidden="true"
      className="bg-accent text-accent-foreground type-label text-label rounded-pill pop-in absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center px-1 tabular-nums"
    >
      {count}
    </span>
  );
}
