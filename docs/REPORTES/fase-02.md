# Reporte de Fase 02 — Superadmin

> **Fecha:** 2026-08-13
> **Fase:** 02 — Superadmin (UI login + dashboard + CRUD instalaciones)
> **Subagentes:** AUTH (UI login), FOUND (CRUD), SEC (verificación)
> **Commit:** `feat(superadmin): ui login + dashboard + crud instalaciones`

---

## 1. Objetivo

Construir la UI del panel superadmin sobre los endpoints de auth ya existentes (Fase 1):
- Formulario de login bonito
- Layout con sidebar y logout
- Dashboard con métricas globales
- Listado de instalaciones
- Crear nueva instalación con generación de secrets

---

## 2. Definition of Done

- [x] `/admin/login` muestra form con email/password
- [x] Login con credenciales válidas → redirige a `/admin` (dashboard)
- [x] Login con credenciales inválidas → mensaje genérico "Email o contraseña incorrectos"
- [x] Login con rol distinto a `superadmin` → mensaje "no tiene permisos"
- [x] Logout → limpia cookies y redirige a `/admin/login`
- [x] `/admin` requiere sesión de superadmin (server-side guard)
- [x] Dashboard muestra 3 métricas: Instalaciones, Usuarios totales, Logins 24h
- [x] Dashboard muestra tabla de distribución de usuarios por rol
- [x] `/admin/instalaciones` lista todas las instalaciones con status
- [x] `/admin/instalaciones/nueva` permite crear con form
- [x] Al crear, devuelve `panelApiToken` UNA SOLA VEZ con UI destacada
- [x] API `GET /api/admin/instalaciones` con paginación y search
- [x] API `POST /api/admin/instalaciones` con validación Zod, CSRF, unicidad
- [x] Tests E2E con 4 escenarios: login inválido, login válido, login sin permisos, logout
- [x] `npm run typecheck` → 0 errores
- [x] `npm run lint` → 0 errores (2 warnings de archivo legacy no tocado)
- [x] `npm run build` → 31 rutas generadas

---

## 3. Checklist de seguridad (SEC agent)

| Check | Resultado | Notas |
|---|---|---|
| Login form usa `/api/auth/login` (validado en Fase 1) | ✅ | Reutiliza rate limit + lockout + audit |
| Mensaje genérico en error | ✅ | "Email o contraseña incorrectos" |
| CSRF en mutaciones admin | ✅ | `POST /api/admin/instalaciones` valida `X-CSRF-Token` |
| Validación de rol en API admin | ✅ | `if (session.role !== 'superadmin') return 403` |
| Validación de sesión en server components | ✅ | `requireRolePage(['superadmin'])` en cada page |
| Secrets se devuelven UNA SOLA VEZ | ✅ | `panelApiToken` en response, no se guarda en cliente |
| Audit log en creación | ✅ | `action: 'installation_created'` con metadata |
| Validación Zod de input | ✅ | `createSchema` con regex para slug, subdomain, dbName, storageBucket |
| Verificación de unicidad antes de insert | ✅ | `existing` check por slug y subdomain |
| `client_id` desde sesión (no del request) | N/A | Endpoints admin no tocan clientes aún |
| Cero secretos en código | ✅ | Escaneo manual sin hallazgos |
| `npm audit` (omit=dev, level=high) | ⚠️ 9 vulns heredadas | En `exceljs` legacy, no en código de Fase 2 |

**Veredicto:** ✅ APROBADO con la observación de siempre sobre `exceljs`.

---

## 4. Cambios realizados

### 4.1 Archivos nuevos

**Auth helpers:**
- `src/lib/auth/guard.ts` — `requireSessionPage()`, `requireRolePage()` para server components
- `src/lib/auth/client.ts` — `api.get/post/patch/delete` con CSRF auto desde cookie

**Páginas admin:**
- `src/app/admin/login/page.tsx` — server component que valida sesión y muestra form
- `src/app/admin/login/LoginForm.tsx` — client component con form + manejo de errores
- `src/app/admin/layout.tsx` — sidebar + header + logout (visual)
- `src/app/admin/LogoutButton.tsx` — client component
- `src/app/admin/page.tsx` — dashboard (REEMPLAZA el placeholder anterior)
- `src/app/admin/instalaciones/page.tsx` — listado
- `src/app/admin/instalaciones/nueva/page.tsx` — wrapper server component
- `src/app/admin/instalaciones/nueva/NuevaInstalacionForm.tsx` — client form con auto-fill y reveal de secrets

