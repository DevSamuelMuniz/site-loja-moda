import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'dark' | 'accent' | 'sale' | 'outline';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-primary border border-border',
  dark: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  sale: 'bg-danger text-white',
  outline: 'border border-primary text-primary',
};

/**
 * Selo curto sobre a imagem ou ao lado de um titulo.
 * Usado para NOVO, percentual de desconto e estado de estoque.
 */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'type-label text-label inline-flex items-center rounded-sm px-2 py-1',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
