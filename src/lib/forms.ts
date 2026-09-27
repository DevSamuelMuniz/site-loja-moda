import { z } from 'zod';

/**
 * Esquemas de formulario.
 *
 * A validacao roda no cliente antes do envio e no servidor antes de qualquer
 * encaminhamento, para que a mesma regra valha nos dois lados.
 */

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export const newsletterSchema = z.object({
  email: z.string().trim().regex(emailPattern, 'Informe um e-mail válido, como nome@dominio.com.'),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.string().trim().regex(emailPattern, 'Informe um e-mail válido, como nome@dominio.com.'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.replace(/\D/g, '').length >= 10, {
      message: 'Informe DDD e número, por exemplo (81) 99999-9999.',
    }),
  subject: z.string().trim().min(3, 'Escolha um assunto.'),
  message: z.string().trim().min(10, 'Conte um pouco mais, com pelo menos 10 caracteres.'),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

export interface FieldIssue {
  field: string;
  message: string;
}

/** Converte os problemas do Zod em uma lista simples de campo e mensagem. */
export function toFieldIssues(error: z.ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'formulario',
    message: issue.message,
  }));
}

export type SubmitState =
  | { status: 'idle' }
  | { status: 'invalid'; issues: FieldIssue[] }
  | { status: 'pending' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

/**
 * Envia os dados para o endpoint configurado.
 *
 * Sem endpoint, devolve `disconnected`: nenhuma requisicao e feita e nenhum sucesso
 * e simulado.
 */
export async function submitToEndpoint(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; reason: 'disconnected' | 'failed' }> {
  if (!endpoint) return { ok: false, reason: 'disconnected' };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok ? { ok: true } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
