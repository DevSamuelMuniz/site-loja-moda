import Link from 'next/link';
import { buildHref, isPriceBandActive, priceBands, toggleValue } from '@/lib/catalog/params';
import { cn } from '@/lib/utils';
import type { FacetValue, FilterFacets, ProductFilters } from '@/types';

/**
 * Barra de filtros.
 *
 * Todos os filtros sao links: o estado vive na URL, entao filtrar funciona sem
 * JavaScript, o resultado e compartilhavel e o botao voltar do navegador se comporta
 * como esperado. A contagem de cada opcao ignora os filtros da propria dimensao, o
 * que permite ver as alternativas antes de trocar a selecao.
 */

type ListKey = 'categories' | 'collections' | 'sizes' | 'colors' | 'tags';

function togglePatch(key: ListKey, selected: string[], value: string): Partial<ProductFilters> {
  return { [key]: toggleValue(selected, value) } as Partial<ProductFilters>;
}

export function FilterSidebar({
  filters,
  facets,
  basePath,
  className,
}: {
  filters: ProductFilters;
  facets: FilterFacets;
  basePath: string;
  className?: string;
}) {
  const hasPriceFilter = filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <FilterGroup
        title="Categoria"
        options={facets.categories}
        selected={filters.categories}
        basePath={basePath}
        filters={filters}
        listKey="categories"
      />

      <FilterGroup
        title="Coleção"
        options={facets.collections}
        selected={filters.collections}
        basePath={basePath}
        filters={filters}
        listKey="collections"
      />

      <FilterGroup
        title="Tamanho"
        options={facets.sizes}
        selected={filters.sizes}
        basePath={basePath}
        filters={filters}
        listKey="sizes"
      />

      <FilterGroup
        title="Cor"
        options={facets.colors}
        selected={filters.colors}
        basePath={basePath}
        filters={filters}
        listKey="colors"
      />

      <fieldset>
        <legend className="type-heading text-heading-md">Faixa de preço</legend>
        <ul className="mt-3 flex flex-col gap-2">
          {priceBands.map((band) => {
            const active = isPriceBandActive(filters, band);
            return (
              <li key={band.id}>
                <Link
                  href={buildHref(basePath, filters, {
                    minPrice: band.min,
                    maxPrice: band.max,
                  })}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'type-body text-body-sm block transition-colors',
                    active ? 'text-primary font-medium' : 'text-muted hover:text-primary',
                  )}
                >
                  {band.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {hasPriceFilter ? (
          <Link
            href={buildHref(basePath, filters, { minPrice: undefined, maxPrice: undefined })}
            className="type-body text-body-sm text-muted hover:text-primary mt-3 inline-block underline"
          >
            Remover faixa de preço
          </Link>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="type-heading text-heading-md">Disponibilidade</legend>
        <ul className="mt-3 flex flex-col gap-2">
          <ToggleLink
            href={buildHref(basePath, filters, { onlyAvailable: !filters.onlyAvailable })}
            active={filters.onlyAvailable}
            label="Somente com estoque"
          />
          <ToggleLink
            href={buildHref(basePath, filters, { onlySale: !filters.onlySale })}
            active={filters.onlySale}
            label="Somente em promoção"
          />
          <ToggleLink
            href={buildHref(basePath, filters, { onlyNew: !filters.onlyNew })}
            active={filters.onlyNew}
            label="Somente lançamentos"
          />
        </ul>
      </fieldset>

      {filters.tags.length > 0 || facets.tags.length > 0 ? (
        <FilterGroup
          title="Tags"
          options={facets.tags}
          selected={filters.tags}
          basePath={basePath}
          filters={filters}
          listKey="tags"
        />
      ) : null}
    </div>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  basePath,
  filters,
  listKey,
}: {
  title: string;
  options: FacetValue[];
  selected: string[];
  basePath: string;
  filters: ProductFilters;
  listKey: ListKey;
}) {
  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className="type-heading text-heading-md">{title}</legend>
      <ul className="mt-3 flex flex-col gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          const disabled = option.count === 0 && !active;

          return (
            <li key={option.value}>
              {disabled ? (
                <span className="type-body text-body-sm text-border flex items-center gap-2">
                  {option.hex ? (
                    <span
                      aria-hidden="true"
                      className="border-border rounded-pill h-3 w-3 border"
                      style={{ backgroundColor: option.hex }}
                    />
                  ) : null}
                  {option.label}
                  <span className="tabular-nums">(0)</span>
                </span>
              ) : (
                <Link
                  href={buildHref(basePath, filters, togglePatch(listKey, selected, option.value))}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'type-body text-body-sm flex items-center gap-2 transition-colors',
                    active ? 'text-primary font-medium' : 'text-muted hover:text-primary',
                  )}
                >
                  {option.hex ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'rounded-pill h-3 w-3 border',
                        active ? 'border-primary' : 'border-border',
                      )}
                      style={{ backgroundColor: option.hex }}
                    />
                  ) : null}
                  {option.label}
                  <span className="text-muted tabular-nums">({option.count})</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function ToggleLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'type-body text-body-sm transition-colors',
          active ? 'text-primary font-medium' : 'text-muted hover:text-primary',
        )}
      >
        {label}
      </Link>
    </li>
  );
}
