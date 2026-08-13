# Orquestador y Subagentes — Sabia Contable MVP

> **Versión:** 1.0
> **Fecha:** 2026-08-12
> **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind v4 + PostgreSQL 16 + Redis 7 + S3/MinIO + BullMQ

---

## 1. Filosofía

El desarrollo del MVP se ejecuta por **fases discretas**, cada una con:

- **Un objetivo verificable** (Definition of Done).
- **Un subagente principal** responsable del entregable.
- **Subagentes de apoyo** cuando la fase cruza dominios.
- **Un reporte firmado** al final (en `docs/REPORTES/`).
- **Un commit semántico** al final.

**El orquestador (yo, Mavis) NO escribe todo el código.** Delega a subagentes especializados, verifica sus entregables contra checklists, escribe el reporte y commitea.

---

## 2. Topología

```
                         ┌─────────────────────────┐
                         │     ORQUESTADOR         │
                         │     (Mavis / root)      │
                         │                         │
                         │  - Lee PROPUESTA        │
                         │  - Planifica fases      │
                         │  - Delega a subagentes  │
                         │  - Verifica DoD         │
                         │  - Escribe reporte      │
                         │  - Commitea             │
                         └────────────┬────────────┘
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │  FOUND  │   │  AUTH   │   │  PORTAL │   │  PANEL  │   │   SEC   │
   │  agent  │   │  agent  │   │  agent  │   │  agent  │   │  agent  │
   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
        │             │             │             │             │
     Docker,       Auth.js,      Portal       Panel          gitleaks,
     Drizzle,      JWT,          cliente,     contable,      secret
     schema,       RBAC,         descarga     publicación,   scan, npm
     redis,        refresh,      segura,      docs, F29,     audit, OWASP
     minio         MFA           KPIs         storage
```

---

## 3. Subagentes — Misiones y alcance

Cada subagente tiene un archivo de spec en `docs/agentes/<nombre>.md` con:

- **Misión** (qué problema resuelve).
- **Inputs** (qué recibe del orquestador).
- **Outputs** (qué entrega, en qué formato).
- **Definition of Done** (criterios verificables).
- **Checklist de seguridad** (qué DEBE cumplir).
- **Out of scope** (qué NO hace, para no pisarse con otros).

### 3.1 FOUND (Infraestructura y base de datos)

- **Misión:** montar la base técnica (Docker, Postgres, Redis, MinIO, Drizzle, schema inicial).
- **Fases a cargo:** 1, 5, 7 (storage), 9 (provisioning), 10 (observabilidad).
- **Output típico:** `docker-compose.yml`, `drizzle.config.ts`, `src/lib/db/schema.ts`, migraciones.

### 3.2 AUTH (Autenticación y autorización)

- **Misión:** toda la capa de identidad y permisos.
- **Fases a cargo:** 1 (tabla `users`, `refresh_tokens`), 2 (superadmin), 8 (MFA).
- **Output típico:** `src/lib/auth/*`, `middleware.ts`, `src/app/api/auth/*`.
- **Garantía:** NUNCA contraseñas en texto plano, NUNCA tokens en localStorage, SIEMPRE cookies httpOnly.

### 3.3 PORTAL (Portal del cliente)

- **Misión:** la UI de solo-lectura donde el cliente consulta sus datos.
- **Fases a cargo:** 3 (portal MVP).
- **Output típico:** `src/app/(portal)/**`, `src/app/api/portal/**`.
- **Garantía:** NUNCA expone tablas crudas, SIEMPRE filtra por `visible_to_client = true`, NUNCA confía en `client_id` del cliente.

### 3.4 PANEL (Panel contable)

- **Misión:** la UI donde contadores y asistentes cargan, revisan y publican información.
- **Fases a cargo:** 4 (panel MVP), 6 (notificaciones), 7 (reportes + KPIs).
- **Output típico:** `src/app/(contable)/**`, `src/app/api/contable/**`, `src/lib/queue/jobs.ts`.
- **Garantía:** toda escritura pasa por el workflow `pending → in_review → approved → published`, NUNCA publica sin `audit_log`.

### 3.5 SEC (Seguridad y auditoría)

- **Misión:** transversal. Verifica que cada entregable cumple el baseline de seguridad.
- **Fases a cargo:** TODAS (interviene en cada commit).
- **Output típico:** `docs/SECURITY.md`, reporte de `gitleaks`, `npm audit --omit=dev`, matriz de roles.
- **Garantía:** NINGÚN commit pasa sin su OK.

---

## 4. Fases y mapeo a subagentes

| Fase | Nombre | Sub principal | Apoyo | Commit pattern |
|---|---|---|---|---|
| 0 | Marketing actual | — | — | (ya hecho en repo viejo) |
| 1 | Foundations (DB + Auth + Redis + Middleware) | FOUND | AUTH, SEC | `chore(foundation): ...` |
| 2 | Superadmin mínimo | AUTH | FOUND, SEC | `feat(superadmin): ...` |
| 3 | Portal cliente (MVP) | PORTAL | AUTH, SEC | `feat(portal): ...` |
| 4 | Panel contable (MVP) | PANEL | AUTH, SEC | `feat(panel): ...` |
| 5 | Storage + URLs firmadas | FOUND | PANEL, SEC | `feat(storage): ...` |
| 6 | Notificaciones (Resend) | PANEL | SEC | `feat(notifications): ...` |
| 7 | Reportes + KPIs | PANEL | FOUND | `feat(reports): ...` |
| 8 | Auditoría + MFA | AUTH | SEC | `feat(audit-mfa): ...` |
| 9 | Provisioning script | FOUND | SEC | `chore(provisioning): ...` |
| 10 | Observabilidad | SEC | FOUND | `feat(observability): ...` |

