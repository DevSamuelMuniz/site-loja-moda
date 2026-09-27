import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Botoes do site.
 *
 * `buttonClass` e exportado para que componentes cliente que precisam de
 * manipulador de evento apliquem o mesmo visual sem carregar um wrapper extra.
 */

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'accent' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap type-button transition-[color,background-color,border-color,opacity,transform] duration-[var(--duration-base)] disabled:cursor-not-allowed disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground rounded-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
  outline:
    'border border-primary text-primary rounded-sm bg-transparent hover:bg-primary hover:text-primary-foreground active:scale-[0.98]',
  ghost: 'text-primary rounded-sm bg-transparent hover:text-accent',
  accent:
    'bg-accent text-accent-foreground rounded-sm hover:bg-primary hover:text-primary-foreground active:scale-[0.98]',
  link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-body-sm',
  md: 'h-11 px-6 text-body',
  lg: 'h-[3.25rem] px-8 text-body',
};

export function buttonClass({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(
    base,
    variants[variant],
    variant === 'link' ? '' : sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClass({ variant, size, fullWidth, className })} {...props}>
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}
