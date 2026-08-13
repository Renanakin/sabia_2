/**
 * Server-side auth guard para server components
 * ===============================================
 *
 * Usar al inicio de cualquier server component o page que requiera
 * autenticación + rol específico. Redirige a /login si falla.
 *
 * Ejemplo:
 *   export default async function DashboardPage() {
 *     const session = await requireRolePage(['superadmin']);
 *     return <h1>Hola {session.email}</h1>;
 *   }
 */

import { redirect } from 'next/navigation';
import { getSession, type Session } from './session';
import type { AccessTokenClaims } from './jwt-edge';

export async function requireSessionPage(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}

export async function requireRolePage(
  allowedRoles: AccessTokenClaims['role'][]
): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }
  if (!allowedRoles.includes(session.role)) {
    // Tiene sesión pero no el rol correcto
    redirect('/admin/login?error=forbidden');
  }
  return session;
}
