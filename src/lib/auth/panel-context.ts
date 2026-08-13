/**
 * Resuelve el `client_id` para un usuario con rol `contador` o `asistente`.
 * ========================================================================
 *
 * A diferencia del cliente (que ve UN cliente), un contador puede ver
 * N clientes (los que tiene asignados via `user_client_access`).
 *
 * Esta función devuelve la LISTA de clientes asignados.
 *
 * SEGURIDAD: solo lectura, no permite pasar un client_id arbitrario.
 * El client_id que el contador "quiere ver" DEBE estar en su lista.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { userClientAccess, accountingClients, type AccountingClient } from '@/lib/db/schema';
import type { Session } from './session';

export interface PanelContext {
  userId: string;
  clients: Array<{ client: AccountingClient; accessLevel: 'read_only' | 'read_write' | 'admin' }>;
}

export async function getPanelContext(session: Session): Promise<PanelContext | null> {
  if (session.role !== 'contador' && session.role !== 'asistente') {
    return null;
  }

  const rows = await db
    .select({
      client: accountingClients,
      accessLevel: userClientAccess.accessLevel,
    })
    .from(userClientAccess)
    .innerJoin(accountingClients, eq(accountingClients.id, userClientAccess.clientId))
    .where(eq(userClientAccess.userId, session.userId));

  return {
    userId: session.userId,
    clients: rows,
  };
}

/**
 * Verifica que el user tiene acceso al clientId. Devuelve el accessLevel
 * o null si no tiene acceso.
 */
export async function checkClientAccess(
  userId: string,
  clientId: string
): Promise<'read_only' | 'read_write' | 'admin' | null> {
  const access = await db.query.userClientAccess.findFirst({
    where: (a, { and, eq }) => and(eq(a.userId, userId), eq(a.clientId, clientId)),
  });
  return access?.accessLevel ?? null;
}
