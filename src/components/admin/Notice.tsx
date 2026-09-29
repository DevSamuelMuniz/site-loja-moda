import { cn } from '@/lib/utils';

/**
 * Avisos do painel.
 *
 * Duas origens, um visual so:
 * - `FlashNotice`: o resultado de uma Server Action que redirecionou (`?ok=salvo`);
 * - `Notice`: o retorno de uma action que ficou na mesma pagina (erro de formulario).
 *
 * Nenhum aviso e decorativo: ou veio de uma escrita que aconteceu, ou de uma que foi
 * recusada — o painel nao inventa confirmacao (escopo §3).
 */
export function Notice({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'success' | 'danger';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'type-body text-body-sm rounded-sm border p-4',
        tone === 'danger' && 'border-danger text-danger',
        tone === 'success' && 'border-success text-success',
        tone === 'info' && 'border-border text-muted',
        className,
      )}
    >
      {children}
    </p>
  );
}

export interface FlashMessage {
  ok?: string;
  erro?: string;
}

const OK_MESSAGES: Record<string, string> = {
  criado: 'Registro criado.',
  salvo: 'Alterações salvas.',
  excluido: 'Registro removido.',
  duplicado: 'Cópia criada como rascunho.',
  estoque: 'Estoque atualizado com a movimentação registrada.',
  status: 'Status do pedido atualizado.',
  pedido: 'Pedido registrado.',
  endereco: 'Endereço salvo.',
  avaliacao: 'Avaliação moderada.',
  conta: 'Tudo certo com a sua conta.',
};

const ERROR_MESSAGES: Record<string, string> = {
  permissao: 'Sua conta não tem permissão para esta ação.',
  dados: 'Confira os campos destacados e tente de novo.',
  estoque: 'A quantidade pedida passa do estoque disponível.',
  'nao-encontrado': 'O registro não existe mais nesta loja.',
  'em-uso': 'Há pedidos usando este registro: ele não pode ser excluído.',
  conflito: 'Já existe um registro com este identificador.',
};

export function flashMessage({ ok, erro }: FlashMessage): { tone: 'success' | 'danger'; text: string } | null {
  if (erro) {
    return { tone: 'danger', text: ERROR_MESSAGES[erro] ?? 'A ação não foi concluída.' };
  }
  if (ok) {
    return { tone: 'success', text: OK_MESSAGES[ok] ?? 'Feito.' };
  }
  return null;
}

export function FlashNotice({ ok, erro }: FlashMessage) {
  const message = flashMessage({ ok, erro });
  if (!message) return null;

  return (
    <Notice tone={message.tone} className="mt-6">
      {message.text}
    </Notice>
  );
}
