/**
 * Identificadores legiveis (escopo §7: `slug` e `sku`).
 *
 * O endereco publico vem do nome (`Camiseta Essential` → `camiseta-essential`), sem acento e
 * sem maiuscula, porque o slug aparece em URL e em `sitemap`. Duas lojas podem ter o mesmo
 * slug — a unicidade e sempre composta com o `storeId` (regra 3 do multi-tenant).
 */

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    /* Marcas de acento separadas pela normalizacao NFD. */
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Devolve um slug livre, acrescentando sufixo numerico quando preciso.
 *
 * `exists` consulta o banco — por isso o teste vem de fora: a regra de unicidade de cada
 * tabela (produto, categoria, colecao) muda, o algoritmo nao.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base || 'item';

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? root : `${root}-${suffix + 1}`;
    if (!(await exists(candidate))) return candidate;
  }

  /* Catalogo com 50 variacoes do mesmo nome: improvavel, mas o codigo nao pode travar. */
  return `${root}-${Date.now().toString(36)}`;
}

/** SKU da variacao: `CAM-ESSENTIAL-PRETO-M`. */
export function buildVariantSku(productSku: string, colorSlug: string, size: string): string {
  const sizePart = slugify(size).toUpperCase() || 'U';
  const colorPart = colorSlug ? colorSlug.toUpperCase() : 'COR';

  return [productSku.toUpperCase(), colorPart, sizePart].join('-').slice(0, 60);
}

/** Le uma lista digitada em textarea: uma por linha ou separada por virgula. */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    ),
  ];
}

/**
 * Le cores no formato `Nome #hex`, uma por linha.
 *
 * O hex e obrigatorio: a loja mostra a cor como amostra, e amostra errada e pior do que
 * nenhuma. Linha sem hex volta como erro para o formulario.
 */
export interface ParsedColor {
  name: string;
  hex: string;
}

export function parseColors(value: string | null | undefined): { colors: ParsedColor[]; invalid: string[] } {
  const colors: ParsedColor[] = [];
  const invalid: string[] = [];

  for (const line of (value ?? '').split('\n')) {
    const text = line.trim();
    if (!text) continue;

    const match = text.match(/^(.*?)[\s,;]+(#?[0-9a-fA-F]{3,8})$/);
    if (!match) {
      invalid.push(text);
      continue;
    }

    const name = match[1].trim();
    const hex = match[2].startsWith('#') ? match[2] : `#${match[2]}`;

    if (!name || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i.test(hex)) {
      invalid.push(text);
      continue;
    }

    colors.push({ name, hex: hex.toUpperCase() });
  }

  return { colors, invalid };
}
