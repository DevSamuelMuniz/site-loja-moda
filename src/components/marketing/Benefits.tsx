import { Headset, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import type { BrandBenefit, BenefitIcon } from '@/types';

/**
 * Beneficios.
 *
 * Faixa discreta, sem caixas: uma linha por beneficio, separada por filetes. As
 * condicoes reais de frete e troca vivem em `src/config/ecommerce.ts`, entao o
 * texto aqui descreve o beneficio sem prometer numero.
 */

const icons: Record<BenefitIcon, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  refresh: RefreshCw,
  headset: Headset,
};

export function Benefits({
  benefits,
  className,
}: {
  benefits: BrandBenefit[];
  className?: string;
}) {
  return (
    <Section spacing="tight" className={className}>
      <Container>
        <h2 className="sr-only">Condições de compra</h2>
        <ul className="border-border grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = icons[benefit.icon];

            return (
              <li
                key={benefit.id}
                className="border-border flex items-start gap-4 border-b py-6 sm:px-6 sm:not-first:border-l lg:py-8"
              >
                <Icon
                  size={22}
                  strokeWidth={1.4}
                  aria-hidden="true"
                  className="text-accent mt-0.5 shrink-0"
                />
                <div>
                  <h3 className="type-heading text-heading-md">{benefit.title}</h3>
                  <p className="type-body text-body-sm text-muted mt-1.5 max-w-[var(--measure-tight)]">
                    {benefit.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
