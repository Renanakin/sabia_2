# Roadmap a Staging y Producción

> Plan operativo para llevar el MVP desde el estado actual (DEV local con docker compose) hasta un servicio en **staging** (entorno espejo de producción) y luego a **producción** con el primer cliente real.
>
> Fechas objetivo se llenan al iniciar cada fase. Las estimaciones asumen un dev a tiempo completo en un VPS Ubuntu recién provisionado.

---

## Estado actual (línea base)

| Aspecto | Estado |
|---|---|
| Código | 4 fases del MVP completas (F0-F4) + 30/30 E2E pasando |
| Stack | Docker Compose local con app + Postgres + Redis + MinIO + Nginx |
| Datos | Seed con 3 usuarios (`admin@`, `contador@`, `cliente@sabiacontable.cl`) y 5 documentos de prueba |
| Auth secret | `build_dummy_secret_must_be_at_least_32_characters_long_xxxx` (DUMMY) |
| BD password | `sabia_dev_password_change_me` (DUMMY) |
| reCAPTCHA | `build_dummy_key` (DUMMY) |
| Resend | Configurado pero sin usar todavía |
| TLS | Solo self-signed en local, sin certs reales |
| DNS | No configurado |
| CI/CD | Workflow de CI básico (lint + build), sin deploy |
| Backups | No existen |
| Monitoring | No existe |
| Repo | `https://github.com/Renanakin/sabia_2` (público, con `.env.local` ignorado) |

---

## Visión de las fases

```
S0  Hardening de secretos
 │
S1  Infraestructura staging (VPS + DNS + firewall + SSH)
 │
S2  Deploy del stack en staging
 │
S3  CI/CD con deploy automático
 │
S4  Observabilidad (logs + métricas + alertas)
 │
S5  Backups y disaster recovery
 │
S6  QA de aceptación (smoke + carga + seguridad)
 │
S7  Hardening pre-prod
 │
S8  Onboarding del primer cliente real
 │
S9  Go-live
 │
S10 Operación continua
```

Estimación total: **6-8 semanas** para llegar a go-live con el primer cliente, asumiendo 1 dev a tiempo completo.

---

## S0 — Hardening de secretos y configuración

**Objetivo:** sacar todos los secretos dummy del flujo y dejarlos gestionados de forma segura.

**Tiempo estimado:** 1 día

### Tareas

- [ ] Generar `AUTH_SECRET` real (32+ chars random) por ambiente — usar `openssl rand -base64 48`
- [ ] Generar `POSTGRES_PASSWORD` real (32+ chars) por ambiente
- [ ] Configurar reCAPTCHA real (clave de producción en Google Cloud Console)
- [ ] Configurar Resend con dominio verificado (`sabiacontable.cl`) y API key real
- [ ] Verificar `.gitignore` cubre todos los `.env*` (excepto `.env.example`)
- [ ] Crear `.env.example` con valores de placeholder, sin secretos reales
- [ ] Auditar git history: ¿se commiteó alguna vez un secreto? Si sí, rotarlo y purgar
- [ ] Documentar política de rotación de secretos (cada 90 días)

### Entregables

- `docs/SECRETS.md` con el inventario de secretos y dónde se almacenan
- `.env.example` con placeholders (en repo)
- 1Password / Bitwarden / Vault con todos los secretos reales

### Criterio de salida

- `git grep -E "build_dummy|change_me|password.*=.*$"` no retorna nada
- Todos los secretos están en el gestor, no en archivos locales
- Política de rotación documentada

---

## S1 — Infraestructura de staging

**Objetivo:** tener un servidor Ubuntu limpio, accesible, con firewall, DNS y SSH seguros.

**Tiempo estimado:** 1-2 días

### Tareas

