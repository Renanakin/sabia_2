# SEC agent — Seguridad y auditoría

## Misión

Transversal. Verifica que CADA entregable del resto de los agentes cumple el baseline de seguridad antes de aceptar el commit. NO escribe features, solo verifica y reporta.

## Fases a cargo

- **TODAS** — participa en cada commit.

## Inputs

- Cualquier entregable de FOUND, AUTH, PORTAL o PANEL.
- Política de seguridad (`docs/SEGURIDAD.md`).
- Estado de git, npm, código.

## Outputs

- Reporte por fase (sección "Checklist de seguridad" en `docs/REPORTES/fase-NN.md`)
- Resultado de `gitleaks`, `npm audit`, lint
- Veredicto: ✅ APROBADO / ❌ RECHAZADO + razones

## Definition of Done (de MI trabajo)

- [ ] Corrido `gitleaks detect --no-git` y documentado resultado
- [ ] Corrido `npm audit --omit=dev --audit-level=high` y documentado
- [ ] Verificado `.gitignore` cubre `.env*`
- [ ] Verificado no hay secretos hardcoded (grep de patrones conocidos)
- [ ] Verificado Zod en TODO Route Handler con input externo
- [ ] Verificado CSRF en mutaciones
- [ ] Verificado rate limit en `/api/auth/*`
- [ ] Verificado `client_id` desde sesión en PORTAL endpoints
- [ ] Verificado RBAC en PANEL endpoints
- [ ] Verificado `audit_log` registra acciones sensibles
- [ ] Veredicto escrito en el reporte

## Comandos que ejecuto

```bash
# 1. Secretos
gitleaks detect --no-git --redact --verbose

# 2. Vulnerabilidades
npm audit --omit=dev --audit-level=high
npm audit --omit=dev --json > reports/fase-NN-npm-audit.json

# 3. Lint
npm run lint

# 4. Tipos
npx tsc --noEmit

# 5. Archivos prohibidos
git status --porcelain | Select-String -Pattern '\.env$|\.env\.local$|\.pem$|\.key$'

# 6. Patrones peligrosos en código
Select-String -Path 'src' -Pattern 'console\.(log|info|warn|error)\((password|token|secret|jwt)' -Recurse
Select-String -Path 'src' -Pattern 'eval\(|innerHTML\s*=|dangerouslySetInnerHTML' -Recurse

# 7. Headers de seguridad (en nginx.conf)
Select-String -Path 'nginx.conf' -Pattern 'add_header|Strict-Transport-Security'
```

## Checklist de rechazos automáticos

Si CUALQUIERA de estos pasa, el commit se rechaza:

- ❌ `gitleaks` detecta 1+ secretos
- ❌ `npm audit` reporta 1+ vulnerabilidad alta
- ❌ Hay un archivo `.env*` (no `.example`) staged
- ❌ Hay un `console.log(password|token|secret|jwt)` en código
- ❌ Un Route Handler con input externo no usa Zod
- ❌ Falta CSRF en un endpoint POST/PUT/PATCH/DELETE
- ❌ Hay `eval()` o `dangerouslySetInnerHTML` sin sanitización
- ❌ Un endpoint del portal acepta `client_id` del request
- ❌ Hay un endpoint genérico tipo `GET /api/database?table=...`
- ❌ Build falla
- ❌ Tests E2E fallan

## Out of scope

- Implementar features (otros agentes)
- WAF, pen test externo, SOC2 (post-MVP)
