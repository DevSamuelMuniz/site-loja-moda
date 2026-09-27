'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/components/providers/CartProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';
import type { CommerceEntry } from '@/lib/catalog/commerce';

/**
 * Providers do site.
 *
 * Ficam no layout raiz para que a sacola e os favoritos sobrevivam a navegacao
 * entre paginas. O indice comercial vem do servidor, entao o catalogo completo
 * nao entra no bundle do cliente.
 */
export function AppProviders({ index, children }: { index: CommerceEntry[]; children: ReactNode }) {
  return (
    <CartProvider index={index}>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