- [ ] Elegir proveedor (recomendado: VPS en región Chile para baja latencia — ver [S1.1](#s11-proveedor-vps))
- [ ] Crear instancia: Ubuntu 24.04 LTS, 2 vCPU, 4 GB RAM, 80 GB SSD mínimo
- [ ] Configurar DNS en el registrador del dominio `sabiacontable.cl`:
  - `admin.sabiacontable.cl` → IP pública del VPS
  - `panel.sabiacontable.cl` → IP pública del VPS
  - `*.sabiacontable.cl` (wildcard) → IP pública del VPS
- [ ] Configurar firewall (`ufw`):
  - Permitir 22/tcp (SSH), 80/tcp (HTTP→redirect HTTPS), 443/tcp (HTTPS)
  - Denegar todo lo demás
  - Logging habilitado
- [ ] Crear usuario no-root `sabia` con `sudo` limitado a comandos específicos
- [ ] Instalar Docker Engine + Docker Compose plugin
- [ ] Configurar SSH:
  - Solo clave ed25519 (desactivar password auth)
  - Cambiar puerto 22 → puerto alto (ej. 5022) para reducir ruido
  - Fail2ban instalado
- [ ] Configurar NTP (chrony) para timestamps consistentes
- [ ] Configurar `unattended-upgrades` para parches de seguridad automáticos
- [ ] Configurar backups del servidor mismo (snapshots semanales)

### S1.1 — Proveedor VPS

| Proveedor | Región | Precio aprox./mes | Notas |
|---|---|---|---|
| DigitalOcean | SFO3 / NYC | USD 24 | Sencillo, buena doc |
| Vultr | Santiago (si disponible) | USD 24 | Baja latencia a Chile |
| Linode | Fremont | USD 24 | Buen balance |
| Hetzner | FSN1 | EUR 8 | Muy barato, datacenter en Alemania |
| AWS Lightsail | us-west-2 | USD 20 | Si ya hay cuenta AWS |

> **Recomendado:** Vultr o DigitalOcean con datacenter en SFO/Chile para latencia <50 ms a usuarios chilenos.

### Entregables

- Servidor accesible por SSH con clave
- DNS propagado (verificar con `dig admin.sabiacontable.cl`)
- UFW activo
- Docker funcionando

### Criterio de salida

- `ssh sabia@staging.sabiacontable.cl` funciona con clave
- `docker ps` funciona sin sudo
- `curl -I https://admin.sabiacontable.cl` resuelve al servidor (aunque devuelva error porque aún no hay app)

---

## S2 — Deploy del stack en staging

**Objetivo:** la app corriendo en staging, con los 3 roles autenticando y datos seedeados.

**Tiempo estimado:** 1 día

### Tareas

- [ ] Clonar repo: `git clone https://github.com/Renanakin/sabia_2.git /opt/sabia`
- [ ] Crear `/opt/sabia/.env.staging` con valores reales (generados en S0)
- [ ] Verificar que el `docker-compose.yml` referencia las variables correctas
- [ ] Levantar: `cd /opt/sabia && docker compose --env-file .env.staging up -d`
- [ ] Esperar healthchecks (ver `docker compose ps`)
- [ ] Correr migraciones: `docker compose exec -T app npx tsx src/lib/db/migrate.ts`
- [ ] Seed con datos de staging (pueden ser los mismos del dev, con passwords diferentes a las reales — ver S7)
- [ ] Configurar TLS real con **Let's Encrypt** (certbot en el host, montado en nginx del compose)
- [ ] Verificar que nginx fuerza HTTPS y los headers de seguridad están activos
- [ ] Probar login de los 3 roles desde un navegador externo
- [ ] Configurar reinicio automático del stack en reboot del servidor (`systemd` unit o `restart: always`)

### Entregables

- App accesible en `https://admin.sabiacontable.cl`, `https://panel.sabiacontable.cl`, `https://dev.sabiacontable.cl`
- Logs accesibles vía `docker compose logs -f`
- Datos seedeados

### Criterio de salida

- Login OK con los 3 roles desde un navegador externo
- HTTPS válido (no self-signed)
- `restart: always` configurado en compose
- Cabeceras de seguridad presentes (verificar con `curl -I https://...`)

---

## S3 — CI/CD

**Objetivo:** cada merge a `main` se deploya solo a staging. Cada PR corre los tests E2E antes de poder mergear.

**Tiempo estimado:** 2-3 días

### Tareas

- [ ] Configurar branch protection en GitHub: `main` requiere PR + 1 review + E2E verde
- [ ] Crear self-hosted runner en el VPS staging (o usar GitHub-hosted para tests)
- [ ] Workflow `.github/workflows/ci.yml` (ya existe, expandir):
  - Lint
  - Type check
  - Tests E2E contra un stack efímero
  - Build de producción (verificar que compila)
- [ ] Workflow `.github/workflows/deploy-staging.yml`:
  - Trigger: push a `main`
  - SSH al servidor, `git pull`, `docker compose up -d --build`
  - Rollback automático si el healthcheck falla tras 5 min
- [ ] Tags de versión (semver) — `v0.5.0`, `v0.6.0`, etc.
- [ ] Webhook a Slack/Discord/email en deploys exitosos y fallidos
- [ ] Secrets de GitHub configurados:
  - `STAGING_SSH_KEY` (clave dedicada para deploys)
  - `STAGING_HOST` (IP del VPS)
  - `STAGING_USER` (`sabia`)

### Entregables

- `main` protegida con checks obligatorios
- Deploy automático staging funcional
- Rollback probado

### Criterio de salida

- Un commit a `main` resulta en deploy a staging en < 5 min
- Si el healthcheck falla, el deploy se revierte automáticamente
- PR sin tests E2E verdes no puede mergear

---

## S4 — Observabilidad

**Objetivo:** saber qué pasa en el sistema sin tener que SSH al servidor.

**Tiempo estimado:** 2-3 días

### Tareas

- [ ] Endpoint `/api/health` que retorna 200 con `{ db, redis, s3, version }` y un 503 si algo falla
- [ ] Logs estructurados (JSON) en la app — usar `pino` o similar
- [ ] Agregador de logs: opciones:
  - **Loki + Promtail** (self-hosted, gratis, simple)
  - **Papertrail** (SaaS, gratis hasta 50 MB/mes, 7 días retención)
  - **Better Stack** (SaaS, gratis hasta 5 GB/mes)
- [ ] Métricas con Prometheus:
  - `node_exporter` para métricas del host (CPU, RAM, disco)
  - `cAdvisor` para métricas de contenedores
  - Endpoint `/metrics` de la app (requiere agregar `prom-client`)
- [ ] Dashboards de Grafana:
  - Vista general: CPU, RAM, disco, red
  - Vista de app: requests/s, latencia p50/p95/p99, errores 5xx
  - Vista de negocio: logins/hora, docs subidos/hora, docs publicados/hora
- [ ] Alertas (Alertmanager o servicio externo):
  - Disco >85% → email
  - CPU >90% sostenido 10 min → email
  - Healthcheck falla 2 veces seguidas → email + Slack
  - Tasa de error 5xx >5% → email
- [ ] Uptime monitoring externo (UptimeRobot o similar, gratis) — chequea `/api/health` cada 5 min

### Entregables

- Dashboard Grafana accesible vía URL protegida
- Alertas funcionando (probar con un test)
- Uptime monitor activo

### Criterio de salida

- Un incidente (ej. matar Postgres) genera alerta en < 5 min
- Los logs de las requests son buscables por trace ID
- Hay baseline de performance registrado (latencia p95 < 500ms con 10 usuarios)

---

## S5 — Backups y disaster recovery

**Objetivo:** poder recuperar la plataforma completa (BD + archivos + config) en caso de desastre.

**Tiempo estimado:** 2 días

### Tareas

- [ ] Script `scripts/backup.sh` que:
  - Dump de Postgres (con `pg_dump` custom format, comprimido)
  - Sync del bucket MinIO a storage secundario (S3, B2, o segundo VPS)
  - Copia de `.env.staging` (cifrado con `gpg`)
  - Genera un manifest con timestamp + tamaños + checksums
- [ ] Cron diario (3 AM, hora Chile) ejecutando el backup
- [ ] Retención: 7 diarios, 4 semanales, 6 mensuales
- [ ] Almacenamiento off-site (distinto datacenter del primario)
- [ ] Script `scripts/restore.sh` que valida un backup y restaura
- [ ] **Test de restore trimestral**: descargar backup, levantar stack nuevo, restaurar, validar
- [ ] Documentar RPO (Recovery Point Objective) y RTO (Recovery Time Objective):
  - RPO objetivo: 24h (backup diario)
  - RTO objetivo: 2h (restore + deploy + smoke tests)

### Entregables

- Backups automáticos funcionando
- Restore probado al menos una vez
- Runbook en `docs/RUNBOOK_BACKUPS.md`

### Criterio de salida

- Un restore completo desde backup tarda < 2h
- Los backups se almacenan fuera del servidor primario
- El último restore test está documentado con resultado exitoso

---

## S6 — QA de aceptación

**Objetivo:** validar que el sistema cumple los criterios de calidad antes de producción.

**Tiempo estimado:** 3-4 días

### Tareas

#### 6.1 Smoke tests automatizados

- [ ] Suite de Playwright que corre contra staging (separada de la del dev)
- [ ] Cubre los 3 roles + flujos principales (login, upload, publish, download)
- [ ] Corre en cada deploy a staging

#### 6.2 Test de carga básico

- [ ] Herramienta: k6 o Artillery
- [ ] Escenario: 10 usuarios concurrentes haciendo login + navegando
- [ ] Escenario: 50 documentos subidos en 5 minutos
- [ ] Escenario: 100 descargas en 5 minutos
- [ ] Métricas objetivo:
  - Latencia p95 < 500 ms
  - Tasa de error < 0.1%
  - CPU < 70%, RAM < 80%

#### 6.3 Test de seguridad

- [ ] `npm audit` limpio (o solo warnings aceptables)
- [ ] Escaneo de vulnerabilidades en imágenes Docker (`trivy`, `snyk`)
- [ ] Verificar headers de seguridad con [securityheaders.com](https://securityheaders.com) → A+
- [ ] Verificar SSL con [ssllabs.com](https://ssllabs.com/ssltest/) → A+
- [ ] Test manual de OWASP Top 10:
  - SQL injection (debe estar mitigado por Drizzle parametrizado)
  - XSS (debe estar mitigado por React + CSP)
  - CSRF (verificar que las mutaciones sin CSRF fallan)
  - Auth bypass (verificar que rutas protegidas devuelven 401/403)
  - IDOR (verificar que cliente A no ve docs de cliente B)
- [ ] Verificar rate limit funciona (6to login en 5 min → 429)

#### 6.4 Test de recuperación

- [ ] Matar Postgres → verificar reinicio automático +恢复
- [ ] Matar la app → verificar reinicio automático
- [ ] Matar nginx → verificar que docker lo reinicia
- [ ] Disco lleno → verificar alerta y comportamiento graceful

### Entregables

- Reporte de QA en `docs/REPORTES/qa-staging.md` con resultados
- Cumplimiento de criterios de salida (firmado)

### Criterio de salida

- Todos los smoke tests verdes
- Carga: métricas objetivo cumplidas
- Seguridad: A+ en securityheaders, A+ en ssllabs
- Recuperación: cada escenario pasa en < 5 min

---

## S7 — Hardening pre-producción

**Objetivo:** dejar staging listo para que el primer cliente real lo use.

**Tiempo estimado:** 1-2 días

### Tareas

- [ ] **Eliminar datos del seed** y reemplazarlos con datos reales del primer cliente:
  - Instalación con el slug real del cliente
  - Usuario del cliente con password entregada por canal seguro (nunca por email)
  - 1-2 documentos reales para validar el flujo
- [ ] Cambiar las passwords de los 3 usuarios del seed (no usarlos más en prod)
- [ ] Activar 2FA (TOTP) para el superadmin (Fase 8) — al menos para la cuenta de prod
- [ ] Revisar CSP, agregar dominios necesarios
- [ ] Revisar logs: ¿se loguea algún secreto por accidente? (passwords en logs, tokens, etc.)
- [ ] Configurar alertas de seguridad (login fallido N veces, acceso desde IP nueva, etc.)
- [ ] Crear runbook de incidente en `docs/RUNBOOK_INCIDENTES.md`
- [ ] Capacitar al equipo de soporte (si lo hay) en el flujo

### Entregables

- Staging con datos reales del primer cliente
- Runbook de incidentes
- Lista de contactos de emergencia

### Criterio de salida

- 0 secretos en logs (verificar con grep en logs de 24h)
- Runbook revisado y aprobado
- Equipo sabe a quién llamar si algo se rompe

---

## S8 — Onboarding del primer cliente real

**Objetivo:** el cliente real usa la plataforma de punta a punta, da feedback, lo aprueba.

**Tiempo estimado:** 1 semana (paralelo con otras actividades)

### Tareas

- [ ] Reunión de kickoff con el cliente (1h):
  - Mostrar demo en vivo
  - Acordar flujo de trabajo (qué documentos, qué períodos, qué frecuencia)
  - Acordar SLAs (tiempo de respuesta, horario de soporte)
- [ ] Crear la instalación del cliente:
  - Slug personalizado
  - Subdominio personalizado
  - BD y bucket aislados
- [ ] Crear usuario del cliente con password temporal
- [ ] Entregar credenciales por canal seguro (en persona, por teléfono, o 1Password share)
- [ ] Sesión de capacitación (1h) con el cliente
- [ ] Período de prueba de 5 días con documentos reales
- [ ] Sesión de feedback (1h): ¿qué falta, qué sobra, qué molesta?
- [ ] Iterar sobre el feedback (pequeños ajustes)
- [ ] Decisión go / no-go para pasar a S9

### Entregables

- Cliente activo en staging con sus datos reales
- Documentación del feedback capturado
- Acta de aprobación del cliente

### Criterio de salida

- Cliente confirma por escrito que está conforme con el flujo
- Issues críticos resueltos
- Cliente autoriza el go-live

---

## S9 — Go-live

**Objetivo:** la plataforma en producción, con el primer cliente real, monitoreada de cerca.

**Tiempo estimado:** 1 día (cut-over) + 1 semana de hyper-care

### Tareas del cut-over (1 día)

- [ ] Snapshot final del estado de staging (por si hay que volver)
- [ ] Cambiar DNS: los subdominios del cliente ahora apuntan al VPS de producción
- [ ] (O bien: promover staging a producción cambiando `dev.sabiacontable.cl` por el dominio real)
- [ ] Smoke test en producción con los 3 roles
- [ ] Verificar que HTTPS funciona con certs reales
- [ ] Verificar que el cliente puede entrar
- [ ] Comunicación formal al cliente: "estamos en vivo"
- [ ] Inicio del hyper-care (monitoreo intensivo 24/7)

### Hyper-care (1 semana)

- [ ] Revisión de logs 2 veces al día
- [ ] Revisión de métricas 1 vez al día
- [ ] Canal de comunicación directo con el cliente (WhatsApp dedicado)
- [ ] Standby para rollback si algo grave pasa
- [ ] Post-mortem al cierre: qué funcionó, qué no, qué mejorar

### Entregables

- Servicio en producción
- Post-mortem del hyper-care

### Criterio de salida

- 7 días sin incidente crítico
- Cliente confirma satisfacción
- Operación normal continúa en S10

---

## S10 — Operación continua

**Objetivo:** mantener el servicio estable, iterar sobre feedback, incorporar nuevos clientes.

**Tiempo estimado:** ongoing

### Tareas recurrentes

#### Diarias
- Revisar alertas y logs
- Responder tickets de soporte

#### Semanales
- Revisar métricas de uso (logins, docs subidos/publicados)
- Review de issues abiertos
- Deploy si hay cambios

#### Mensuales
- Actualizar dependencias (`npm outdated`, parches de seguridad)
- Rotar secretos según política
- Revisar capacidad del VPS (crecer si disco/CPU se acercan a límites)
- Backup test (restore real trimestral, prueba en seco mensual)

#### Trimestrales
- Test de restore completo
- Revisar y actualizar la documentación
- Review del roadmap: ¿hay que cambiar prioridades?

#### Anuales
- Renovación de certs TLS (Let's Encrypt los renueva auto, pero validar)
- Pen test externo (opcional, recomendado)
- Revisión de la arquitectura completa

### Criterio de éxito a 6 meses

- 99.5% de uptime
- 3+ clientes activos
- < 4 horas de soporte reactivo por cliente por mes
- 0 incidentes de seguridad
- Roadmap actualizado según feedback real

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| VPS se cae / proveedor tiene outage | Media | Alto | Backups off-site + plan de restore probado + proveedor con SLA > 99.9% |
| Data breach (acceso no autorizado) | Baja | Muy alto | S0 (secretos) + S6 (security tests) + S7 (TOTP) + audit log activo |
| Cliente insatisfecho y se va | Media | Medio | S8 (onboarding cuidado) + hyper-care + feedback loop |
| Costo del VPS crece más de lo previsto | Baja | Bajo | Monitoreo de uso + alert si >80% capacidad + plan de upgrade |
| Cambio de Next.js / Drizzle rompe compat | Media | Medio | Lock de versiones + tests E2E + upgrade planificado |
| Ataque de fuerza bruta al login | Alta | Bajo | Rate limit (ya existe) + WAF en nginx + fail2ban |
| Pérdida de secretos (1Password comprometido) | Baja | Alto | Política de no compartir + rotación inmediata + audit |

---

## Costos estimados (mensual)

| Item | Costo |
|---|---|
| VPS staging | USD 24 |
| VPS prod | USD 24 (compartido con staging inicialmente) |
| Dominio `sabiacontable.cl` | USD 10/año (≈ USD 1/mes) |
| Backups off-site (B2 100 GB) | USD 0.5 |
| Monitoring (Better Stack free tier) | USD 0 |
| Email transaccional (Resend free tier 3K/mes) | USD 0 |
| reCAPTCHA | USD 0 |
| **Total mensual** | **≈ USD 50/mes** |

Escala: cuando se llegue a 10+ clientes, evaluar upgrade a un VPS más grande (USD 48-96/mes) o migrar a Kubernetes si la complejidad lo amerita.

---

## Resumen ejecutivo (1 página)

**Hoy:** MVP funcional en DEV con 30/30 E2E pasando. Falta todo lo operacional.

**Plan:** 10 fases operacionales (S0-S10), 6-8 semanas, 1 dev a tiempo completo, costo mensual ≈ USD 50.

**Próximo paso inmediato:** ejecutar S0 (rotar secretos dummy) en 1 día.

**Hito crítico:** fin de S8 — el primer cliente real aprueba el flujo. Ese es el go/no-go para S9.

**Después del go-live:** operación continua con monitoreo, backups automatizados, y roadmap iterando según feedback.

---

**Mantenedor del documento:** equipo Sabia / HackTeck
**Última actualización:** 2026-08-15
**Próxima revisión:** al cierre de S0