Cada fase sigue el mismo ritual (siguiente sección).

---

## 5. Ritual por fase

```
1. PLAN          Orquestador lee propuesta + fase, define DoD concreto
                 ↓
2. DELEGAR       Se asigna subagente principal + apoyo
                 ↓
3. EJECUTAR      Subagente implementa, hace tests locales
                 ↓
4. VERIFICAR     Orquestador corre checklist (DoD + seguridad + lint + tests)
                 ↓
5. REPORTAR      Orquestador escribe docs/REPORTES/fase-NN.md
                 ↓
6. COMMIT        git add + commit semántico
                 ↓
7. CHECKPOINT    Pausa. Espera "ok, sigue" del usuario
                 ↓
8. AVANZAR       Siguiente fase
```

**El orquestador NUNCA avanza a la fase N+1 sin OK explícito.**

---

## 6. Convenciones de commit

Basado en Conventional Commits + scope por subagente:

```
<type>(<scope>): <descripción corta>

<cuerpo explicando el por qué>

Refs: docs/PROPUESTA.md#fase-N
Verified-by: SEC agent (link al reporte)
```

**Tipos permitidos:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `security`.
**Scopes permitidos:** `foundation`, `auth`, `superadmin`, `portal`, `panel`, `storage`, `notifications`, `reports`, `audit-mfa`, `provisioning`, `observability`, `deps`.

**Reglas:**
- NUNCA `--force` a `main`/`master`.
- NUNCA commit sin pasar por `SEC agent`.
- SIEMPRE firmar con el reporte en el cuerpo o referencia.

---

## 7. Criterios globales de aceptación (para TODA fase)

Estos se aplican a cualquier entregable, sin importar la fase:

### 7.1 Seguridad
- [ ] `gitleaks detect --no-git` → 0 hallazgos
- [ ] `npm audit --omit=dev --audit-level=high` → 0 vulnerabilidades altas
- [ ] `.env*` cubierto por `.gitignore` (verificado)
- [ ] No hay `console.log(password|token|secret)` en código de producción
- [ ] Inputs validados con Zod en TODO Route Handler
- [ ] CSRF protection en POST/PUT/DELETE (token en cookie + header)
- [ ] Rate limit en `/api/auth/*` (5 req / 5 min por IP+email)
- [ ] MFA disponible para roles `superadmin` y `contador` (Fase 8)

### 7.2 Calidad
- [ ] `npm run lint` → 0 errores
- [ ] `npm run build` → éxito
- [ ] `npm run test:e2e` → verde (si hay tests)
- [ ] No hay `any` salvo justificación explícita en comentario
- [ ] No hay archivos > 400 líneas (refactor sugerido)

### 7.3 Trazabilidad
- [ ] Cada commit referencia la fase (`Refs: docs/ORQUESTADOR.md#fase-N`)
- [ ] Cada commit tiene reporte en `docs/REPORTES/fase-NN.md`
- [ ] `audit_log` registra acciones sensibles (login, publish, download)

### 7.4 Aislamiento (multi-install)
- [ ] Cero endpoints genéricos tipo `GET /api/database?table=...`
- [ ] `client_id` siempre se obtiene de la sesión, nunca del request
- [ ] Token por instalación distinto entre clientes
- [ ] Storage bucket separado por instalación
- [ ] Logs llevan `installation` como campo obligatorio

---

## 8. Comandos rápidos del orquestador

```bash
# Estado del proyecto
git log --oneline -20
git status

# Verificar seguridad antes de cualquier commit
gitleaks detect --no-git
npm audit --omit=dev --audit-level=high

# Lint + typecheck + build
npm run lint
npx tsc --noEmit
npm run build

# Tests
npm run test:e2e

# Levantar entorno local completo
docker compose up -d
npm run dev
```

---

## 9. Plantilla de reporte por fase

Ver `docs/REPORTES/TEMPLATE.md`.

---

## 10. Out of scope del MVP

Para no perder foco:

- ❌ Multi-tenancy (cada cliente = instalación propia, ya decidido).
- ❌ Integración real con SII (F29, F22): se hace mock en MVP, integración real es Fase post-MVP.
- ❌ Conciliación bancaria automatizada.
- ❌ App móvil nativa.
- ❌ Facturación electrónica (esto es producto paralelo, no MVP).
- ❌ Multi-idioma (MVP solo en español chileno).

---

## 11. Cambio de plan o pivote

Si en cualquier fase se descubre que el plan no funciona:

1. Orquestador escribe `docs/REPORTES/PIVOTE-fase-NN.md` con el por qué.
2. Se ajusta la propuesta (commit `docs(proposal): ...`).
3. NUNCA se avanza sin OK del usuario.
