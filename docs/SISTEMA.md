# Seguridad — Sabia Contable MVP

> **Política:** CERO secretos en el repositorio. CERO endpoints inseguros. CERO permisos por defecto.

---

## 1. Principios rectores

1. **Defense in depth:** seguridad en capas (red, app, DB, storage, código).
2. **Least privilege:** cada usuario/rol accede solo a lo mínimo necesario.
3. **Stateless servers:** ninguna sesión en el proceso Next.js → escala horizontal segura.
4. **Aislamiento por instalación:** cada cliente de la firma = DB + storage + claves únicas.
5. **Trazabilidad total:** toda acción sensible va a `audit_log`.
6. **Secretos fuera del repo:** `.env*` NUNCA se commitea. Placeholders van en `.env.example`.

---

## 2. Secretos gestionados

| Secreto | Dónde se guarda en dev | Dónde se guarda en prod | Quién lo rota |
|---|---|---|---|
| `RESEND_API_KEY` | `.env.local` (no commiteado) | Gestor de secretos del VPS / Vercel env | Owner |
| `RECAPTCHA_SECRET_KEY` | `.env.local` (no commiteado) | Gestor de secretos | Owner |
| `AUTH_SECRET` (JWT) | `.env.local` | Gestor de secretos, **distinto por instalación** | Owner / script provisioning |
| `DATABASE_URL` | `.env.local` | docker-compose de la instalación, **distinto por instalación** | Owner / script provisioning |
| `STORAGE_*` (S3/MinIO) | `.env.local` | docker-compose, **distinto por instalación** | Owner / script provisioning |
| Token interno panel→portal | `installations.panel_api_token_hash` (Postgres) | Misma tabla, hasheado con bcrypt | Generado al provisionar |
| `installation_slug` | `INSTALLATION_SLUG` env + DNS | DNS wildcard + middleware | Provisioning |

**Reglas:**
- Cada `.env.example` (commiteado) lleva solo placeholders.
- Cada `.env.local` (NO commiteado) lleva los valores reales localmente.
- Cada instalación de cliente tiene valores únicos generados en provisioning.
- La rotación se documenta en `docs/REPORTES/`.

---

## 3. Checklist pre-commit (SEC agent)

Antes de CADA `git commit`, el agente SEC verifica:

```bash
# 1. Secretos
gitleaks detect --no-git --redact --verbose

# 2. Vulnerabilidades de dependencias
npm audit --omit=dev --audit-level=high
npm audit --omit=dev --json > reports/npm-audit.json

# 3. Archivos prohibidos
git status --porcelain | grep -E '\.env$|\.env\.local$|.*\.pem$|.*\.key$'
# Salida esperada: VACÍA

# 4. Lint + tipos
npm run lint
npx tsc --noEmit

# 5. Build
npm run build

# 6. Tests
npm run test:e2e
```

Si CUALQUIER paso falla, el commit se bloquea.

---

## 4. Headers de seguridad (Nginx / reverse proxy)

```nginx
# nginx.conf (esqueleto)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google.com/recaptcha/;" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

## 5. Autenticación y autorización

| Política | Implementación |
|---|---|
| Sesiones | JWT en cookie `httpOnly`, `secure`, `sameSite=lax` |
| Refresh tokens | Rotación con `refresh_tokens` table, `expires_at` + `revoked_at` |
| Passwords | bcrypt cost ≥ 12 |
| MFA | TOTP (otptoken) para `superadmin` y `contador` (Fase 8) |
| Rate limit | 5 req / 5 min por IP+email en `/api/auth/*` (Redis `INCR`) |
| Bloqueo de cuenta | Tras 10 intentos fallidos en 15 min, lockout 30 min |
| Logout | Invalida refresh token + limpia cookie |
| Idle timeout | 30 min de inactividad cierra sesión (rotación de refresh) |
| Absolute timeout | Refresh token expira a las 24 h (re-login obligatorio) |

---

## 6. Autorización por endpoint

**Regla de oro:** el cliente NUNCA ve un endpoint que permita consultar tablas crudas.

Endpoints del portal cliente (whitelist estricto):
```
GET  /api/portal/me
GET  /api/portal/dashboard
GET  /api/portal/documents
GET  /api/portal/documents/:id/download
GET  /api/portal/reports
GET  /api/portal/kpis
POST /api/portal/documents          (subir al contador)
POST /api/portal/messages           (consulta)
```

Cada handler:
1. Lee `client_id` de la **sesión** (nunca del request).
2. Filtra con `WHERE client_id = :session_client_id AND visible_to_client = true`.
3. Loguea la acción en `audit_log`.

---

## 7. Almacenamiento de archivos

- NUNCA rutas públicas permanentes.
- SIEMPRE URLs firmadas con expiración ≤ 5 minutos.
- SIEMPRE validar MIME real (no solo extensión).
- SIEMPRE guardar `file_hash` (sha256).
- SIEMPRE renombrar a UUID en storage (el nombre original va en DB).
- SIEMPRE escanear con ClamAV (cuando esté configurado) o al menos bloquear extensiones peligrosas (`.exe`, `.bat`, `.ps1`, `.sh`, `.js`).

---

## 8. Logs

```json
{
  "ts": "2026-08-12T23:18:25.123Z",
  "level": "info",
  "service": "sabiacontable",
  "installation": "cliente-a",
  "request_id": "req_abc123",
  "user_id": "uuid",
  "role": "cliente",
  "route": "GET /api/portal/documents",
  "status": 200,
  "duration_ms": 47,
  "msg": "documents listed"
}
```

**NUNCA** se loguea:
- `password`, `password_hash`
- `token`, `refresh_token`, `jwt`
- RUT completo (solo loguear últimos 4)
- Datos tributarios detallados
- Contenido de archivos

**Logs por instalación** se guardan en `var/log/sabiacontable/<installation>/`.

---

## 9. Protección CSRF

- Token CSRF por sesión, almacenado en cookie aparte (no httpOnly para que JS lo lea).
- TODO POST/PUT/PATCH/DELETE debe enviar el token en header `X-CSRF-Token`.
- Server valida: header == cookie, y token es del usuario autenticado.

---

## 10. Dependencias

- `npm audit` antes de cada release.
- Renovación automática con `dependabot` (cuando se configure).
- Pinning de versiones críticas en `package.json` (sin `^` para `next`, `react`, `drizzle`).
- Revisión manual de CHANGELOG de Next.js en cada update mayor.

---

## 11. Reporte de incidente

Si se detecta un incidente de seguridad:

1. **Contener** — deshabilitar instalación afectada, rotar secretos.
2. **Evaluar** — alcance: ¿qué se filtró? ¿a quién?
3. **Notificar** — owner + usuarios afectados (Resend).
4. **Remediar** — parche + tests que cubran el vector.
5. **Postmortem** — `docs/REPORTES/INCIDENT-YYYY-MM-DD.md`.

---

## 12. Out of scope MVP (pero en roadmap)

- WAF (Cloudflare Pro).
- Pen test externo profesional.
- SOC2 / ISO 27001.
- Bug bounty.

Estos son **post-MVP** y NO bloquean el lanzamiento inicial.
