# Reporte de Fase 00 — Bootstrap del repositorio

> **Fecha:** 2026-08-13
> **Fase:** 00 (pre-MVP, fundación del repo)
> **Subagente principal:** FOUND
> **Subagentes de apoyo:** SEC
> **Rama:** `main`
> **Commits:**
> - `0928d0b` — chore(foundation): bootstrap sabia_2 MVP
> - `98daf6c` — ci: añadir workflow de seguridad + dependabot

---

## 1. Objetivo

Crear el repositorio `sabia_2` desde cero, trasladar el código del marketing actual sin secretos, sentar las bases del orquestador y configurar el baseline de seguridad para que cada push futuro pase por verificación automática.

---

## 2. Definition of Done

- [x] Repo `sabia_2` inicializado en GitHub
- [x] Código del marketing copiado (sin node_modules, sin .next, sin secretos)
- [x] `.env.local` neutralizado (sin claves reales)
- [x] `.env.example` con placeholders
- [x] `.gitignore` reforzado (cubre `.env*`, artefactos de build, scripts legacy)
- [x] Orquestador documentado en `docs/ORQUESTADOR.md`
- [x] 5 subagentes documentados en `docs/agentes/`
- [x] Política de seguridad en `docs/SISTEMA.md`
- [x] Plantilla de reporte en `docs/REPORTES/TEMPLATE.md`
- [x] CI configurado (lint + typecheck + audit + gitleaks + build)
- [x] Dependabot configurado (actualizaciones semanales)
- [x] Escaneo manual de secretos: 0 hallazgos
- [x] 2 commits pusheados a `origin/main`

---

## 3. Checklist de seguridad (SEC agent)

| Check | Resultado |
|---|---|
| `gitleaks` instalado | ❌ No disponible en el host — fallback grep usado |
| Escaneo manual de patrones (re_*, sk_*, AIza, AKIA, ghp_, xox*) | ✅ 0 hallazgos en `src/`, `public/`, `docs/` |
| `PENDING_RESTORE` fuera de `.env.local` | ✅ 0 hallazgos |
| Hardcoded `password=`/`secret=`/`token=` en código | ✅ 0 hallazgos |
| `.env.local` ignorado por git | ✅ `git check-ignore` confirma |
| `.env.example` commiteado | ✅ Staged y pusheado |
| Header CSP definido en nginx.conf | ⏸ Pendiente (Fase 1 con Docker) |
| `audit_log` schema | ⏸ Pendiente (Fase 1 con Drizzle) |
| Zod en Route Handlers | ⏸ Pendiente (rutas auth en Fase 1) |

**Veredicto:** ✅ APROBADO con observaciones para Fase 1.

---

## 4. Cambios realizados

### 4.1 Archivos nuevos (no provenientes del repo viejo)

**Documentación de gobernanza:**
- `docs/ORQUESTADOR.md` — sistema de orquestador + subagentes + fases
- `docs/SISTEMA.md` — política de seguridad completa
- `docs/REPORTES/TEMPLATE.md` — plantilla de reporte por fase
- `docs/agentes/FOUND.md` — spec del subagente de infra
- `docs/agentes/AUTH.md` — spec del subagente de auth
- `docs/agentes/PORTAL.md` — spec del subagente del portal cliente
- `docs/agentes/PANEL.md` — spec del subagente del panel contable
- `docs/agentes/SEC.md` — spec del subagente de seguridad

**Configuración de repo:**
- `.env.example` — placeholders para todas las claves esperadas
- `.gitignore` — reforzado (excluye scripts legacy `fix*.js`, cache de playwright, etc.)
- `.github/workflows/ci.yml` — CI pipeline (lint, typecheck, audit, gitleaks, build)
- `.github/dependabot.yml` — actualizaciones semanales de npm

### 4.2 Archivos modificados

- `G:\DESARROLLOS\sabiacontable\.env.local` — **NO copiado al nuevo repo**. Las claves reales siguen en el repo viejo, accesibles manualmente. El nuevo repo tiene un `.env.local` neutralizado con `PENDING_RESTORE`.

### 4.3 Archivos no copiados (decisión explícita)

