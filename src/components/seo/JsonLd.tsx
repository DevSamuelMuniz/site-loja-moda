/**
 * Dado estruturado em JSON-LD.
 *
 * O conteudo e gerado no servidor a partir do repositorio e da configuracao, nunca
 * a partir de entrada do usuario, o que mantem o `<script>` restrito a dados
 * conhecidos.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
