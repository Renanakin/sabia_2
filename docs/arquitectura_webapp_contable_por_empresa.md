# Arquitectura de WebApp Contable por Empresa

## 1. Modelo de instalación

El sistema no será un SaaS multiempresa. Será una aplicación web instalable de forma independiente para cada empresa, con:

- Una aplicación web por instalación.
- Una base de datos SQL exclusiva.
- Usuarios exclusivos de esa empresa.
- Datos completamente aislados.
- Clientes que ingresan mediante usuario y contraseña.
- Archivos, sesiones, respaldos y logs independientes.

La arquitectura general será:

```text
Cliente / Contador
        ↓ HTTPS
WebApp de la empresa
        ↓ API interna
Base de datos SQL de la empresa
```

El servidor SQL nunca debe quedar expuesto directamente a Internet. El cliente debe acceder solamente a la WebApp y la aplicación debe consultar la base de datos por medio de una API con autenticación y autorización.

## 2. Aislamiento por instalación

Cada empresa tendrá una instancia independiente:

```text
empresa-a/
  webapp
  api
  database
  storage
  backups
  configuration

empresa-b/
  webapp
  api
  database
  storage
  backups
  configuration
```

Los accesos pueden utilizar subdominios independientes:

```text
contabilidad-empresa-a.cl
contabilidad-empresa-b.cl
```

O una estructura con dominio central:

```text
empresa-a.tu-dominio.cl
empresa-b.tu-dominio.cl
```

Cada subdominio debe apuntar a una instalación aislada.

### Elementos que no deben compartirse

No se debe compartir entre empresas:

- Base de datos.
- Usuarios.
- Sesiones.
- Tokens.
- Archivos.
- Documentos tributarios.
- Logs con información contable.
- Claves de cifrado.
- Respaldos.
- Configuración sensible.

Se puede compartir el código fuente, las imágenes Docker y el proceso de despliegue, pero no los datos operativos.

## 3. Roles y permisos

La primera versión puede trabajar con cuatro roles:

| Rol | Acceso |
|---|---|
| Administrador | Configuración completa de la instalación. |
| Contador | Registros, documentos, reportes, formularios y cierres. |
| Asistente | Carga y revisión documental limitada. |
| Cliente | Consulta de información autorizada y carga de documentos. |

El cliente no debe recibir acceso directo a las tablas contables. Su acceso debe pasar por endpoints específicos:

```text
GET /api/client/me
GET /api/client/dashboard
GET /api/client/documents
GET /api/client/reports
GET /api/client/tax-records
POST /api/client/documents
POST /api/client/questions
```

No se recomienda implementar endpoints genéricos que permitan consultar cualquier tabla:

```text
GET /api/database?table=...
```

Cada endpoint debe devolver únicamente los datos autorizados para el usuario autenticado.

## 4. Modelo inicial de base de datos

### Tabla de usuarios

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash text not null,
  full_name text not null,
  role varchar(30) not null,
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);
```

### Empresas o clientes contables

Aunque cada instalación tenga una sola empresa propietaria, se pueden administrar varios clientes dentro de esa base:

```sql
create table accounting_clients (
  id uuid primary key default gen_random_uuid(),
  rut varchar(20) not null unique,
  legal_name text not null,
  tax_regime text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### Relación entre usuarios y clientes

```sql
create table user_client_access (
  user_id uuid not null references users(id),
  client_id uuid not null references accounting_clients(id),
  access_level varchar(30) not null default 'read_only',
  primary key (user_id, client_id)
);
```

Si la instalación administra un solo cliente principal, se puede simplificar:

```sql
create table client_user_profiles (
  user_id uuid primary key references users(id),
  client_id uuid not null references accounting_clients(id),
  access_level varchar(30) not null default 'read_only'
);
```

### Documentos consultables

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references accounting_clients(id),
  period varchar(7) not null,
  document_type varchar(50) not null,
  file_name text not null,
  storage_path text not null,
  status varchar(30) not null default 'pending',
  visible_to_client boolean not null default false,
  created_at timestamptz not null default now()
);
```

La columna `visible_to_client` permite separar documentos internos del contador de documentos que ya fueron publicados al cliente.

## 5. Flujo de autenticación

El flujo recomendado es:

```text
Cliente ingresa email y contraseña
        ↓
Sistema valida credenciales
        ↓
Se genera sesión segura
        ↓
Se identifica usuario y cliente asociado
        ↓
La API aplica permisos
        ↓