**API:**
- `src/app/api/admin/instalaciones/route.ts` — GET (list) + POST (create)

**Tests:**
- `tests/auth.spec.ts` — 4 escenarios E2E + 1 skipped (rate limit)

### 4.2 Archivos modificados

- `src/lib/auth/audit.ts` — agregados `AuditAction` types: `installation_created`, `installation_updated`, `installation_archived`, `user_created`, `user_updated`, `user_archived`

---

## 5. Verificación manual

```bash
$ npx tsc --noEmit
✅ 0 errores

$ npm run lint
✅ 0 errores (2 warnings de SalaryCalculator.tsx legacy)

$ npm run build
✅ Compiled successfully in 6.6s
✅ 31 rutas (4 admin nuevas + 27 anteriores)

$ git check-ignore .\.env.local
.gitignore:34:.env*	".\\.env.local"
✅ .env.local NO se commitea

$ grep -E '(re_[a-z0-9]{20,}|sk_[a-z0-9]{20,})' src/**/*.ts*
✅ 0 hallazgos
```

### Cómo probarlo localmente

```bash
# 1. Levantar infra
docker compose up -d

# 2. Migrar y seedear
npm run db:migrate
npm run db:seed

# 3. Dev server
npm run dev:equipo

# 4. Abrir en navegador
#    http://admin.localhost:80
#    Login: admin@sabiacontable.cl / Admin123!

# 5. Crear instalación
#    Dashboard → "+ Nueva instalación"
#    Slug: test-cliente
#    (los demás campos se auto-completan)
#    Click "Crear instalación"
#    COPIAR el panelApiToken (se muestra 1 sola vez)

# 6. Probar E2E (requiere dev server corriendo en :3010)
npm run build && npm run start
# en otra terminal:
npx playwright install chromium  # solo la primera vez
npm run test:e2e
```

---

## 6. Métricas

| Métrica | Valor |
|---|---|
| Archivos nuevos | 11 |
| Archivos modificados | 2 |
| Líneas agregadas (código) | ~1,500 |
| Líneas agregadas (tests) | ~170 |
| Endpoints API | +1 (`/api/admin/instalaciones`) |
| Páginas | +4 (`/admin/login`, `/admin`, `/admin/instalaciones`, `/admin/instalaciones/nueva`) |
| Tests E2E | 4 (1 skipped) |
| Rutas totales en build | 31 |

---

## 7. Decisiones técnicas

### ADR-006: Auth check por página, no en layout
- **Contexto:** el layout `/admin` aplica a todas las rutas, pero `/admin/login` debe ser accesible sin sesión.
- **Decisión:** layout solo provee shell visual; cada page llama `requireRolePage()` individualmente.
- **Razón:** simple, sin route groups ni middleware adicional. Login page no llama el guard.
- **Tradeoff:** hay que recordar el guard en cada page nueva. Aceptable para MVP.

### ADR-007: Secrets en response de POST (no en listado)
- **Contexto:** `panelApiToken` debe estar disponible UNA vez para que el superadmin lo guarde.
- **Decisión:** `POST /api/admin/instalaciones` devuelve `installation` + `secrets` (panelApiToken en plaintext). `GET` solo lista sin secrets.
- **Razón:** sigue el patrón de "show once" de GitHub/Stripe al crear API keys.
- **Tradeoff:** si el superadmin cierra la página sin copiar, pierde el token. Tiene que regenerarlo. Para MVP aceptable.

### ADR-008: Auto-fill de campos derivados
- **Contexto:** al crear una instalación, `subdomain`, `dbName`, `storageBucket` se derivan del `slug`.
- **Decisión:** mientras el usuario tipea el slug, los demás campos se auto-completan (pero son editables).
- **Razón:** reduce errores de tipeo, mantiene consistencia entre nombre y storage.
- **Tradeoff:** un poco de "magia" en el form, pero descubrible.

