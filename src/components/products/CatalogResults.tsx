import { ActiveFilters } from '@/components/filters/ActiveFilters';
import { FilterDrawer } from '@/components/filters/FilterDrawer';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { Pagination } from '@/components/filters/Pagination';
import { SortSelect } from '@/components/filters/SortSelect';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  categoryLabels,
  collectionLabels,
  countActiveFilters,
  getColorOptions,
  pageHref,
  type Paginated,
} from '@/lib/catalog';
import { cn } from '@/lib/utils';
import type { FilterFacets, Product, ProductFilters } from '@/types';

/**
 * Resultado do catalogo.
 *
 * A pagina de produtos, as paginas de categoria e de colecao compartilham a mesma
 * estrutura: barra de filtros lateral no desktop, painel lateral no mobile, contagem,
 * ordenacao e paginacao. Manter isso em um lugar so evita que as tres listagens
 * divirjam com o tempo.
 */
export async function CatalogResults({
  basePath,
  filters,
  facets,
  result,
  cardVariant = 'fashion',
  columns = 'four',
  className,
}: {
  basePath: string;
  filters: ProductFilters;
  facets: FilterFacets;
  result: Paginated<Product>;
  cardVariant?: 'fashion' | 'minimal' | 'compact' | 'featured';
  columns?: 'two' | 'three' | 'four';
  className?: string;
}) {
  const colorLabels = Object.fromEntries(
    (await getColorOptions()).map((color) => [color.slug, color.name]),
  );
  const activeCount = countActiveFilters(filters);

  return (
    <div className={cn('grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14', className)}>
      <aside aria-label="Filtros" className="hidden lg:block">
        <FilterSidebar filters={filters} facets={facets} basePath={basePath} />
      </aside>

      <div className="min-w-0">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <p className="type-body text-body text-muted" role="status" aria-live="polite">
            {result.total === 1 ? '1 peça encontrada' : `${result.total} peças encontradas`}
          </p>
          <div className="flex items-center gap-4">
            <FilterDrawer
              filters={filters}
              facets={facets}
              basePath={basePath}
              activeCount={activeCount}
              className="lg:hidden"
            />
            <SortSelect filters={filters} basePath={basePath} />
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          basePath={basePath}
          labels={{
            categories: await categoryLabels(),
            collections: await collectionLabels(),
            colors: colorLabels,
          }}
          className="mt-5"
        />

        {result.items.length > 0 ? (
          <ProductGrid
            products={result.items}
            variant={cardVariant}
            columns={columns}
            priorityCount={4}
            className="mt-8"
          />
        ) : (
          <EmptyState
            className="mt-8"
            title="Nenhuma peça com esses filtros"
            description="Tente remover um filtro ou ampliar a faixa de preço. O catálogo é pequeno por enquanto, então poucos filtros já reduzem bastante o resultado."
            action={
              <ButtonLink href={basePath} variant="outline" size="sm">
                Limpar filtros
              </ButtonLink>
            }
          />
        )}

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(page) => pageHref(basePath, filters, page)}
          className="mt-12"
        />
      </div>
    </div>
  );
}
