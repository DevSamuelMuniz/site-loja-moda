import { cn } from '@/lib/utils';

/**
 * Pecas de tabela do painel.
 *
 * Um componente generico com funcao de renderizacao obrigaria a pagina a ser cliente; o
 * painel e servidor. Entao a tabela e markup compartilhado com estilo unico — a pagina
 * escreve as colunas que precisa.
 */

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('border-border overflow-x-auto rounded-sm border', className)}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface border-border border-b">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <th scope="col" className={cn('type-label text-label text-muted px-4 py-3 font-normal', className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-border divide-y">{children}</tbody>;
}

export function TR({ className, children }: { className?: string; children: React.ReactNode }) {
  return <tr className={className}>{children}</tr>;
}

export function TD({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <td className={cn('type-body text-body-sm px-4 py-3 align-middle', className)}>{children}</td>;
}

/** Linha vazia: a tabela precisa dizer que consultou, e nao que quebrou. */
export function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="type-body text-body-sm text-muted px-4 py-10 text-center">
        {message}
      </td>
    </tr>
  );
}
