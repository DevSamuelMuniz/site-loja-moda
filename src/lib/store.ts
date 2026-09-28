import { cache } from 'react';
import { getPrisma } from '@/lib/db';

/**
 * Loja do tenant.
 *
 * Fonte unica da resolucao de tenant no servidor (escopo §22, regra 4): a loja publica
 * resolve pelo host, o painel pela sessao, e na FASE 1 existe uma loja ativa. Nada aqui
 * confia em valor vindo do cliente.
 *
 * `cache()` do React deduplica dentro da mesma renderizacao: catalogo e configuracao pedem a
 * mesma loja e o banco e consultado uma vez por requisicao, nao duas.
 */

export interface ActiveStore {
  id: string;
  slug: string;
  name: string;
  currency: string;
  locale: string;
}

export const loadActiveStore = cache(async (): Promise<ActiveStore> => {
  const store = await getPrisma().store.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, name: true, currency: true, locale: true },
  });

  if (!store) {
    throw new Error(
      'Nenhuma loja ativa no banco. Rode as migrations e o seed: `npm run db:migrate` e `npm run db:seed`.',
    );
  }

  return store;
});
