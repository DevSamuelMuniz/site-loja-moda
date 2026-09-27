'use client';

import { useEffect } from 'react';
import { trackSearch } from '@/lib/analytics';

/**
 * Registro de busca.
 *
 * A busca por endereco (`/busca?busca=...`) e renderizada no servidor, entao o evento
 * e disparado aqui depois da montagem. Nada e enviado se a loja nao tiver um
 * identificador de medicao configurado.
 */
export function SearchTracker({ term, results }: { term: string; results: number }) {
  useEffect(() => {
    trackSearch(term, results);
  }, [term, results]);

  return null;
}
