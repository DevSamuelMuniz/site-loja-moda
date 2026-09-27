'use client';

import { useRouter } from 'next/navigation';
import { SORT_OPTIONS } from '@/lib/catalog/filters';
import { buildHref } from '@/lib/catalog/params';
import type { ProductFilters, SortKey } from '@/types';

/**
 * Ordenacao.
 *
 * Ao mudar a opcao, a URL e atualizada com os filtros atuais preservados. O
 * `scroll: false` mantem a posicao da pagina, que e o que se espera ao reordenar uma
 * lista ja visivel.
 */
export function SortSelect({
  filters,
  basePath,
  className,
}: {
  filters: ProductFilters;
  basePath: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={className}>
      <label htmlFor="ordenar" className="type-body text-body-sm text-muted">
        Ordenar por
      </label>
      <select
        id="ordenar"
        value={filters.sort}
        onChange={(event) => {
          const sort = event.target.value as SortKey;
          router.push(buildHref(basePath, filters, { sort }), { scroll: false });
        }}
        className="type-body text-body border-border focus:border-primary ml-2 border-b bg-transparent py-1 transition-colors outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
