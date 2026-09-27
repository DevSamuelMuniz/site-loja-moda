'use client';

import Link from 'next/link';
import { ArrowRight, BookmarkPlus, RotateCcw } from 'lucide-react';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCart } from '@/components/providers/CartProvider';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ecommerceConfig } from '@/config/ecommerce';
import { whatsappConfig } from '@/config/whatsapp';
import { buttonClass } from '@/components/ui/Button';
import { formatCurrency, whatsappLink } from '@/lib/format';

/**
 * Sacola.
 *
 * Mesma linha e mesmo resumo usados no painel lateral, para que o valor nao mude de
 * uma superficie para a outra. O bloco de finalizacao e explicito sobre o estado real
 * da loja: sem gateway integrado, a compra e combinada no atendimento e nenhum
 * pagamento falso e simulado.
 */
export function CartView() {
  const {
    lines,
    savedLines,
    catalog,
    totals,
    hydrated,
    setQuantity,
    remove,
    saveForLater,
    moveToCart,
    removeSaved,
    clear,
  } = useCart();

  if (!hydrated) {
    return <p className="type-body text-body text-muted">Carregando sua sacola…</p>;
  }

  if (lines.length === 0 && savedLines.length === 0) {
    return (
      <EmptyState
        title="Sua sacola está vazia"
        description="As peças que você adicionar ficam salvas neste navegador. Comece pelo catálogo completo ou pelas coleções."
        action={
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/produtos">Ver todos os produtos</ButtonLink>
            <ButtonLink href="/colecoes" variant="outline">
              Ver coleções
            </ButtonLink>
          </div>
        }
      />
    );
  }

  const entryFor = (slug: string) => catalog.find((entry) => entry.slug === slug);
  const whatsappHref = whatsappLink();

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <div>
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <p className="type-body text-body text-muted">
            {totals.itemCount === 1 ? '1 item' : `${totals.itemCount} itens`} na sacola
          </p>
          {lines.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="type-body text-body-sm text-muted hover:text-danger transition-colors"
            >
              Esvaziar sacola
            </button>
          ) : null}
        </div>

        {lines.length > 0 ? (
          <ul className="divide-border flex flex-col divide-y">
            {lines.map((line) => (
              <CartLineItem
                key={line.key}
                line={line}
                entry={entryFor(line.productSlug)}
                onQuantityChange={(quantity) => setQuantity(line.key, quantity)}
                onRemove={() => remove(line.key)}
                onSaveForLater={() => saveForLater(line.key)}
                className="py-6"
              />
            ))}
          </ul>
        ) : (
          <p className="type-body text-body text-muted py-6">
            Nenhum item ativo. Você tem peças salvas para depois logo abaixo.
          </p>
        )}

        {savedLines.length > 0 ? (
          <section className="mt-12" aria-labelledby="salvos-para-depois">
            <h2 id="salvos-para-depois" className="type-heading text-heading-md">
              Salvos para depois
            </h2>
            <ul className="divide-border mt-4 flex flex-col divide-y">
              {savedLines.map((line) => {
                const entry = entryFor(line.productSlug);
                if (!entry) return null;

                return (
                  <li
                    key={line.key}
                    className="flex flex-wrap items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="type-body text-body">{entry.name}</p>
                      <p className="type-body text-body-sm text-muted">
                        {entry.colorNames[line.colorSlug] ?? line.colorSlug} · Tamanho {line.size} ·{' '}
                        {formatCurrency(entry.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => moveToCart(line.key)}
                        className="type-body text-body-sm hover:text-accent inline-flex items-center gap-1.5 transition-colors"
                      >
                        <BookmarkPlus size={14} strokeWidth={1.6} aria-hidden="true" />
                        Mover para a sacola
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSaved(line.key)}
                        className="type-body text-body-sm text-muted hover:text-danger transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="mt-10">
          <ButtonLink href="/produtos" variant="outline" size="sm">
            <RotateCcw size={15} strokeWidth={1.6} aria-hidden="true" />
            Continuar comprando
          </ButtonLink>
        </div>
      </div>

      <aside aria-labelledby="resumo-da-sacola" className="lg:self-start">
        <h2 id="resumo-da-sacola" className="type-heading text-heading-md">
          Resumo
        </h2>

        <CartSummary totals={totals} className="mt-5" />

        <div className="mt-8 flex flex-col gap-4">
          {ecommerceConfig.checkout.enabled && whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className={buttonClass({ variant: 'primary', size: 'md', fullWidth: true })}
            >
              Finalizar pelo WhatsApp
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </a>
          ) : (
            <p className="type-body text-body-sm text-muted border-border border border-dashed p-4">
              {ecommerceConfig.checkout.note}{' '}
              {whatsappHref ? (
                <>
                  Para fechar o pedido agora,{' '}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="link-rule text-primary"
                  >
                    fale com o atendimento
                  </a>
                  .
                </>
              ) : (
                <>Fale com o atendimento pelos canais da página de contato.</>
              )}
            </p>
          )}

          <p className="type-body text-body-sm text-muted">
            Frete e prazo são confirmados no atendimento, de acordo com o seu CEP. As regras
            configuradas para a loja estão na{' '}
            <Link href="/frete" className="link-rule text-primary">
              política de envio
            </Link>
            .
          </p>

          {whatsappConfig.enabled ? (
            <p className="type-body text-body-sm text-muted">
              Atendimento: {whatsappConfig.hours}.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
