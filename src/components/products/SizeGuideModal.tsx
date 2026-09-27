'use client';

import { Modal } from '@/components/ui/Modal';
import { sizeGuide, sizeGuideDenim } from '@/data/content';

/**
 * Guia de tamanhos.
 *
 * Duas tabelas: uma para pecas de vestuario, com medidas do corpo, e outra para
 * pecas de baixo, medidas em numero. Os dados vem de `src/data/content/size-guide.ts`.
 */
export function SizeGuideModal({
  open,
  onClose,
  title = 'Guia de tamanhos',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Medidas do corpo, em centímetros. Meça sobre a pele, sem apertar a fita."
    >
      <div className="flex flex-col gap-10">
        <GuideTable guide={sizeGuide} />
        <GuideTable guide={sizeGuideDenim} caption="Peças de baixo" />
      </div>
    </Modal>
  );
}

function GuideTable({
  guide,
  caption,
}: {
  guide: {
    unit: string;
    columns: string[];
    rows: Array<{ size: string; values: string[] }>;
    note: string;
  };
  caption?: string;
}) {
  return (
    <div>
      {caption ? <h3 className="type-heading text-heading-md mb-3">{caption}</h3> : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="type-body text-body-sm text-muted mb-2 text-left">
            Medidas em {guide.unit}.
          </caption>
          <thead>
            <tr className="border-border border-b">
              {guide.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="type-label text-label text-muted py-2 pr-4 last:pr-0"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row.size} className="border-border border-b last:border-b-0">
                <th
                  scope="row"
                  className="type-body text-body py-2.5 pr-4 font-normal tabular-nums"
                >
                  {row.size}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.size}-${guide.columns[index + 1] ?? index}`}
                    className="type-body text-body text-muted py-2.5 pr-4 tabular-nums last:pr-0"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="type-body text-body-sm text-muted mt-4 max-w-[var(--measure-prose)]">
        {guide.note}
      </p>
    </div>
  );
}