| Archivo | Razón |
|---|---|
| `node_modules/` | Se regenera con `npm install` |
| `.next/` | Build artifact |
| `.kombai/` | IDE agent state |
| `_archivos_temporales/` | Basura temporal |
| `fix3.js` | Script de parche legacy one-off |
| `tsconfig.tsbuildinfo` | Build artifact |
| `public/calc_test.png` | Imagen de prueba |

---

## 5. Verificación manual realizada

1. ✅ `git init -b main` en `G:\DESARROLLOS\sabia_2`
2. ✅ `git remote add origin https://github.com/Renanakin/sabia_2.git`
3. ✅ `git add` selectivo de archivos (excluye `.env.local`)
4. ✅ `git status` confirma que `.env.local` no aparece en staged
5. ✅ Escaneo de secretos con `Select-String` sobre 4 patrones → 0 hits
6. ✅ `git commit` y `git push -u origin main` exitosos
7. ✅ Verificación post-push: commit en `origin/main` (`git ls-remote`)

---

## 6. Métricas

| Métrica | Valor |
|---|---|
| Archivos en repo | 102 |
| Commits pusheados | 2 |
| Líneas de código (sin docs) | ~14k |
| Líneas de docs nuevas | ~1.5k |
| Secretos en código | 0 |
| Vulnerabilidades en `npm audit` | Pendiente (Fase 1 corre CI) |

---

## 7. Decisiones técnicas

- **No crear `package-lock.json` regenerado:** se copió el original del repo viejo para mantener reproducibilidad exacta.
- **No instalar `gitleaks` localmente:** se usará la acción oficial de GitHub en CI. Si el usuario quiere correrlo local, debe instalarlo aparte.
- **`.env.local` neutralizado en vez de eliminado:** el archivo se mantiene con valores placeholder para que la estructura quede clara, pero las claves reales NO se commitean.
- **`pnpm-workspace.yaml` mantenido:** aunque el proyecto actual no es monorepo, lo dejamos por si más adelante se quiere separar webapp/api.

---

## 8. Problemas conocidos / Follow-ups

- [ ] **gitleaks local** — no instalado. Instalación opcional en Windows: `choco install gitleaks` o descargar binario. No bloqueante.
- [ ] **Caracteres mal decodificados en `Maestro_de_Implementación_...md`** — UTF-8/Latin-1. Se puede corregir con `Get-Content -Encoding UTF8` y reescribir. No bloqueante.
- [ ] **CI no se ha ejecutado todavía** — el primer push debería disparar el workflow. Se puede verificar en la pestaña "Actions" de GitHub.
- [ ] **Branch protection** — recomendado activar en GitHub: requerir CI verde para merge a `main`. Manual desde la UI.
- [ ] **Secretos del repo** — recomendable mover `RESEND_API_KEY` y `RECAPTCHA_SECRET_KEY` a GitHub Secrets si se quiere correr el build real en CI. Por ahora CI usa `dummy`.

---

## 9. Próximo paso — Fase 1 (Foundations)

Cuando el usuario apruebe, el siguiente commit será:

**Fase 1: Foundations (DB + Auth + Redis + Middleware)**
- `docker-compose.yml` con `app`, `db`, `redis`, `minio`, `nginx`
- `drizzle.config.ts` + `src/lib/db/schema.ts` (tablas `users`, `refresh_tokens`, `installations`, `accounting_clients`, `user_client_access`)
- `src/lib/auth/*` (JWT, bcrypt, sesión)
- `src/middleware.ts` (ruteo por subdominio)
- `src/app/api/auth/*` (login, logout, refresh, me)
- Tests E2E de los happy paths de auth
- Reporte en `docs/REPORTES/fase-01.md`
- Commit `feat(foundation): docker + db + auth base`

**Subagentes:** FOUND (docker + schema), AUTH (auth flow), SEC (verificación).

---

## 10. Aprobación

- [x] Orquestador verificó DoD
- [x] SEC agent verificó checklist de seguridad (con fallback grep)
- [x] 2 commits pusheados a `origin/main`
- [ ] **Usuario aprobó manualmente** ← esperando

**Firma del orquestador:** Mavis (mvs_4e5ffd94d009499fb20cdd85a132eda3)
**Fecha:** 2026-08-13
