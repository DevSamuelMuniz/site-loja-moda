import { getPrisma } from '@/lib/db';
import type { CustomerStatus } from '@/generated/prisma/enums';
import type { Tx } from '@/lib/db';

/**
 * Clientes (escopo §16).
 *
 * O cliente nasce do **pedido**: quem compra passa a existir no cadastro, com ou sem conta
 * (§12 permite compra sem login). Por isso a operacao que importa aqui e `resolveCustomer` —
 * achar ou criar pelo e-mail, sem nunca duplicar a mesma pessoa na mesma loja.
 */

export interface CustomerContact {
  name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Documento fiscal guardado so em digitos: mesma pessoa, uma grafia. */
export function normalizeDocument(document?: string | null): string | null {
  const digits = (document ?? '').replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

export interface ResolvedCustomer {
  id: string;
  created: boolean;
}/**
 * Acha ou cria o cliente do pedido (§16).
 *
 * Quando o cliente ja existe, atualiza **telefone e documento** — sao dados de contato que a
 * venda acabou de confirmar. O nome nao e sobrescrito por um pedido: corrigir cadastro e ato
 * do painel de clientes, nao efeito colateral de digitar rapido no balcao.
 */
export async function resolveCustomer(
  tx: Tx,
  input: { storeId: string; contact: CustomerContact },
): Promise<ResolvedCustomer> {
  const email = normalizeEmail(input.contact.email);
  const document = normalizeDocument(input.contact.document);
  const phone = input.contact.phone?.trim() || null;

  const existing = await tx.customer.findUnique({
    where: { storeId_email: { storeId: input.storeId, email } },
    select: { id: true, phone: true, document: true },
  });

  if (existing) {
    if (phone !== existing.phone || document !== existing.document) {
      await tx.customer.update({ where: { id: existing.id }, data: { phone, document } });
    }
    return { id: existing.id, created: false };
  }

  const created = await tx.customer.create({
    data: { storeId: input.storeId, name: input.contact.name.trim(), email, phone, document },
    select: { id: true },
  });

  return { id: created.id, created: true };
}

export class CustomerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomerError';
  }
}

export interface CustomerUpdateInput {
  name: string;
  phone?: string | null;
  document?: string | null;
  status: CustomerStatus;
}

/**
 * Corrige o cadastro do cliente pelo painel (escopo §16, §20).
 *
 * O **e-mail nao muda aqui**: ele e a chave do cliente na loja (`@@unique([storeId, email])`) e
 * o que liga pedidos antigos a pessoa. Trocar o e-mail de um cliente reescreveria a identidade
 * de compras passadas; se for mesmo o caso, o caminho e um novo cadastro.
 */
export async function updateCustomer(input: {
  storeId: string;
  id: string;
  values: CustomerUpdateInput;
}): Promise<void> {
  const { storeId, id, values } = input;
  const name = values.name.trim();

  if (name.length < 2) throw new CustomerError('Informe o nome do cliente.');

  const customer = await getPrisma().customer.findFirst({ where: { id, storeId }, select: { id: true } });
  if (!customer) throw new CustomerError('Cliente não encontrado nesta loja.');

  await getPrisma().customer.update({
    where: { id },
    data: {
      name,
      phone: values.phone?.trim() || null,
      document: normalizeDocument(values.document),
      status: values.status,
    },
  });
}
