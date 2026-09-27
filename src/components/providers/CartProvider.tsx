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
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';
import {
  buildCartKey,
  clampQuantity,
  computeTotals,
  emptyTotals,
  parsePersistedLines,
} from '@/lib/cart';
import type { CommerceEntry } from '@/lib/catalog/commerce';
import type { CartLine, CartTotals } from '@/types';

/**
 * Sacola.
 *
 * O conteudo vive em `localStorage`, com leitura feita apenas depois da montagem
 * no cliente: a primeira renderizacao no servidor e sempre a sacola vazia, o que
 * evita divergencia de hidratacao.
 *
 * O indice comercial chega do servidor por props (`index`), entao o catalogo
 * completo nao entra no bundle do cliente — so o necessario para montar a sacola.
 */

interface AddToCartInput {
  productSlug: string;
  colorSlug: string;
  size: string;
  quantity?: number;
}

interface CartContextValue {
  lines: CartLine[];
  savedLines: CartLine[];
  /** Indice comercial recebido do servidor, para resolver nome, preco e imagem. */
  catalog: CommerceEntry[];
  totals: CartTotals;
  hydrated: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (input: AddToCartInput) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => void;
  contains: (key: string) => boolean;
  containsProduct: (productSlug: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(key: string): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    return parsePersistedLines(window.localStorage.getItem(key));
  } catch {
    return [];
  }
}

function writeStorage(key: string, lines: CartLine[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(lines));
  } catch {
    /* Armazenamento indisponivel: a sacola continua funcionando apenas na sessao. */
  }
}

export function CartProvider({ index, children }: { index: CommerceEntry[]; children: ReactNode }) {
  const storageKey = ecommerceConfig.cart.storageKey;
  const savedKey = `${storageKey}.saved`;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [savedLines, setSavedLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o armazenamento local so pode ser lido depois da montagem; ler na renderizacao quebraria a hidratacao
    setLines(readStorage(storageKey));
    setSavedLines(readStorage(savedKey));
    setHydrated(true);
  }, [storageKey, savedKey]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(storageKey, lines);
  }, [lines, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(savedKey, savedLines);
  }, [savedLines, hydrated, savedKey]);

  /** Mantem duas abas abertas em sincronia. */
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === storageKey) setLines(parsePersistedLines(event.newValue));
      if (event.key === savedKey) setSavedLines(parsePersistedLines(event.newValue));
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey, savedKey]);

  const add = useCallback(
    ({ productSlug, colorSlug, size, quantity = 1 }: AddToCartInput) => {
      const amount = clampQuantity(quantity);
      const key = buildCartKey(productSlug, colorSlug, size);

      setLines((previous) => {
        const existing = previous.find((line) => line.key === key);
        if (existing) {
          return previous.map((line) =>
            line.key === key ? { ...line, quantity: clampQuantity(line.quantity + amount) } : line,
          );
        }
        return [
          ...previous,
          { key, productSlug, colorSlug, size, quantity: amount, addedAt: Date.now() },
        ];
      });

      const entry = index.find((item) => item.slug === productSlug);
      if (entry) {
        trackAddToCart(
          { slug: entry.slug, name: entry.name, price: entry.price },
          amount,
          ecommerceConfig.currency,
        );
      }

      setDrawerOpen(true);
    },
    [index],
  );

  const remove = useCallback(
    (key: string) => {
      setLines((previous) => {
        const line = previous.find((entry) => entry.key === key);
        const product = line ? index.find((item) => item.slug === line.productSlug) : undefined;
        if (line && product) {
          trackRemoveFromCart(
            { slug: product.slug, name: product.name, price: product.price },
            line.quantity,
            ecommerceConfig.currency,
          );
        }
        return previous.filter((entry) => entry.key !== key);
      });
    },
    [index],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((previous) =>
      previous.map((line) =>
        line.key === key ? { ...line, quantity: clampQuantity(quantity) } : line,
      ),
    );
  }, []);

  const increment = useCallback((key: string) => {
    setLines((previous) =>
      previous.map((line) =>
        line.key === key ? { ...line, quantity: clampQuantity(line.quantity + 1) } : line,
      ),
    );
  }, []);

  const decrement = useCallback((key: string) => {
    setLines((previous) =>
      previous.map((line) =>
        line.key === key ? { ...line, quantity: clampQuantity(line.quantity - 1) } : line,
      ),
    );
  }, []);

  const saveForLater = useCallback((key: string) => {
    setLines((previous) => {
      const line = previous.find((entry) => entry.key === key);
      if (line)
        setSavedLines((saved) =>
          saved.some((entry) => entry.key === key) ? saved : [...saved, line],
        );
      return previous.filter((entry) => entry.key !== key);
    });
  }, []);

  const moveToCart = useCallback((key: string) => {
    setSavedLines((previous) => {
      const line = previous.find((entry) => entry.key === key);
      if (line) {
        setLines((current) =>
          current.some((entry) => entry.key === key)
            ? current
            : [...current, { ...line, addedAt: Date.now() }],
        );
      }
      return previous.filter((entry) => entry.key !== key);
    });
  }, []);

  const removeSaved = useCallback((key: string) => {
    setSavedLines((previous) => previous.filter((entry) => entry.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(
    () => (hydrated ? computeTotals(lines, index) : emptyTotals()),
    [hydrated, lines, index],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      savedLines,
      catalog: index,
      totals,
      hydrated,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      remove,
      setQuantity,
      increment,
      decrement,
      saveForLater,
      moveToCart,
      removeSaved,
      clear,
      contains: (key) => lines.some((line) => line.key === key),
      containsProduct: (productSlug) => lines.some((line) => line.productSlug === productSlug),
    }),
    [
      lines,
      savedLines,
      index,
      totals,
      hydrated,
      isDrawerOpen,
      add,
      remove,
      setQuantity,
      increment,
      decrement,
      saveForLater,
      moveToCart,
      removeSaved,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>.');
  return context;
}
