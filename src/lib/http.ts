/**
 * Helpers HTTP para Route Handlers
 * ==================================
 * - parseJsonBody: parsea body validando con Zod
 * - jsonError: respuesta de error JSON estandar
 * - jsonSuccess: respuesta exitosa JSON estandar
 * - getClientIp: extrae IP del request respetando X-Forwarded-For
 * - getUserAgent: extrae User-Agent
 */

import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message, details: details ?? undefined } },
    { status }
  );
}

export function jsonSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export async function parseJsonBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, 'invalid_json', 'Cuerpo JSON inválido');
  }
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(400, 'validation_error', 'Datos inválidos', error.flatten());
    }
    throw error;
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}

export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') ?? 'unknown';
}

/**
 * Wrapper que captura HttpError y otros errores, devolviendo JSON consistente.
 */
export function handle<T>(fn: () => Promise<T> | Promise<NextResponse>) {
  return async (): Promise<NextResponse> => {
    try {
      const result = await fn();
      if (result instanceof NextResponse) return result;
      return jsonSuccess(result);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonError(error.status, error.code, error.message, error.details);
      }
      console.error('[api] unexpected error:', error);
      return jsonError(500, 'internal_error', 'Error interno del servidor');
    }
  };
}
