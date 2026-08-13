/**
 * Hashing de passwords con bcrypt
 * ================================
 * Cost 12 = ~250ms por hash en hardware moderno. Balance seguridad/UX.
 *
 * NOTA: usamos bcryptjs (puro JS) en vez de bcrypt (nativo) para evitar
 * problemas de compilación en Windows + Docker.
 */

import bcrypt from 'bcryptjs';

const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) {
    throw new Error('Password debe tener al menos 8 caracteres');
  }
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
