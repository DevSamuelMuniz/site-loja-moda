import Image from 'next/image';
import Link from 'next/link';
import { brandConfig } from '@/config/brand';
import { cn } from '@/lib/utils';

/**
 * Logotipo.
 *
 * Quando `brandConfig.logo.image` estiver preenchido, a imagem substitui o
 * wordmark sem nenhuma alteracao de componente.
 */
export function Logo({
  className,
  variant = 'wordmark',
  href = '/',
}: {
  className?: string;
  variant?: 'wordmark' | 'monogram';
  href?: string;
}) {
  const label = variant === 'monogram' ? brandConfig.logo.monogram : brandConfig.logo.wordmark;

  return (
    <Link
      href={href}
      className={cn('inline-flex items-center focus-visible:rounded-sm', className)}
      aria-label={brandConfig.name}
    >
      {brandConfig.logo.image ? (
        <Image
          src={brandConfig.logo.image}
          alt={brandConfig.logo.alt}
          width={140}
          height={32}
          className="h-7 w-auto"
          priority
        />
      ) : (
        <span className="type-display text-heading-md leading-none">{label}</span>
      )}
    </Link>
  );
}
