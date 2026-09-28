import { requireStaff } from '@/lib/auth/guards';
import { getPrisma } from '@/lib/db';

/**
 * Visao geral do painel.
 *
 * Numeros lidos do banco, escopados pela loja do usuario (escopo §22) — nenhum valor
 * decorativo. Estoque baixo usa o mesmo corte que a loja mostra ao cliente.
 */

const LOW_STOCK = 5;

export default async function AdminPage() {
  const user = await requireStaff();
  const prisma = getPrisma();
  const storeId = user.storeId;

  const [products, activeProducts, categories, collections, variants, units, lowStock, movements] =
    await Promise.all([
      prisma.product.count({ where: { storeId, deletedAt: null } }),
      prisma.product.count({ where: { storeId, deletedAt: null, status: 'ACTIVE' } }),
      prisma.category.count({ where: { storeId, deletedAt: null } }),
      prisma.collection.count({ where: { storeId, deletedAt: null } }),
      prisma.productVariant.count({ where: { storeId, deletedAt: null } }),
      prisma.inventory.aggregate({ where: { storeId }, _sum: { quantity: true } }),
      prisma.inventory.count({ where: { storeId, quantity: { lte: LOW_STOCK } } }),
      prisma.inventoryMovement.count({ where: { storeId } }),
    ]);

  const cards = [
    { label: 'Produtos publicados', value: activeProducts, hint: `${products} no total` },
    { label: 'Variações', value: variants, hint: 'cor × tamanho' },
    { label: 'Peças em estoque', value: units._sum.quantity ?? 0, hint: 'soma das variações' },
    { label: 'Estoque baixo', value: lowStock, hint: `${LOW_STOCK} peças ou menos` },
    { label: 'Categorias', value: categories, hint: 'ativas' },
    { label: 'Coleções', value: collections, hint: 'ativas' },
    { label: 'Movimentações', value: movements, hint: 'histórico de estoque' },
  ];

  return (
    <div>
      <h2 className="type-label text-label text-muted">Visão geral</h2>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border-border rounded-sm border p-4">
            <dt className="type-label text-label text-muted">{card.label}</dt>
            <dd className="type-display text-body-lg mt-2">{card.value}</dd>
            <p className="type-body text-body-sm text-muted mt-1">{card.hint}</p>
          </div>
        ))}
      </dl>

      <p className="type-body text-body-sm text-muted mt-10 max-w-[var(--measure-prose)]">
        A edição de produtos, estoque e pedidos entra na FASE 2 do roadmap: este painel ainda é a
        casca autenticada, com a permissão validada no servidor.
      </p>
    </div>
  );
}
