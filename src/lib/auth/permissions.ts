import type { UserRole } from '@/generated/prisma/enums';

/**
 * Permissao por modulo (escopo §23).
 *
 * Antes havia uma pergunta so — "e da equipe?" — e ADMIN, MANAGER e OPERATOR entravam em
 * tudo. Agora cada modulo do painel declara o que cada papel pode fazer, e essa e a unica
 * fonte da verdade: a navegacao do painel **esconde** o que o papel nao alcanca, mas quem
 * decide e `can()`, chamada no servidor em toda pagina e em toda server action.
 *
 * Esconder item de menu nao e autorizacao (escopo §23) — o menu so evita frustracao; a
 * barreira esta no backend.
 *
 * Escopo de cada papel, conforme §23:
 * - ADMIN: opera a loja inteira, incluindo exclusao de cadastro.
 * - MANAGER: produtos, categorias, colecoes, pedidos, estoque e clientes; **nao exclui**
 *   cadastro — exclusao e ato do administrador, e no catalogo ela e logica (`deletedAt`).
 * - OPERATOR: operacao do dia — consulta catalogo, mexe em estoque e anda com o status do
 *   pedido. Nao cria nem edita cadastro, nao cancela pedido.
 * - CUSTOMER: nao entra no painel.
 *
 * Modulos de FASE 3 em diante (cupons, conteudo, aparencia, relatorios, integracoes) entram
 * aqui quando existirem — nao antes, para a matriz nao descrever tela que nao existe.
 */

export const ADMIN_MODULES = [
  'dashboard',
  'products',
  'categories',
  'collections',
  'inventory',
  'orders',
  'customers',
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number];

export const ADMIN_ACTIONS = ['view', 'create', 'update', 'delete'] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

type ModulePermissions = Partial<Record<AdminModule, readonly AdminAction[]>>;

/**
 * Matriz papel × modulo × acao.
 *
 * `inventory` nao tem `delete`: movimentacao de estoque e historico, e historico nao se
 * apaga (§8). Corrigir um lancamento errado e registrar o ajuste inverso, com motivo.
 * `orders` tambem nao tem `delete`: pedido se cancela, nao se apaga (§13).
 */
export const PERMISSIONS: Record<UserRole, ModulePermissions> = {
  ADMIN: {
    dashboard: ['view'],
    products: ['view', 'create', 'update', 'delete'],
    categories: ['view', 'create', 'update', 'delete'],
    collections: ['view', 'create', 'update', 'delete'],
    inventory: ['view', 'create', 'update'],
    orders: ['view', 'create', 'update'],
    customers: ['view', 'create', 'update'],
  },
  MANAGER: {
    dashboard: ['view'],
    products: ['view', 'create', 'update'],
    categories: ['view', 'create', 'update'],
    collections: ['view', 'create', 'update'],
    inventory: ['view', 'create', 'update'],
    orders: ['view', 'create', 'update'],
    customers: ['view', 'update'],
  },
  OPERATOR: {
    dashboard: ['view'],
    products: ['view'],
    categories: ['view'],
    collections: ['view'],
    inventory: ['view', 'create'],
    orders: ['view', 'update'],
    customers: ['view'],
  },
  CUSTOMER: {},
};

export const MODULE_LABELS: Record<AdminModule, string> = {
  dashboard: 'Visão geral',
  products: 'Produtos',
  categories: 'Categorias',
  collections: 'Coleções',
  inventory: 'Estoque',
  orders: 'Pedidos',
  customers: 'Clientes',
};

/** Rota de cada modulo dentro do painel. */
export const MODULE_PATHS: Record<AdminModule, string> = {
  dashboard: '/admin',
  products: '/admin/produtos',
  categories: '/admin/categorias',
  collections: '/admin/colecoes',
  inventory: '/admin/estoque',
  orders: '/admin/pedidos',
  customers: '/admin/clientes',
};

export function can(role: UserRole, module: AdminModule, action: AdminAction): boolean {
  const allowed = PERMISSIONS[role][module];
  return allowed !== undefined && allowed.includes(action);
}

/** Modulos que o papel consegue ao menos ver — usado para montar a navegacao do painel. */
export function visibleModules(role: UserRole): AdminModule[] {
  return ADMIN_MODULES.filter((module) => can(role, module, 'view'));
}
