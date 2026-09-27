import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';
import type { Product } from '@/types';

/**
 * Detalhes do produto.
 *
 * Informacao de consulta em sanfonas: descricao, composicao, cuidados e medidas.
 * Fica fora do bloco de compra para que a decisao principal nao dispute atencao.
 */
export function ProductDetails({ product }: { product: Product }) {
  const items: AccordionItem[] = [
    {
      id: 'descricao',
      question: 'Descrição',
      answer: <p>{product.story}</p>,
    },
    {
      id: 'composicao',
      question: 'Composição e acabamento',
      answer: (
        <>
          <p>{product.composition}</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {product.details.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span aria-hidden="true" className="text-border">
                  —
                </span>
                {detail}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'cuidados',
      question: 'Cuidados',
      answer: (
        <ul className="flex flex-col gap-1.5">
          {product.care.map((instruction) => (
            <li key={instruction} className="flex gap-2">
              <span aria-hidden="true" className="text-border">
                —
              </span>
              {instruction}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'medidas',
      question: 'Medidas da peça',
      answer: (
        <ul className="flex flex-col">
          {product.measurements.map((measurement) => (
            <li
              key={measurement.label}
              className="border-border flex justify-between gap-6 border-b border-dashed py-1.5 last:border-b-0"
            >
              <span>{measurement.label}</span>
              <span className="text-primary tabular-nums">{measurement.value}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <Section spacing="tight">
      <Container>
        <h2 className="type-heading text-heading-lg">Informações da peça</h2>
        <Accordion items={items} defaultOpenId="descricao" className="mt-6" />
      </Container>
    </Section>
  );
}
