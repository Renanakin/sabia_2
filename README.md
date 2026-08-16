# Sabia Contable — Plataforma por Empresa (MVP)

> **Plataforma web instalable** que conecta el trabajo del contador con la consulta del cliente final. Cada empresa cliente corre en su **propia instalación aislada** (BD, archivos, sesiones, dominio).

---

## 📊 Estado del proyecto

| Fase | Nombre | Estado | Reporte |
|---|---|---|---|
| **0** | Bootstrap (Next.js + TypeScript + Drizzle + Playwright) | ✅ | [fase-00](docs/REPORTES/fase-00.md) |
| **1** | Foundations (Docker + Postgres + Redis + Auth + Middleware) | ✅ | [fase-01](docs/REPORTES/fase-01.md) |
| **2** | Superadmin (UI login + dashboard + CRUD instalaciones) | ✅ | [fase-02](docs/REPORTES/fase-02.md) |
| **3** | Portal del cliente (storage + documentos + dashboard + descarga) | ✅ | [fase-03](docs/REPORTES/fase-03.md) |
| **4** | Panel contable (upload + workflow + publicación) | ✅ | [fase-04](docs/REPORTES/fase-04.md) |
| **E2E** | Ciclo end-to-end (30/30 tests pasando) | ✅ | commit `4ee9b35` |
| **5** | Storage hardening (ClamAV + versionado + retención) | ⏳ | pendiente |
| **6** | Notificaciones (Resend para publish/observed) | ⏳ | pendiente |
| **7** | Reportes + KPIs (PDF balances + dashboard analítico) | ⏳ | pendiente |
| **8** | Auditoría + MFA (TOTP + UI de audit log) | ⏳ | pendiente |
| **9** | Provisioning automatizado (PowerShell one-click) | ⏳ | pendiente |
| **10** | Observabilidad (Prometheus + Grafana + alertas) | ⏳ | pendiente |

> Plan completo con dependencias y estimaciones: [docs/ROADMAP_STAGING.md](docs/ROADMAP_STAGING.md)

---

## 🚀 Qué hace la plataforma hoy

### Tres superficies, un solo deploy

| Subdominio | Quién entra | Qué hace |
|---|---|---|
| `admin.sabiacontable.cl` | Superadmin | Crea y gestiona instalaciones de clientes |
| `panel.sabiacontable.cl` | Contador / Asistente | Sube, revisa y publica documentos |
| `<slug>.sabiacontable.cl` | Cliente final | Consulta y descarga sus documentos publicados |

En desarrollo local: `http://127.0.0.1:3010/admin/login`, `/contable/login`, `/portal/<slug>/login`.

### Flujo principal

1. **Superadmin** crea una nueva instalación → genera slug, BD, bucket, `panelApiToken`.
2. **Contador** sube un documento (PDF, máx 10 MB) → entra a la cola en `pending`.
3. **Contador/Asistente** cambia status: `pending → in_review → observed → approved → published`.
4. **Cliente** ve el documento en su portal, descarga con link firmado (expira en 5 min).

### Capacidades operativas ya implementadas

- **Autenticación completa**: bcrypt + JWT (HS256), cookies `httpOnly`+`secure`+`sameSite=lax`, doble submit CSRF
- **Rate limit + lockout**: 5 req / 5 min por IP+email, 30 min de lockout tras 10 fallos
- **Audit log**: `login_success/failed/locked`, `logout`, `refresh`, `upload`, `publish`, `download`
- **Almacenamiento**: MinIO/S3 con URLs firmadas (5 min), validación MIME + extensión + tamaño, hash SHA256 de integridad
- **Multi-tenancy**: cada instalación con su propio `AUTH_SECRET`, BD y bucket
- **Tests E2E**: 30/30 pasando contra el stack real (Playwright)
- **Headers de seguridad**: HSTS, X-Frame-Options, CSP estricta, etc. (vía nginx)

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL 16 (Drizzle ORM) |
| Cache / rate limit | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Auth | JWT firmado (jose) + bcrypt |
| Mailing | Resend (configurado, Fase 6 lo activa) |
| Anti-bot | Google reCAPTCHA v3 (configurado) |
| Reverse proxy | Nginx con TLS forzado |
| Containerización | Docker Compose |
| Tests | Playwright (E2E) |
| Linter | ESLint + Next config |

---