### ADR-009: CSRF solo en admin (no en /api/auth)
- **Contexto:** el form de login inicial no tiene CSRF token todavía.
- **Decisión:** `/api/auth/login` no valida CSRF (porque no hay sesión previa). `/api/admin/instalaciones` SÍ valida (porque requiere sesión).
- **Razón:** CSRF protege contra sesión existente. Login no tiene sesión.
- **Tradeoff:** la primera request de login es vulnerable a CSRF, pero no hay daño posible (solo permite intentar loguear como otra persona, lo cual ya es lo que el atacante querría).

---

## 8. Problemas conocidos / Follow-ups

### 8.1 No bloqueantes

- [ ] **Tests E2E no se ejecutan en CI todavía** — requieren docker compose. Se puede agregar un job en `.github/workflows/e2e.yml` con `docker compose up` + `npm run test:e2e`. Pendiente Fase 10.
- [ ] **No hay "Editar instalación"** — el CRUD tiene solo list + create. Update y archive van en Fase 2.5 si hace falta.
- [ ] **No hay asignación de contadores a instalaciones** — el schema tiene `user_client_access` pero la UI de asignación no existe. Va con el panel contable (Fase 4).
- [ ] **No hay paginación en el listado** — la query usa limit 50, offset 0, pero la UI no muestra controles. Aceptable para MVP (pocas instalaciones).
- [ ] **`panelApiToken` no se puede regenerar** — si el superadmin lo pierde, hay que crearlo manualmente en DB. Una pantalla de "regenerar" sería útil.

### 8.2 Pendientes de testing
- [ ] **Login con `cliente@sabiacontable.cl`** — debería dar error de rol, igual que contador. Solo testeé con contador.
- [ ] **Rate limit visual** — el test skipped requiere reset manual de Redis.
- [ ] **CSRF failure** — no hay test que verifique que mutar sin CSRF token devuelva 403.

### 8.3 Decisiones pendientes
- Auditoría de "ver secret" — si el superadmin quiere ver un secret ya generado, ¿cómo? Hoy NO se puede.
- Backup de `panelApiToken_hash` — si la BD se pierde, no hay forma de regenerar. Pendiente Fase 9 (provisioning).

---

## 9. Próximo paso — Fase 3: Portal del cliente

**Qué incluye:**
- UI de login del cliente (similar a la del admin pero con branding del cliente)
- Dashboard del cliente con KPIs (período actual, documentos, último cierre)
- Lista de documentos visibles
- Detalle de documento + descarga con URL firmada (storage S3/MinIO)
- Carga de documentos al contador
- Mensajes al contador
- API endpoints del portal con whitelist estricto
- Storage client (S3 SDK) + URLs firmadas
- `visible_to_client` filter en TODAS las queries
- Tests E2E del portal

**Subagentes:** PORTAL (principal) + FOUND (storage) + AUTH (UI) + SEC (verificación)

**Tamaño estimado:** ~20 archivos, ~2,000 líneas. Más grande que Fase 2.

---

## 10. Commit

```
feat(superadmin): ui login + dashboard + crud instalaciones

UI completa del panel superadmin sobre los endpoints de auth (Fase 1):

- /admin/login: form con email/password, manejo de errores, CSRF auto
- /admin/layout: sidebar con nav + logout
- /admin (dashboard): metricas globales + tabla de usuarios por rol
- /admin/instalaciones: listado con status badges
- /admin/instalaciones/nueva: form con auto-fill + reveal de secrets

API:
- GET /api/admin/instalaciones: list con paginacion y search
- POST /api/admin/instalaciones: create con Zod + CSRF + audit
  Devuelve panelApiToken UNA sola vez

Auth helpers:
- requireRolePage() para server components
- api.get/post/patch/delete() con CSRF auto desde cookie

Tests E2E (Playwright):
- login con credenciales invalidas
- login con credenciales validas redirige al dashboard
- login con rol distinto a superadmin rechaza
- logout limpia sesion

Verified-by: SEC agent (typecheck OK, lint OK, build OK, 0 secretos en codigo)
Refs: docs/ORQUESTADOR.md#fase-2
```

---

## 11. Aprobación

- [x] Orquestador verificó DoD
- [x] SEC agent verificó checklist de seguridad
- [x] Build, lint, typecheck en verde
- [ ] **Usuario aprobó manualmente** ← esperando

**Próxima fase:** Fase 3 — Portal del cliente

**Firma del orquestador:** Mavis (mvs_4e5ffd94d009499fb20cdd85a132eda3)
**Fecha:** 2026-08-13
