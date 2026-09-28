'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';

/**
 * Entrar e sair.
 *
 * Tudo em Server Action: o formulario nao precisa de JavaScript no cliente e a senha nunca
 * passa por codigo que roda no navegador.
 */

/** Aceita apenas caminho interno, para o `callbackUrl` nao virar redirecionamento aberto. */
function safeCallback(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = safeCallback(String(formData.get('callbackUrl') ?? '/admin'));
  const back = `/entrar?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  if (!email || !password) redirect(`${back}&erro=campos`);

  try {
    await signIn('credentials', { email, password, redirectTo: callbackUrl });
  } catch (error) {
    /* `signIn` sinaliza sucesso com um redirecionamento: so erro de credencial vira aviso. */
    if (error instanceof AuthError) redirect(`${back}&erro=credenciais`);
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
