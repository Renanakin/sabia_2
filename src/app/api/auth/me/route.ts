/**
 * GET /api/auth/me
 * =================
 * Devuelve la sesión actual si existe, o 401.
 * Útil para que el cliente sepa si está logueado al cargar la página.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
      installation: session.installation,
    },
  });
}
