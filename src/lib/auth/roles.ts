import type { UserRole } from '@/generated/prisma/enums';

/**
 * Papeis que existem no modelo (escopo §23).
 *
 * Quais deles entram no painel e decisao de autorizacao e vive em `./guards`: sao coisas
 * diferentes que hoje coincidem, e na FASE 2 a permissao passa a ser por modulo.
 */
export const ROLE_VALUES = [
  'CUSTOMER',
  'ADMIN',
  'MANAGER',
  'OPERATOR',
] as const satisfies readonly UserRole[];

/**
 * Estreita um valor vindo de fora — token, formulario, query — para `UserRole`.
 *
 * O token de sessao e entrada externa: validar, nao confiar.
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ROLE_VALUES as readonly string[]).includes(value);
}
