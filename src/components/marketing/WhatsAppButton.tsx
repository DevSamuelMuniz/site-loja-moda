import { MessageCircle } from 'lucide-react';
import { whatsappConfig } from '@/config/whatsapp';
import { whatsappLink } from '@/lib/format';

/**
 * Botao flutuante de WhatsApp.
 *
 * O numero e a mensagem vem de `src/config/whatsapp.ts`. Quando o recurso esta
 * desligado ou o numero esta vazio, o botao simplesmente nao existe.
 */
export function WhatsAppButton() {
  if (!whatsappConfig.enabled || !whatsappConfig.floating) return null;

  const href = whatsappLink();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="bg-primary text-primary-foreground shadow-lifted hover:bg-accent hover:text-accent-foreground rounded-pill fixed right-5 bottom-5 z-[var(--z-sticky)] inline-flex items-center gap-2 px-4 py-3 transition-colors duration-[var(--duration-base)] max-sm:right-4 max-sm:bottom-4"
      aria-label={`Falar no WhatsApp com ${whatsappConfig.displayName}`}
    >
      <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" />
      <span className="type-button text-body-sm max-sm:hidden">Fale com a gente</span>
    </a>
  );
}
