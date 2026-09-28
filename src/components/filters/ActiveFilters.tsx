import Link from 'next/link';
import { X } from 'lucide-react';
import { emptyFilters } from '@/lib/catalog/filters';
import { buildHref } from '@/lib/catalog/params';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProductFilters } from '@/types';

/**
 * Filtros ativos.
 *
 * Cada filtro aplicado vira uma etiqueta removivel, para que a pessoa veja o que
 * esta filtrando sem precisar reabrir a barra — e possa desfazer um item sozinho.
 */
export function ActiveFilters({
  filters,
  basePath,
  labels,
  className,
}: {
  filters: ProductFilters;
  basePath: string;
  labels: {
    categories: Record<string, string>;
    collections: Record<string, string>;
    colors: Record<string, string>;
  };
  className?: string;
}) {
  const chips: Array<{ key: string; label: string; patch: Partial<ProductFilters> }> = [];

  if (filters.query) {
    chips.push({
      key: `busca-${filters.query}`,
      label: `Busca: ${filters.query}`,
      patch: { query: '' },
    });
  }

  for (const value of filters.categories) {
    chips.push({
      key: `categoria-${value}`,
      label: labels.categories[value] ?? value,
      patch: { categories: filters.categories.filter((entry) => entry !== value) },
    });
  }

  for (const value of filters.collections) {
    chips.push({
      key: `colecao-${value}`,
      label: labels.collections[value] ?? value,
      patch: { collections: filters.collections.filter((entry) => entry !== value) },
    });
  }

  for (const value of filters.sizes) {
    chips.push({
      key: `tamanho-${value}`,
      label: `Tam. ${value}`,
      patch: { sizes: filters.sizes.filter((entry) => entry !== value) },
    });
  }

  for (const value of filters.colors) {
    chips.push({
      key: `cor-${value}`,
      label: labels.colors[value] ?? value,
      patch: { colors: filters.colors.filter((entry) => entry !== value) },
    });
  }

  for (const value of filters.tags) {
    chips.push({
      key: `tag-${value}`,
      label: value,
      patch: { tags: filters.tags.filter((entry) => entry !== value) },
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const from = filters.minPrice !== undefined ? formatCurrency(filters.minPrice) : 'menor valor';
    const to = filters.maxPrice !== undefined ? formatCurrency(filters.maxPrice) : 'maior valor';
    chips.push({
      key: 'preco',
      label: `${from} – ${to}`,
      patch: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (filters.onlyAvailable) {
    chips.push({ key: 'disponivel', label: 'Com estoque', patch: { onlyAvailable: false } });
  }
  if (filters.onlySale) {
    chips.push({ key: 'promocao', label: 'Em promoção', patch: { onlySale: false } });
  }
  if (filters.onlyNew) {
    chips.push({ key: 'novidades', label: 'Lançamentos', patch: { onlyNew: false } });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <h2 className="type-label text-label text-muted">Filtrando por</h2>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={buildHref(basePath, filters, chip.patch)}
              className="border-border type-body text-body-sm hover:border-primary rounded-pill inline-flex items-center gap-1.5 border px-3 py-1 transition-colors"
            >
              {chip.label}
              <X size={12} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Remover filtro</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={buildHref(basePath, emptyFilters, { sort: filters.sort })}
        className="type-body text-body-sm text-muted hover:text-primary ml-1 underline transition-colors"
      >
        Limpar tudo
      </Link>
    </div>
  );
}
