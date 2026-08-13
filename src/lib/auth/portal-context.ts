/**
 * Resuelve el `client_id` para un usuario con rol `cliente`.
 * ============================================================
 *
 * Para el portal del cliente, TODA query debe filtrar por el client_id
 * del usuario autenticado. NUNCA se acepta client_id del request.
 *
 * Si el usuario no tiene cliente asignado, devuelve error.
 *
 * SEGURIDAD: el client_id se resuelve server-side desde la sesión.
 * El cliente NUNCA puede "ver documentos de otro client" porque ni
 * siquiera conoce otros IDs.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { userClientAccess, accountingClients, type AccountingClient } from '@/lib/db/schema';
import type { Session } from './session';

export interface PortalContext {
  client: AccountingClient;
  accessLevel: 'read_only' | 'read_write' | 'admin';
}

export async function getPortalContext(session: Session): Promise<PortalContext | null> {
  // Solo aplica a rol 'cliente'
  if (session.role !== 'cliente') {
    return null;
  }

  const access = await db
    .select({
      client: accountingClients,
      accessLevel: userClientAccess.accessLevel,
    })
    .from(userClientAccess)
    .innerJoin(accountingClients, eq(accountingClients.id, userClientAccess.clientId))
    .where(eq(userClientAccess.userId, session.userId))
    .limit(1);

  const row = access[0];
  if (!row) return null;

  return {
    client: row.client,
    accessLevel: row.accessLevel,
  };
}
