import { AdminForm } from '@/components/admin/AdminForm';
import { Field, Fieldset, inputClass, selectClass, textareaClass } from '@/components/admin/Field';
import { PageHeader, Panel } from '@/components/admin/Panel';
import { ButtonLink } from '@/components/ui/Button';
import { ecommerceConfig } from '@/config/ecommerce';
import { readText } from '@/lib/admin/params';
import { requirePermission } from '@/lib/auth/guards';
import { getCustomer } from '@/lib/customers/queries';
import { listVariantOptions } from '@/lib/inventory/queries';
import { createOrderAction } from '../actions';

/**
 * Registrar venda (escopo §13, §20).
 *
 * E a entrada de pedido da FASE 2: balcao, WhatsApp e telefone. O formulario pede o que a
 * venda realmente tem — cliente, itens, valores combinados, entrega e forma de pagamento —
 * e o servico faz o resto: numera, congela preco, resolve o cliente e move o estoque.
 *
 * Limite de linhas de item nesta tela e proposital (`MAX_ITEMS`): venda de balcao raramente
 * passa disso, e o checkout da FASE 3 nao tem esse teto. Deixar o campo ilimitado num
 * formulario unico so aumentaria a chance de erro de digitacao sem ganho real.
 *
 * Quando a venda aprovada baixa o estoque **na hora**; "aguardando pagamento" nao baixa nada
 * ate a confirmacao (§8).
 */

const MAX_ITEMS = 5;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePermission('orders', 'create');
  const params = await searchParams;

  const customerId = readText(params.cliente, 40);

  const [variants, customer] = await Promise.all([
    listVariantOptions(user.storeId, undefined, 500),
    customerId ? getCustomer({ storeId: user.storeId, id: customerId }) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Registrar venda"
        description="Pedido feito no balcão, no WhatsApp ou por telefone. Venda aprovada baixa o estoque agora; aguardando pagamento não baixa."
        action={
          <ButtonLink href="/admin/pedidos" variant="outline" size="sm">
            Voltar
          </ButtonLink>
        }
      />

      {variants.length === 0 ? (
        <Panel>
          <p className="type-body text-body-sm text-muted">
            Não há variação cadastrada. Cadastre um produto e gere a grade antes de registrar venda.
          </p>
        </Panel>
      ) : (
        <AdminForm action={createOrderAction} submitLabel="Registrar pedido" pendingLabel="Registrando…">
          <Fieldset legend="Origem e status">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Origem" htmlFor="channel">
                <select id="channel" name="channel" defaultValue="STORE" className={selectClass}>
                  <option value="STORE">Loja física</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Telefone</option>
                  <option value="ONLINE">Loja online</option>
                </select>
              </Field>

              <Field
                label="Situação"
                htmlFor="status"
                hint="Pagamento aprovado baixa o estoque agora; aguardando pagamento só depois da confirmação."
              >
                <select id="status" name="status" defaultValue="PAID" className={selectClass}>
                  <option value="PAID">Pagamento aprovado (baixa estoque)</option>
                  <option value="PENDING_PAYMENT">Aguardando pagamento</option>
                </select>
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend="Cliente" description="O cliente é criado no cadastro se ainda não existir, pelo e-mail.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome" htmlFor="name">
                <input id="name" name="name" defaultValue={customer?.name ?? ''} required className={inputClass} />
              </Field>
              <Field label="E-mail" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={customer?.email ?? ''}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Telefone" htmlFor="phone">
                <input id="phone" name="phone" defaultValue={customer?.phone ?? ''} className={inputClass} />
              </Field>
              <Field label="CPF/CNPJ" htmlFor="document" hint="Somente se a loja emitir nota fiscal.">
                <input id="document" name="document" defaultValue={customer?.document ?? ''} className={inputClass} />
              </Field>
            </div>
          </Fieldset>

          <Fieldset
            legend="Itens"
            description="Escolha a variação (cor × tamanho). Preço em branco usa o preço do catálogo."
          >
            {Array.from({ length: MAX_ITEMS }).map((_, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-[3fr_1fr_1fr]">
                <Field label={`Item ${index + 1}`} htmlFor={`variantId-${index}`}>
                  <select id={`variantId-${index}`} name="variantId" defaultValue="" className={selectClass}>
                    <option value="">—</option>
                    {variants.map((variant) => (
                      <option key={variant.variantId} value={variant.variantId}>
                        {variant.label} — saldo {variant.quantity}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantidade" htmlFor={`quantity-${index}`}>
                  <input
                    id={`quantity-${index}`}
                    name="quantity"
                    inputMode="numeric"
                    defaultValue={index === 0 ? '1' : ''}
                    className={inputClass}
                  />
                </Field>
                <Field label="Preço unitário" htmlFor={`unitPrice-${index}`}>
                  <input id={`unitPrice-${index}`} name="unitPrice" inputMode="decimal" className={inputClass} />
                </Field>
              </div>
            ))}
          </Fieldset>

          <Fieldset legend="Valores e pagamento">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Desconto (R$)" htmlFor="discountAmount">
                <input id="discountAmount" name="discountAmount" inputMode="decimal" className={inputClass} />
              </Field>
              <Field label="Frete (R$)" htmlFor="shippingAmount">
                <input id="shippingAmount" name="shippingAmount" inputMode="decimal" className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Entrega" htmlFor="shippingLabel">
                <select id="shippingLabel" name="shippingLabel" defaultValue="" className={selectClass}>
                  <option value="">A definir</option>
                  {ecommerceConfig.shipping.deliveryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Forma de pagamento" htmlFor="paymentMethod">
                <select id="paymentMethod" name="paymentMethod" defaultValue="" className={selectClass}>
                  <option value="">A definir</option>
                  {ecommerceConfig.payments.methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Observações" htmlFor="notes" hint="Vai para o histórico do pedido.">
              <textarea id="notes" name="notes" className={textareaClass} />
            </Field>
          </Fieldset>

          <Fieldset
            legend="Endereço de entrega"
            description="Opcional. Quando preenchido, fica gravado no pedido como estava no dia da venda."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Destinatário" htmlFor="recipient">
                <input id="recipient" name="recipient" className={inputClass} />
              </Field>
              <Field label="CEP" htmlFor="postalCode">
                <input id="postalCode" name="postalCode" className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-[3fr_1fr_1fr]">
              <Field label="Logradouro" htmlFor="line1">
                <input id="line1" name="line1" className={inputClass} />
              </Field>
              <Field label="Número" htmlFor="number">
                <input id="number" name="number" className={inputClass} />
              </Field>
              <Field label="Complemento" htmlFor="complement">
                <input id="complement" name="complement" className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-4">
              <Field label="Bairro" htmlFor="district">
                <input id="district" name="district" className={inputClass} />
              </Field>
              <Field label="Cidade" htmlFor="city">
                <input id="city" name="city" className={inputClass} />
              </Field>
              <Field label="UF" htmlFor="state">
                <input id="state" name="state" className={inputClass} />
              </Field>
            </div>
          </Fieldset>
        </AdminForm>
      )}
    </div>
  );
}