## ⚡ Quick start

### Requisitos

- Node.js 20+
- Docker Desktop
- npm

### Levantar el stack

```bash
# 1. Clonar
git clone https://github.com/Renanakin/sabia_2.git
cd sabia_2

# 2. Levantar servicios (Postgres, Redis, MinIO, Next.js, Nginx)
docker compose up -d

# 3. Esperar healthchecks (10-15 s)
docker compose ps

# 4. Migrar la BD
docker compose exec -T app npx tsx src/lib/db/migrate.ts

# 5. Sembrar datos de prueba (3 usuarios + 1 cliente + 5 documentos)
docker compose exec -T app npm run db:seed
```

### Acceder

- **App principal**: http://127.0.0.1:3010
- **Marketing**: http://127.0.0.1:3010/
- **Por subdominio** (vía nginx): http://admin.localhost, http://panel.localhost, http://dev.localhost

### Credenciales de desarrollo (seed)

| Rol | Email | Password |
|---|---|---|
| Superadmin | `admin@sabiacontable.cl` | `Admin123!` |
| Contador | `contador@sabiacontable.cl` | `Contador123!` |
| Cliente | `cliente@sabiacontable.cl` | `Cliente123!` |

> ⚠️ Solo para DEV. En producción, cada cliente tiene credenciales generadas al dar de alta su instalación.

### Tests

```bash
# Levantar el stack antes
docker compose up -d

# Correr E2E (30/30 debe pasar)
npm run test:e2e
```

---

## 📁 Estructura del proyecto

```
sabia_2/
├── docs/                          # Documentación del proyecto
│   ├── ORQUESTADOR.md             # Sistema de fases + 5 sub-agentes
│   ├── SISTEMA.md                 # Política de seguridad
│   ├── PRESENTACION_CLIENTE.md    # PDF comercial (13 págs)
│   ├── MANUAL_USUARIO.md          # Manual interno (15 págs)
│   ├── MANUAL_CLIENTE.md          # Manual del cliente (8 págs)
│   ├── ROADMAP_STAGING.md         # Plan para llevar a staging/prod
│   ├── REPORTES/                  # Reportes por fase
│   │   ├── TEMPLATE.md
│   │   ├── fase-00.md ... fase-04.md
│   └── agentes/                   # Specs de sub-agentes
│       ├── FOUND.md
│       ├── AUTH.md
│       ├── PORTAL.md
│       ├── PANEL.md
│       └── SEC.md
├── src/
│   ├── app/                       # Rutas Next.js (App Router)
│   │   ├── (admin)                # Panel superadmin
│   │   ├── contable/              # Panel contador
│   │   ├── portal/[slug]/         # Portal del cliente
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # login, logout, refresh, me
│   │   │   ├── admin/             # CRUD instalaciones
│   │   │   ├── contable/          # Docs + workflow
│   │   │   └── portal/            # Dashboard + downloads
│   │   ├── layout.tsx             # Layout raíz
│   │   ├── page.tsx               # Landing pública
│   │   └── middleware.ts          # Routing por subdominio
│   ├── lib/
│   │   ├── auth/                  # JWT, sesión, CSRF, rate limit
│   │   ├── db/                    # Drizzle schema + cliente
│   │   ├── storage/               # S3 client, signed URLs, upload
│   │   ├── http.ts
│   │   └── redis.ts
│   └── ...
├── tests/                         # Playwright E2E
├── scripts/
│   ├── seed.ts                    # Datos de prueba
│   ├── take-screenshots.js        # Captura para manuales
│   └── md-to-pdf.js               # Conversor MD → PDF
├── docker-compose.yml             # Postgres + Redis + MinIO + App + Nginx
├── nginx.conf                     # Reverse proxy + TLS + headers seguridad
├── drizzle.config.ts
└── package.json
```

---

## 📚 Documentación

### Para entender el proyecto
- **[docs/ORQUESTADOR.md](docs/ORQUESTADOR.md)** — Cómo se coordina el trabajo (5 sub-agentes)
- **[docs/SISTEMA.md](docs/SISTEMA.md)** — Política de seguridad
- **[docs/REPORTES/fase-NN.md](docs/REPORTES/)** — Qué se hizo en cada fase

