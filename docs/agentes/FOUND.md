# FOUND agent — Infraestructura y base de datos

## Misión

Montar la base técnica del MVP: Docker Compose, PostgreSQL, Redis, MinIO, Drizzle ORM, esquema inicial, migraciones.

## Fases a cargo

- **Fase 1** — Foundations (DB + Auth base + Redis + Middleware)
- **Fase 5** — Storage + URLs firmadas
- **Fase 7** — Cache de KPIs
- **Fase 9** — Provisioning script PowerShell
- **Fase 10** — Observabilidad (métricas)

## Inputs del orquestador

- Propuesta integrada (ya en `docs/arquitectura_webapp_contable_por_empresa.md`)
- Lista de dependencias aprobadas
- Variables de entorno esperadas (definidas en `.env.example`)

## Outputs

- `docker-compose.yml` con servicios `app`, `worker`, `db`, `redis`, `minio`, `nginx`
- `drizzle.config.ts`
- `src/lib/db/schema.ts` con tablas base
- `src/lib/db/client.ts`
- Migraciones en `drizzle/`
- `src/middleware.ts` con ruteo por subdominio
- `scripts/dev-up.sh` (Linux/Mac) y `scripts/dev-up.ps1` (Windows)

## Definition of Done

- [ ] `docker compose up -d` levanta todos los servicios sin error
- [ ] `npm run db:migrate` aplica migraciones en limpio
- [ ] `npm run db:seed` inserta datos de prueba (1 instalación, 1 superadmin, 1 contador, 1 cliente)
- [ ] `npm run dev` arranca y sirve `http://localhost:3000`
- [ ] Visitar `cliente-a.localhost` resuelve al portal (con `/etc/hosts` configurado)
- [ ] `npm run build` exitoso
- [ ] Reporte de fase firmado

## Checklist de seguridad

- [ ] Postgres NO expone el puerto 5432 fuera de la red docker
- [ ] Redis NO expone el puerto 6379 fuera de la red docker
- [ ] MinIO NO expone el puerto 9000 fuera de la red docker (solo Nginx proxy)
- [ ] Usuario Postgres `sabia_user` SIN permisos de superusuario
- [ ] Usuario Postgres `sabia_migrator` separado, usado SOLO para migraciones
- [ ] Volume con `noexec` para Postgres data
- [ ] Healthchecks en todos los servicios

## Out of scope

- Lógica de negocio (delegada a otros agentes)
- UI (delegada a PORTAL/PANEL)
- Auth real (delegada a AUTH)

## Comandos típicos

```bash
# Levantar entorno
docker compose up -d

# Ver logs
docker compose logs -f app

# Migrar
docker run --rm --network sabia_default -v ${PWD}:/app -w /app node:20-alpine sh -c "npm install && npm run db:migrate"

# Seed
docker compose exec app npm run db:seed

# Bajar
docker compose down
```
