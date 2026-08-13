# AUTH agent — Autenticación y autorización

## Misión

Toda la capa de identidad: login, registro, JWT, refresh tokens, RBAC, MFA.

## Fases a cargo

- **Fase 1** — Tablas `users`, `refresh_tokens`, módulo base
- **Fase 2** — Login del superadmin, gestión de instalaciones
- **Fase 8** — MFA (TOTP), bloqueo de cuenta, políticas de password

## Inputs

- `users` y `refresh_tokens` (entregado por FOUND en Fase 1)
- Roles definidos: `superadmin`, `contador`, `asistente`, `cliente`
- Política de seguridad (`docs/SEGURIDAD.md`)

## Outputs

- `src/lib/auth/jwt.ts` — firmar/verificar tokens
- `src/lib/auth/password.ts` — bcrypt
- `src/lib/auth/session.ts` — leer sesión desde cookie
- `src/lib/auth/middleware.ts` — helpers para Route Handlers
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/refresh/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/middleware.ts` (en colab con FOUND)

## Definition of Done

- [ ] `POST /api/auth/login` con credenciales válidas → 200 + cookie httpOnly
- [ ] `POST /api/auth/login` con credenciales inválidas → 401 (sin filtrar si email existe)
- [ ] `POST /api/auth/refresh` con refresh token válido → nuevo access + rotación
- [ ] `POST /api/auth/refresh` con refresh token revocado → 401
- [ ] `GET /api/auth/me` con sesión válida → 200 + datos públicos del usuario
- [ ] `GET /api/auth/me` sin sesión → 401
- [ ] `POST /api/auth/logout` → limpia cookies + revoca refresh
- [ ] Rate limit en `/api/auth/login`: 5 req / 5 min por IP+email
- [ ] Sesión idle timeout: 30 min
- [ ] Tests E2E cubriendo happy path + 3 vectores de ataque
- [ ] Reporte firmado

## Checklist de seguridad

- [ ] Passwords con bcrypt cost ≥ 12
- [ ] JWT firmado con HS256 + `AUTH_SECRET` (NUNCA hardcoded)
- [ ] Cookie con `httpOnly`, `secure` (en prod), `sameSite=lax`
- [ ] Refresh token almacenado hasheado en DB
- [ ] CSRF token por sesión
- [ ] No se loguea password ni token
- [ ] Lockout tras 10 intentos fallidos
- [ ] Mensaje de error genérico ("credenciales inválidas", no "usuario no existe")
- [ ] Bloquea enumeración de usuarios
- [ ] MFA disponible (Fase 8)

## Out of scope

- UI de login (PORTAL/PANEL agent)
- Tabla de clientes contables (FOUND)
- Lógica de storage (FOUND/PANEL)

## Patrón de uso

```ts
// En un Route Handler
import { requireRole } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const session = await requireRole(req, ['contador', 'asistente']);
  if (!session) return new Response('Unauthorized', { status: 401 });

  // session.userId, session.installation, session.role disponibles
}
```
