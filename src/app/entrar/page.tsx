import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { auth } from '@/auth';
import { isStaff } from '@/lib/auth/guards';
import { brandConfig } from '@/config/brand';
import { loginAction } from './actions';

/**
 * Entrada da equipe.
 *
 * Fora do indice dos buscadores e sem JavaScript obrigatorio: o formulario e uma Server
 * Action, entao a senha nunca passa por codigo que roda no navegador.
 */

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  credenciais: 'E-mail ou senha não conferem. Confira os dados e tente de novo.',
  campos: 'Preencha e-mail e senha para continuar.',
  sessao: 'Sua sessão expirou ou a conta foi desativada. Entre novamente.',
  permissao: 'Sua conta não tem acesso ao painel.',
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; callbackUrl?: string }>;
}) {
  const { erro, callbackUrl } = await searchParams;
  const session = await auth();

  /* Quem ja esta dentro nao precisa ver o formulario. */
  if (isStaff(session?.user?.role)) redirect('/admin');

  const message = erro ? messages[erro] : undefined;

  return (
    <Container className="py-20 lg:py-28">
      <div className="max-w-md">
        <p className="type-label text-label text-muted">Área da equipe</p>
        <h1 className="type-display text-display-xl mt-3">Entrar no painel</h1>
        <p className="type-body text-body-lg text-muted mt-4">
          Acesso restrito à equipe da {brandConfig.name}. Clientes não precisam de conta para
          comprar.
        </p>

        {message ? (
          <p
            role="alert"
            className="border-border type-body text-body-sm mt-8 rounded-sm border p-4"
          >
            {message}
          </p>
        ) : null}

        <form action={loginAction} className="mt-8 flex flex-col gap-4">
          {/* O destino só vira redirecionamento depois de validado na Server Action. */}
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/admin'} />

          <label className="flex flex-col gap-2">
            <span className="type-label text-label text-muted">E-mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="border-border type-body text-body focus:border-primary h-11 rounded-sm border bg-transparent px-4 outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="type-label text-label text-muted">Senha</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="border-border type-body text-body focus:border-primary h-11 rounded-sm border bg-transparent px-4 outline-none"
            />
          </label>

          <Button type="submit" size="lg" className="mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </Container>
  );
}
