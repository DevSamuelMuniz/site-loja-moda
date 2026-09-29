import { cn } from '@/lib/utils';

/**
 * Campos de formulario do painel.
 *
 * Tudo aqui e servidor puro: os formularios do painel sao Server Actions, entao eles
 * funcionam com JavaScript desligado e a validacao que importa acontece no backend (§23).
 * Estas pecas existem para o campo ter o mesmo visual e o mesmo `label` associado.
 */

const control =
  'border-border type-body text-body focus:border-primary w-full rounded-sm border bg-transparent px-4 outline-none disabled:opacity-60';

export const inputClass = cn(control, 'h-11');
export const textareaClass = cn(control, 'min-h-28 py-3');
export const selectClass = cn(control, 'h-11');

export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={cn('flex flex-col gap-2', className)}>
      <span className="type-label text-label text-muted">{label}</span>
      {children}
      {hint ? <span className="type-body text-body-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function CheckboxField({
  label,
  hint,
  name,
  defaultChecked,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="border-border accent-primary mt-1 h-4 w-4 rounded-sm border"
      />
      <span className="flex flex-col gap-1">
        <span className="type-body text-body">{label}</span>
        {hint ? <span className="type-body text-body-sm text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Grupo de campos com titulo, para o formulario longo nao virar uma parede de inputs. */
export function Fieldset({
  legend,
  description,
  className,
  children,
}: {
  legend: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn('border-border rounded-sm border p-5', className)}>
      <legend className="type-label text-label px-2">{legend}</legend>
      {description ? (
        <p className="type-body text-body-sm text-muted mb-5 max-w-[var(--measure-prose)]">
          {description}
        </p>
      ) : null}
      <div className="flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}
