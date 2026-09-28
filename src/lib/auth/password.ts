import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Hash de senha com `scrypt` do proprio Node.
 *
 * Sem dependencia externa (escopo §40) e sem modulo nativo para compilar. O formato
 * guardado e `scrypt$<salt>$<hash>`, entao o algoritmo pode mudar depois sem invalidar o que
 * ja esta no banco: a verificacao le o esquema do proprio registro.
 */

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const SCHEME = 'scrypt';
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Normaliza para que a mesma senha digitada em teclados diferentes confira. */
function normalize(password: string): string {
  return password.normalize('NFKC');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scryptAsync(normalize(password), salt, KEY_LENGTH);

  return `${SCHEME}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltValue, hashValue] = stored.split('$');
  if (scheme !== SCHEME || !saltValue || !hashValue) return false;

  const salt = Buffer.from(saltValue, 'base64');
  const expected = Buffer.from(hashValue, 'base64');
  const derived = await scryptAsync(normalize(password), salt, expected.length);

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/**
 * Comparacao descartavel, usada quando o e-mail nao existe.
 *
 * Sem isso, responder rapido demais para e-mail inexistente e responder devagar para senha
 * errada ja entrega quais contas existem. O custo e o mesmo de uma verificacao real.
 */
export async function fakeVerify(): Promise<false> {
  await scryptAsync(normalize('senha-inexistente'), randomBytes(SALT_LENGTH), KEY_LENGTH);
  return false;
}
