'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackSearch } from '@/lib/analytics';
import type { SearchDocument } from '@/lib/catalog';
import { formatCurrency } from '@/lib/format';
import { imageSizes } from '@/lib/images';
import { normalizeText } from '@/lib/utils';

/**
 * Busca instantanea do header.
 *
 * Filtra sobre o indice enxuto enviado pelo servidor — nome, categoria, colecao,
 * SKU e tags — sem consultar o catalogo completo. O envio para a pagina `/busca`
 * acontece ao pressionar Enter, para nao navegar a cada tecla digitada.
 */

const MAX_RESULTS = 6;

function matches(document: SearchDocument, query: string): boolean {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = normalizeText(
    [
      document.name,
      document.sku,
      document.category,
      document.categoryLabel,
      document.collectionLabel ?? '',
      ...document.tags,
    ].join(' '),
  );

  return terms.every((term) => haystack.includes(term));
}

export function SearchOverlay({
  open,
  onClose,
  documents,
}: {
  open: boolean;
  onClose: () => void;
  documents: SearchDocument[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  /*
   * Ao abrir, o campo recebe o foco. O texto e limpo pelo remonte do componente — o
   * header troca a `key` quando a busca abre —, o que evita atualizar estado dentro de
   * um efeito.
   */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const results = useMemo(
    () =>
      query.trim()
        ? documents.filter((document) => matches(document, query)).slice(0, MAX_RESULTS)
        : [],
    [documents, query],
  );

  if (!open) return null;

  function submit() {
    const term = query.trim();
    if (!term) return;
    trackSearch(term, results.length);
    onClose();
    router.push(`/busca?busca=${encodeURIComponent(term)}`);
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)]">
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={onClose}
        className="bg-overlay overlay-enter absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar produtos"
        className="bg-background shadow-overlay modal-enter relative mx-auto max-h-[85dvh] w-full max-w-3xl overflow-y-auto p-6 sm:mt-16 sm:p-8"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label htmlFor="aura-search" className="type-label text-label text-muted">
            Buscar por peça, categoria ou código
          </label>
          <div className="border-border focus-within:border-primary mt-2 flex items-center gap-3 border-b pb-2">
            <Search size={18} strokeWidth={1.5} aria-hidden="true" className="text-muted" />
            <input
              id="aura-search"
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Camiseta, jeans, código da peça…"
              className="type-body text-body-lg w-full bg-transparent outline-none"
              autoComplete="off"
            />
            <button type="submit" className="type-button text-body-sm whitespace-nowrap underline">
              Buscar
            </button>
          </div>
        </form>

        {query.trim() ? (
          results.length > 0 ? (
            <ul className="divide-border mt-6 flex flex-col divide-y">
              {results.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/produtos/${result.slug}`}
                    onClick={onClose}
                    className="hover:bg-surface flex items-center gap-4 py-3 transition-colors"
                  >
                    <span className="bg-surface relative h-16 w-14 shrink-0 overflow-hidden">
                      {result.image ? (
                        <Image
                          src={result.image}
                          alt=""
                          fill
                          sizes={imageSizes.cartLine}
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="type-heading text-body block">{result.name}</span>
                      <span className="type-body text-body-sm text-muted">
                        {result.categoryLabel}
                        {result.collectionLabel ? ` · ${result.collectionLabel}` : ''}
                      </span>
                    </span>
                    <span className="type-body text-body tabular-nums">
                      {formatCurrency(result.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body text-body text-muted mt-6">
              Nenhuma peça encontrada para “{query.trim()}”. Tente outro termo ou veja todos os
              produtos.
            </p>
          )
        ) : (
          <p className="type-body text-body-sm text-muted mt-6">
            Digite para ver sugestões. A busca cobre nome, categoria, coleção, tags e o código da
            peça.
          </p>
        )}
      </div>
    </div>
  );
}
