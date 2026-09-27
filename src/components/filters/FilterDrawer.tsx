'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/utils';
import type { FilterFacets, ProductFilters } from '@/types';

/**
 * Filtros no mobile.
 *
 * A mesma barra de filtros do desktop, dentro do painel lateral. O foco fica preso
 * no painel enquanto ele estiver aberto, e ao fechar volta para o botao que abriu.
 */
export function FilterDrawer({
  filters,
  facets,
  basePath,
  activeCount,
  className,
}: {
  filters: ProductFilters;
  facets: FilterFacets;
  basePath: string;
  activeCount: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn('gap-2', className)}
      >
        <SlidersHorizontal size={15} strokeWidth={1.6} aria-hidden="true" />
        Filtros
        {activeCount > 0 ? <span className="tabular-nums">({activeCount})</span> : null}
      </Button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Filtros" side="left">
        <FilterSidebar filters={filters} facets={facets} basePath={basePath} />
        <div className="mt-8">
          <Button variant="primary" fullWidth onClick={() => setOpen(false)}>
            Ver resultados
          </Button>
        </div>
      </Drawer>
    </>
  );
}