Se muestran únicamente registros autorizados
```

### Recomendación de sesión

Utilizar:

```text
Access token de corta duración
+
Refresh token rotatorio
+
Cookie HTTP-only
+
Protección CSRF
+
Expiración de sesiones inactivas
```

No se deben almacenar tokens de autenticación en `localStorage` si es posible evitarlo.

Para contadores y administradores se recomienda incorporar autenticación multifactor.

## 6. Portal del cliente

El cliente debe utilizar una interfaz más simple que la del contador.

### Panel principal

El dashboard puede mostrar:

- Estado del período actual.
- Documentos pendientes.
- Documentos observados.
- Último cierre realizado.
- KPI autorizados.
- Declaraciones disponibles.
- Mensajes del contador.
- Solicitudes de información.

Ejemplo:

```text
Estado contable: En revisión
Período: Julio 2026
Documentos recibidos: 48
Documentos observados: 3
Documentos faltantes: 5
Último informe: Junio 2026
```

### Módulos iniciales

- Mi empresa.
- Mis documentos.
- Informes.
- KPI.
- Formularios.
- Solicitudes al contador.
- Carga de documentos.
- Descarga de archivos.

### Información consultable

El cliente puede consultar, según autorización:

- Resumen mensual.
- Ventas.
- Compras.
- IVA informado.
- Flujo de caja.
- Cuentas por cobrar.
- Gastos.
- Documentos tributarios.
- Informes PDF.
- Estado de cierre.
- Observaciones pendientes.

La información tributaria sensible debe ser configurable por tipo de cliente.

## 7. Visibilidad de documentos

Los documentos pueden manejar estos estados:

```text
interno
en_revision
observado
aprobado
publicado_cliente
archivado
```

Una consulta de documentos visibles podría ser:

```sql
select *
from documents
where client_id = :client_id
  and (
    visible_to_client = true
    or status = 'publicado_cliente'
  );
```

Una alternativa más segura es crear una vista dedicada:

```sql
create view client_visible_documents as
select
  id,
  client_id,
  period,
  document_type,
  file_name,
  status,
  created_at
from documents
where visible_to_client = true;
```

La API del portal debe consultar la vista o un repositorio específico, no todas las tablas internas.

## 8. Arquitectura técnica

Una instalación puede estructurarse así:

```text
reverse-proxy/
  nginx o Traefik

web/
  Next.js
  React
  TypeScript

api/
  NestJS o API modular
  autenticación
  permisos
  consultas

workers/
  procesamiento documental
  generación de PDF
  cálculo de KPI
  notificaciones

database/
  PostgreSQL

storage/
  documentos
  informes
  respaldos
