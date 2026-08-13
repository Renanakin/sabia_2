/**
 * GET /api/contable/clients
 * ==========================
 *
 * Lista los clientes asignados al contador autenticado.
 *
 * SEGURIDAD: solo devuelve clientes donde el user tiene `user_client_access`.
 * NUNCA acepta client_id del request para "ver todos".
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getPanelContext } from '@/lib/auth/panel-context';

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }
  if (session.role !== 'contador' && session.role !== 'asistente') {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'Requiere rol contador o asistente' } },
      { status: 403 }
    );
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return NextResponse.json(
      { ok: false, error: { code: 'no_clients', message: 'No tienes clientes asignados' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      items: ctx.clients.map((c) => ({
        id: c.client.id,
        rut: c.client.rut,
        legalName: c.client.legalName,
        taxRegime: c.client.taxRegime,
        accessLevel: c.accessLevel,
        active: c.client.active,
      })),
    },
  });
}
