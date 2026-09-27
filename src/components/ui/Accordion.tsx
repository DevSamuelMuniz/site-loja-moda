'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

/**
 * Lista sanfonada.
 *
 * Cada item e um `button` controlando uma regiao com `aria-expanded` e
 * `aria-controls`: o texto continua acessivel por teclado e por leitor de tela.
 */
export function Accordion({
  items,
  defaultOpenId,
  className,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const baseId = useId();

  return (
    <div className={cn('border-border border-t', className)}>
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id} className="border-border border-b">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="type-heading text-heading-md flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                {item.question}
                <ChevronDown
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={cn(
                    'text-muted shrink-0 transition-transform duration-[var(--duration-base)]',
                    open && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!open}
              className="grid transition-[grid-template-rows] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="type-body text-body text-muted max-w-[var(--measure-prose)] pb-6">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