```

### Stack recomendado

- Frontend: Next.js y TypeScript.
- Backend: NestJS o Fastify.
- Base de datos: PostgreSQL.
- ORM: Drizzle o Prisma.
- Autenticación: Auth.js, Lucia o módulo propio seguro.
- Archivos: MinIO, S3 o almacenamiento local cifrado.
- PDF: Playwright, Puppeteer o generación HTML controlada.
- Colas: BullMQ y Redis.
- Despliegue: Docker Compose por instalación.
- Proxy: Nginx o Traefik.
- Monitoreo: Uptime Kuma, Prometheus o logs centralizados sin datos sensibles.

## 9. Docker Compose por empresa

Cada instalación puede utilizar su propio archivo:

```yaml
services:
  web:
    image: contabilidad/web:1.0.0
    environment:
      DATABASE_URL: ${DATABASE_URL}
      AUTH_SECRET: ${AUTH_SECRET}
      STORAGE_ENDPOINT: ${STORAGE_ENDPOINT}
    depends_on:
      - api

  api:
    image: contabilidad/api:1.0.0
    environment:
      DATABASE_URL: ${DATABASE_URL}
      AUTH_SECRET: ${AUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: contabilidad
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  db_data:
```

Cada empresa debe tener valores diferentes para:

```text
DB_PASSWORD
AUTH_SECRET
Storage
Subdominio
Backup
Logs
```

Nunca se debe reutilizar el mismo `AUTH_SECRET` entre instalaciones.

## 10. Seguridad mínima

### Base de datos

- No exponer PostgreSQL públicamente.
- Permitir conexiones únicamente desde la API.
- Usar un usuario de aplicación con permisos limitados.
- Separar usuario de migraciones y usuario de ejecución.
- Activar TLS si la base está en otro servidor.
- Ejecutar respaldos automáticos.
- Probar restauraciones periódicamente.

### Aplicación

- Validar todos los parámetros en backend.
- Usar schemas con Zod, Valibot o class-validator.
- No confiar en `client_id` enviado por el navegador.
- Obtener el cliente desde la sesión autenticada.
- Aplicar autorización en cada endpoint.
- Registrar consultas y descargas importantes.
- Bloquear la enumeración de usuarios.
- Incorporar rate limiting.
- Activar MFA para administradores.
- Expirar sesiones inactivas.

### Archivos

- No usar rutas públicas permanentes.
- Entregar archivos mediante URLs firmadas de corta duración.
- Validar extensión y MIME real.
- Escanear archivos subidos.
- Renombrar archivos internamente.
- Evitar ejecutar archivos cargados por usuarios.
- Guardar hash del archivo.

## 11. Instalación de una nueva empresa

El proceso de provisión debe ser repetible:

```text
1. Crear servidor o instancia.
2. Crear subdominio.
3. Crear base de datos.
4. Ejecutar migraciones.
5. Crear usuario administrador.
6. Crear claves únicas.
7. Configurar almacenamiento.
8. Configurar correo.
9. Configurar respaldos.
10. Crear usuario contador.
11. Crear clientes iniciales.
12. Probar login.
13. Probar aislamiento.
14. Entregar credenciales iniciales.
```

Puede automatizarse con un comando:

```bash
./install-company.sh \
  --company empresa-a \
  --domain empresa-a.tu-dominio.cl \
  --database postgres
```

O con una herramienta interna:

```bash
npm run provision:company -- \
  --slug empresa-a \
  --domain empresa-a.tu-dominio.cl
```

## 12. Pruebas de aislamiento

Antes de producción se debe comprobar que un usuario de una instalación no pueda acceder a otra.

El usuario de Empresa A no debe poder:

- Iniciar sesión en Empresa B.
- Consultar un ID de Empresa B.
- Descargar un archivo de Empresa B.
- Modificar una URL para cambiar `client_id`.
- Reutilizar un token de otra instalación.
- Consultar tablas mediante endpoints no autorizados.

Ejemplo:

```http
GET /api/documents/ID_EMPRESA_B
Authorization: Bearer TOKEN_EMPRESA_A
```

La respuesta correcta debería ser:

```http
404 Not Found
```

o:

```http
403 Forbidden
```

No se debe devolver información parcial indicando que el documento existe.

## 13. Evolución del sistema

### Fase 1: portal de consulta

- Login.
- Dashboard.
- Consulta de documentos.
- Descarga de informes.
- KPI mensuales.
- Cambio de contraseña.
- Carga de documentos.

### Fase 2: interacción con el contador

- Observaciones.
- Solicitudes de información.
- Comentarios por documento.
- Notificaciones.
- Estado de revisión.
- Aprobación del cliente.

### Fase 3: automatización

- Procesamiento automático de documentos.
- Generación de informes.
- KPI semanales y mensuales.
- Alertas de documentos faltantes.
- Cierres mensuales.
- Plantillas estáticas.

### Fase 4: contabilidad productiva

- Libro diario.
- Libro mayor.
- Plan de cuentas.
- Conciliación bancaria.
- Cuentas por cobrar.
- Cuentas por pagar.
- Balance.
- Estado de resultados.
- F29.
- F22.
- Declaraciones juradas.
- Integraciones con fuentes tributarias.

## 14. MVP recomendado

El primer MVP debe ser el portal de consulta del cliente, no el sistema contable completo.

### Orden de implementación

1. Usuarios y roles.
2. Asociación entre contador y cliente.
3. Consulta segura de registros.
4. Descarga de documentos.
5. Dashboard de KPI.
6. Carga de documentos.
7. Estados de revisión.
8. Auditoría.
9. Backups.
10. Pruebas de aislamiento.

### Resultado esperado

El cliente podrá ingresar en línea con su usuario y consultar únicamente los registros que el contador haya autorizado, mientras que la empresa mantendrá su propia base de datos, sus propios usuarios, sus propios documentos y sus propios respaldos.

## 15. Definición final del producto

La solución debe definirse como:

> Aplicación web contable instalable por empresa, con base de datos, usuarios, archivos, sesiones y respaldos completamente aislados por instalación.

El modelo técnico será:

```text
mismo código
+
configuración distinta
+
base de datos distinta
+
usuarios distintos
+
dominio distinto
+
almacenamiento distinto
```

Este enfoque permite mantener una única base de código y, al mismo tiempo, entregar instalaciones independientes, privadas y controladas para cada empresa.
