# Reporte de Fase NN — <nombre>

> **Fecha:** YYYY-MM-DD
> **Fase:** NN
> **Subagente principal:** <FOUND | AUTH | PORTAL | PANEL | SEC>
> **Subagentes de apoyo:** ...
> **Rama:** `feat/fase-NN-<slug>`
> **Commit hash:** <se completa al cerrar>
> **PR / Issue:** <opcional>

---

## 1. Objetivo de la fase

<copiar del ORQUESTADOR.md, fase NN>

---

## 2. Definition of Done (DoD)

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

---

## 3. Checklist de seguridad (SEC agent)

- [ ] `gitleaks detect` → 0 hallazgos
- [ ] `npm audit --audit-level=high` → 0 vulnerabilidades
- [ ] `.env*` no commiteado
- [ ] Inputs validados con Zod
- [ ] CSRF token en endpoints mutadores
- [ ] Rate limit en `/api/auth/*`
- [ ] `audit_log` registra acciones de esta fase
- [ ] `client_id` siempre desde sesión, nunca del request

---

## 4. Cambios realizados

### 4.1 Archivos nuevos
- `ruta/archivo.ts` — descripción breve
- ...

### 4.2 Archivos modificados
- `ruta/archivo.ts` — qué cambió y por qué
- ...

### 4.3 Archivos eliminados
- (o "ninguno")

---

## 5. Tests añadidos

- `tests/ruta.test.ts` — qué cubre
- ...

### Resultado
```
<output de npm test o equivalente>
```

---

## 6. Métricas (si aplica)

| Métrica | Valor | Notas |
|---|---|---|
| Cobertura | X% | ... |
| Latencia p95 | X ms | ... |
| Bundle size | X KB | ... |

---

## 7. Decisiones técnicas (ADR inline)

Si hubo decisiones importantes, justificar aquí:

- **Decisión:** ej. usar Drizzle en vez de Prisma.
  - **Por qué:** SQL-first, tipado, sin generación pesada, mejor con Postgres puro.
  - **Tradeoff:** comunidad más chica que Prisma.

---

## 8. Problemas conocidos / Follow-ups

- [ ] Issue 1 — no bloqueante, dejar para fase N+1
- [ ] ...

---

## 9. Verificación manual (qué probar antes de aprobar)

1. Levantar `docker compose up -d`
2. `npm run dev`
3. Login con usuario seed
4. ... (pasos concretos de la fase)

---

## 10. Commit final

```
<tipo>(<scope>): <descripción>

<cuerpo>

Refs: docs/ORQUESTADOR.md#fase-NN
Verified-by: SEC agent (gitleaks 0, npm audit 0)
```

**Hash:** `<se completa>`

---

## 11. Aprobación

- [ ] Orquestador verificó DoD
- [ ] SEC agent verificó checklist de seguridad
- [ ] Usuario aprobó manualmente
- [ ] Push a `main` autorizado

**Firma:** ____________________  **Fecha:** __________
