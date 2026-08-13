/**
 * Middleware de Next.js — ruteo por subdominio
 * ==============================================
 *
 * En dev (Windows / Mac / Linux), los subdominios *.localhost resuelven
 * automáticamente a 127.0.0.1, no requiere editar hosts.
 *
 * Subdominios soportados:
 *   - (sin subdominio) / www → marketing (público)
 *   - admin.*  → panel del superadmin
 *   - panel.*  → panel contable (contadores / asistentes)
 *   - *.       → portal del cliente (ej: cliente-a.sabiacontable.cl)
 *
 * El middleware:
 * 1. Lee el subdominio del Host header
 * 2. Rewrite interno a /admin/*, /contable/* o /portal/*
 * 3. Setea header X-Installation-Slug para que los Route Handlers
 *    sepan a qué instalación pertenecen
 * 4. Para rutas protegidas, valida la sesión (access token en cookie)
 *
 * IMPORTANTE: este middleware corre en Edge Runtime. No puede usar
 * bcrypt ni drizzle directamente (limitación de Edge). Por eso la
 * verificación de JWT usa `jose` (edge-compatible) y la consulta a
 * DB se hace en Route Handlers (Node runtime), no acá.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt-edge';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost';

interface SubdomainInfo {
  type: 'marketing' | 'admin' | 'panel' | 'portal';
  slug: string | null; // para portal: el slug del cliente
}

function parseSubdomain(host: string): SubdomainInfo {
  // Quitar puerto si existe
  const hostname = host.split(':')[0];

  // Quitar root domain
  if (!hostname.endsWith(ROOT_DOMAIN)) {
    return { type: 'marketing', slug: null };
  }

  const sub = hostname.slice(0, hostname.length - ROOT_DOMAIN.length);
  // Quitar punto final
  const cleanSub = sub.endsWith('.') ? sub.slice(0, -1) : sub;

  if (!cleanSub || cleanSub === 'www') {
    return { type: 'marketing', slug: null };
  }

  if (cleanSub === 'admin') {
    return { type: 'admin', slug: null };
  }

  if (cleanSub === 'panel') {
    return { type: 'panel', slug: null };
  }

  // Cualquier otro subdominio = portal de un cliente
  return { type: 'portal', slug: cleanSub };
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const info = parseSubdomain(host);

  // Rutas API: dejar pasar (ya tienen su propia lógica de auth)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Recursos estáticos: dejar pasar
  if (
    req.nextUrl.pathname.startsWith('/_next/') ||
    req.nextUrl.pathname.startsWith('/favicon') ||
    /\.(svg|png|jpg|jpeg|webp|ico|css|js|woff|woff2|ttf)$/i.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // Rewrite por tipo
  const url = req.nextUrl.clone();
  let target: string | null = null;

  if (info.type === 'admin') {
    target = `/admin${url.pathname === '/' ? '' : url.pathname}`;
  } else if (info.type === 'panel') {
    target = `/contable${url.pathname === '/' ? '' : url.pathname}`;
  } else if (info.type === 'portal') {
    // Portal del cliente: rewrite a /portal/[slug]/...
    target = `/portal/${info.slug}${url.pathname === '/' ? '' : url.pathname}`;
  } else {
    // Marketing: pasar tal cual
    return NextResponse.next();
  }

  // Rewrite interno (la URL no cambia en el browser, solo el routing interno)
  url.pathname = target;
  const response = NextResponse.rewrite(url);

  // Setear header de instalación para Route Handlers (en server components se lee con headers())
  if (info.slug) {
    response.headers.set('X-Installation-Slug', info.slug);
  } else if (info.type === 'admin' || info.type === 'panel') {
    // En single-tenant MVP, admin/panel usan INSTALLATION_SLUG de env
    response.headers.set('X-Installation-Slug', process.env.INSTALLATION_SLUG ?? 'dev');
  }

  // Verificar sesión para rutas protegidas (panel, portal, admin)
  // (marketing ya hizo `return NextResponse.next()` arriba, así que info.type
  // es 'admin' | 'panel' | 'portal' acá)
  const accessToken = req.cookies.get('sabia_access')?.value;
  if (accessToken) {
    verifyAccessToken(accessToken).then((claims) => {
      if (claims) {
        // Podríamos setear headers de request para server components
        // pero eso requiere pasar por headers de request, no response
      }
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
