'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ecommerceConfig } from '@/config/ecommerce';
import { trackAddToWishlist } from '@/lib/analytics';
import type { WishlistEntry } from '@/types';

/**
 * Favoritos.
 *
 * Guardados em `localStorage`, no mesmo modelo da sacola. A estrutura ja e uma
 * lista de entradas com data, para que associar favoritos a uma conta no futuro
 * seja apenas trocar a origem dos dados.
 */

interface WishlistContextValue {
  entries: WishlistEntry[];
  hydrated: boolean;
  count: number;
  has: (productSlug: string) => boolean;
  toggle: (productSlug: string) => void;
  remove: (productSlug: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function parse(raw: string | null): WishlistEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is WishlistEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as WishlistEntry).productSlug === 'string',
    );
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const storageKey = ecommerceConfig.wishlist.storageKey;
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- o armazenamento local so pode ser lido depois da montagem; ler na renderizacao quebraria a hidratacao
      setEntries(parse(window.localStorage.getItem(storageKey)));
    } catch {
      setEntries([]);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      /* Armazenamento indisponivel: os favoritos continuam validos nesta sessao. */
    }
  }, [entries, hydrated, storageKey]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === storageKey) setEntries(parse(event.newValue));
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey]);

  const toggle = useCallback((productSlug: string) => {
    setEntries((previous) => {
      if (previous.some((entry) => entry.productSlug === productSlug)) {
        return previous.filter((entry) => entry.productSlug !== productSlug);
      }
      trackAddToWishlist(productSlug);
      return [...previous, { productSlug, addedAt: Date.now() }];
    });
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      entries,
      hydrated,
      count: entries.length,
      has: (productSlug) => entries.some((entry) => entry.productSlug === productSlug),
      toggle,
      remove: (productSlug) =>
        setEntries((previous) => previous.filter((entry) => entry.productSlug !== productSlug)),
      clear: () => setEntries([]),
    }),
    [entries, hydrated, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist precisa estar dentro de <WishlistProvider>.');
  return context;
}