### Para el cliente
- **[docs/PRESENTACION_CLIENTE.pdf](docs/PRESENTACION_CLIENTE.pdf)** — Presentación comercial (13 págs)
- **[docs/MANUAL_CLIENTE.pdf](docs/MANUAL_CLIENTE.pdf)** — Manual del cliente final

### Para el equipo interno
- **[docs/MANUAL_USUARIO.pdf](docs/MANUAL_USUARIO.pdf)** — Manual del personal de la firma
- **[docs/ROADMAP_STAGING.md](docs/ROADMAP_STAGING.md)** — Plan para llevar a staging

### Specs de sub-agentes
- [FOUND](docs/agentes/FOUND.md) · [AUTH](docs/agentes/AUTH.md) · [PORTAL](docs/agentes/PORTAL.md) · [PANEL](docs/agentes/PANEL.md) · [SEC](docs/agentes/SEC.md)

---

## 🎯 Hacia dónde va el proyecto

El MVP actual cubre el 80% del flujo principal. El plan completo está en [docs/ROADMAP_STAGING.md](docs/ROADMAP_STAGING.md). Resumen de la visión final:

### Visión de producto

- **Por cliente** (no por firma): cada empresa tiene su propia URL, BD, archivos, sesión. Un problema de un cliente no afecta a los demás.
- **Multi-firma**: una misma plataforma puede servir a varias firmas contables; cada una con sus superadmins y sus instalaciones.
- **Auditable por diseño**: cada acción queda registrada con actor, recurso, IP, user-agent y timestamp.
- **Fricción mínima**: el cliente solo abre un link, se loguea, y descarga. El contador solo arrastra un PDF y le da "publicar".

### Capacidades pendientes (Fases 5-11)

| # | Qué habilita | Impacto |
|---|---|---|
| 5 | Antivirus + versionado de archivos | Seguridad y cumplimiento normativo |
| 6 | Emails transaccionales (publish, observed) | Reduce "¿ya está listo el F29?" en 90% |
| 7 | Generación de PDF de balances + reportes | Diferenciador comercial clave |
| 8 | TOTP para admin/contador + UI de audit log | Cumplimiento SOC2-ready |
| 9 | Script PowerShell one-click de nueva instalación | Onboarding de clientes en minutos |
| 10 | Prometheus + Grafana | Operación sin sobresaltos |
| 11 | App móvil nativa | Notificaciones push al cliente |

### Decisiones de arquitectura ya tomadas (y por qué)

- **Next.js monolítico con route groups** vs. microfrontends: simplifica el deploy, mantiene el contexto de sesión compartido y permite reusar el middleware de subdominios.
- **Drizzle vs. Prisma**: tipado más cercano al SQL, sin generación de cliente en cada cambio, mejor para monorepo futuro.
- **MinIO vs. S3 directo**: paridad de API, pero corre on-prem, ideal para hosting nacional del cliente.
- **JWT en cookie + CSRF doble submit** vs. JWT en localStorage: previene XSS-token-theft y CSRF, es el estándar para SSR.
- **Una BD por instalación** vs. row-level multi-tenancy: aislamiento físico real, más simple de razonar y de migrar.

---

## 🧪 Estado de los tests

| Tipo | Cobertura | Estado |
|---|---|---|
| E2E (Playwright) | Login, rate limit, superadmin, panel, portal, storage | ✅ 30/30 |
| Unit | — | ⏳ pendiente (Fase 8+) |
| Integration | — | ⏳ pendiente (Fase 8+) |

Para correr los tests E2E:

```bash
docker compose up -d
npm run test:e2e
```

---

## 🤝 Contribuir

1. Crea una rama desde `main`: `git checkout -b feat/<descripcion-corta>`
2. Commits con [conventional commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, etc.
3. Antes de hacer PR:
   - `npm run lint` limpio
   - `npm run test:e2e` 30/30
   - Si agregaste una fase, escribir `docs/REPORTES/fase-NN.md` con el template
4. PR con descripción del cambio + screenshots si es UI

---

## 📞 Contacto

- **Repositorio**: https://github.com/Renanakin/sabia_2
- **Email**: contacto@sabiacontable.cl
- **Oficina**: Gran Avenida José Miguel Carrera 5234, Oficina 402, San Miguel, Región Metropolitana, Chile

---

**Stack actual:** Next.js 16 · PostgreSQL 16 · Redis 7 · MinIO · Docker · Playwright
**Licencia:** Privado (HackTeck © 2026)
