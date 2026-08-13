# PANEL agent — Panel contable

## Misión

La UI donde contadores y asistentes cargan, revisan, observan y publican documentos al portal del cliente. Gestionan clientes, períodos, reportes.

## Fases a cargo

- **Fase 4** — Panel contable MVP
- **Fase 6** — Notificaciones
- **Fase 7** — Reportes + KPIs

## Inputs

- AUTH (sesión, roles `contador` y `asistente`)
- FOUND (DB, storage, queue)
- Clientes asignados vía `user_client_access`

## Outputs

```
src/app/(contable)/
├── layout.tsx
├── page.tsx                          # redirect a /dashboard
├── dashboard/
│   └── page.tsx                      # KPIs de la operación del contador
├── clientes/
│   ├── page.tsx                      # lista
│   ├── nuevo/page.tsx
│   └── [id]/
│       ├── page.tsx                  # vista 360 del cliente
│       ├── documentos/page.tsx
│       ├── documentos/nuevo/page.tsx
│       ├── documentos/[docId]/page.tsx
│       ├── reportes/page.tsx
│       ├── f29/page.tsx
│       └── mensajes/page.tsx
├── documentos/
│   ├── page.tsx                      # cola global
│   └── [id]/page.tsx
├── reportes/
│   ├── page.tsx
│   └── generar/page.tsx
├── mensajes/
│   └── page.tsx
└── perfil/
    └── page.tsx

src/app/api/contable/
├── clients/
│   ├── route.ts                      # GET lista, POST crear
│   └── [id]/
│       ├── route.ts
│       ├── documents/route.ts
│       ├── documents/[docId]/
│       │   ├── route.ts
│       │   └── publish/route.ts      # ← PUNTO CRÍTICO
│       ├── reports/route.ts
│       └── f29/route.ts
├── documents/
│   ├── route.ts                      # GET cola global
│   └── [id]/route.ts
├── reports/
│   └── generate/route.ts
└── messages/
    └── route.ts
```

## Workflow de documento (estado)

```
pending  →  in_review  →  observed  →  approved  →  published
                                  ↘ archived
```

Solo `contador` puede transicionar a `published`. `asistente` solo puede `pending → in_review → observed`.

## Definition of Done

- [ ] Contador puede:
  - [ ] Ver lista de clientes asignados
  - [ ] Crear nuevo cliente (RUT, razón social, régimen)
  - [ ] Ver vista 360 de un cliente
  - [ ] Subir un documento (boleta, factura, etc.)
  - [ ] Cambiar status: pending → in_review → approved
  - [ ] Marcar `visible_to_client = true` (publicar)
  - [ ] Enviar observación a un documento
  - [ ] Generar reporte PDF
  - [ ] Responder mensaje del cliente
- [ ] Asistente puede:
  - [ ] Lo mismo, EXCEPTO publicar
- [ ] Publicación dispara:
  - [ ] Email al cliente (Resend, encolado)
  - [ ] Invalidación de caché Redis del portal
  - [ ] Registro en `publication_log`
  - [ ] Registro en `audit_log`
- [ ] Tests E2E del workflow completo
- [ ] Reporte firmado

## Checklist de seguridad

- [ ] Solo `contador` accede a `POST /api/contable/clients/[id]/documents/[docId]/publish`
- [ ] `client_id` validado contra `user_client_access` del usuario
- [ ] Asignación cliente-contador verificada en CADA endpoint
- [ ] Validación de tamaño y MIME en upload
- [ ] Hash de archivo guardado
- [ ] URL firmada para descarga interna
- [ ] `audit_log` registra CADA cambio de status
- [ ] `publication_log` registra CADA publicación
- [ ] CSRF en mutaciones
- [ ] Rate limit: 100 uploads / hora

## Out of scope

- Lógica de auth (AUTH)
- Generación de F29 real con SII (mock por ahora)
- Conciliación bancaria (post-MVP)

## Job asíncrono crítico

```ts
// src/lib/queue/jobs.ts
export async function publishDocumentJob(docId: string, userId: string) {
  // 1. Validar que el usuario es contador y tiene acceso
  // 2. Marcar visible_to_client = true
  // 3. Insertar en publication_log
  // 4. Insertar en audit_log
  // 5. Encolar sendEmail al cliente
  // 6. Invalidar caché Redis: DEL portal:docs:<clientId>
  // 7. Invalidar caché Redis: DEL portal:dashboard:<clientId>
}
```
