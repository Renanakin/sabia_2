# PORTAL agent — Portal del cliente

## Misión

La UI de solo-lectura donde el cliente consulta sus documentos, KPIs y reportes. Sube documentos al contador. Envía consultas.

## Fases a cargo

- **Fase 3** — Portal cliente MVP

## Inputs

- AUTH (sesión, roles)
- FOUND (DB, middleware, storage)
- Datos seed (1 cliente, 5 documentos visibles, 2 KPIs, 1 reporte)

## Outputs

```
src/app/(portal)/
├── layout.tsx                       # shell del portal (header, sidebar, mobile nav)
├── page.tsx                          # redirect a /dashboard
├── dashboard/
│   └── page.tsx                      # KPIs + estado del período
├── documentos/
│   ├── page.tsx                      # lista filtrada por visible_to_client
│   └── [id]/
│       ├── page.tsx                  # detalle + descarga (URL firmada)
│       └── descargar/
│           └── route.ts              # emite URL firmada con expiración 5 min
├── reportes/
│   ├── page.tsx                      # lista de reportes disponibles
│   └── [id]/
│       └── descargar/
│           └── route.ts
├── kpi/
│   └── page.tsx                      # gráficos simples
├── mensajes/
│   ├── page.tsx                      # consultas al contador
│   └── nuevo/
│       └── page.tsx
├── perfil/
│   ├── page.tsx
│   └── cambiar-password/
│       └── page.tsx
└── subir/
    └── page.tsx                      # subir documentos al contador

src/app/api/portal/
├── me/route.ts
├── dashboard/route.ts
├── documents/
│   ├── route.ts                      # GET lista, POST subir
│   └── [id]/
│       ├── route.ts                  # GET detalle
│       └── download/route.ts         # GET URL firmada
├── reports/route.ts
├── kpis/route.ts
└── messages/route.ts
```

## Definition of Done

- [ ] Cliente con sesión válida puede:
  - [ ] Ver dashboard con KPIs
  - [ ] Ver lista de documentos visibles
  - [ ] Descargar un documento (URL firmada)
  - [ ] Ver lista de reportes
  - [ ] Descargar un reporte
  - [ ] Subir un documento al contador
  - [ ] Enviar un mensaje al contador
  - [ ] Cambiar su contraseña
- [ ] Cliente sin sesión es redirigido a `/login`
- [ ] Cliente de OTRA instalación NO puede ver documentos ajenos (test negativo)
- [ ] Endpoint `GET /api/portal/documents` filtra por `visible_to_client = true`
- [ ] `client_id` SIEMPRE viene de la sesión, nunca del request
- [ ] Responsive (mobile-first, ya tienes el patrón en el marketing)
- [ ] Reporte firmado

## Checklist de seguridad

- [ ] Whitelist de endpoints (NO endpoints genéricos)
- [ ] `client_id` desde sesión
- [ ] Descarga con URL firmada, expiración ≤ 5 min
- [ ] Validación MIME real en upload
- [ ] Validación de tamaño (≤ 10 MB)
- [ ] Extensiones bloqueadas: `.exe`, `.bat`, `.ps1`, `.sh`, `.js`, `.html`
- [ ] CSRF en POST
- [ ] `audit_log` registra descargas y subidas
- [ ] Rate limit en subida (10 docs / hora)

## Out of scope

- Edición de datos (es solo lectura)
- Datos del contador (delegado a PANEL agent)
- MFA (AUTH, Fase 8)

## Patrón de query

```ts
// SIEMPRE así:
const session = await requireRole(req, ['cliente']);
const docs = await db
  .select()
  .from(documents)
  .where(
    and(
      eq(documents.clientId, session.clientId),  // de la sesión, no del request
      eq(documents.visibleToClient, true)
    )
  )
  .orderBy(desc(documents.createdAt));
```
