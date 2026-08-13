/**
 * Schema de base de datos — Sabia Contable MVP
 * =============================================
 *
 * Reglas (de la propuesta integrada):
 * - 1 instalación de Sabia Contable = N instalaciones de clientes
 * - 1 cliente contable = 1 instalación aislada
 * - ACID: Postgres con FKs estrictas, constraints explícitos
 * - Auditoría: tabla `audit_log` registra acciones sensibles
 *
 * Aplicación de normalización (1FN/2FN/3FN del manual maestro):
 * - 1FN: columnas atómicas, sin JSON dumps para datos de dominio
 * - 2FN: PKs simples o compuestas correctas, sin dependencias parciales
 * - 3FN: `accounting_clients` en tabla propia, `users` en tabla propia,
 *        `user_client_access` modela la N:M sin atributos transitivos.
 *
 * NOTA sobre `metadata jsonb` en audit_log:
 * - Es trazabilidad flexible, no datos de dominio. Justifica el jsonb
 *   según el manual §8.
 */

import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  inet,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  bigserial,
  jsonb,
} from 'drizzle-orm/pg-core';

// ============================================
// Enums
// ============================================

export const userRoleEnum = pgEnum('user_role', [
  'superadmin',
  'contador',
  'asistente',
  'cliente',
]);

export const installationStatusEnum = pgEnum('installation_status', [
  'active',
  'suspended',
  'archived',
]);

export const accessLevelEnum = pgEnum('access_level', [
  'read_only',
  'read_write',
  'admin',
]);

// ============================================
// Tabla: installations
// ============================================
// Una fila por cada cliente de la firma Sabia Contable.
// Multi-install: una sola BD puede tener varias instalaciones con datos aislados
// por `slug` (ver middleware.ts y policy de DB más estricta en producción).

export const installations = pgTable(
  'installations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 50 }).notNull(),
    subdomain: varchar('subdomain', { length: 100 }).notNull(),
    status: installationStatusEnum('status').notNull().default('active'),
    // Hash del token que usa el panel contable para publicar al portal
    panelApiTokenHash: text('panel_api_token_hash').notNull(),
    dbName: varchar('db_name', { length: 100 }).notNull(),
    storageBucket: varchar('storage_bucket', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex('idx_installations_slug').on(t.slug),
    subdomainUnique: uniqueIndex('idx_installations_subdomain').on(t.subdomain),
  })
);

// ============================================
// Tabla: users
// ============================================
// Usuarios del sistema. Pertenecen a una instalación.
// Roles: superadmin | contador | asistente | cliente

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    installationId: uuid('installation_id')
      .notNull()
      .references(() => installations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name').notNull(),
    role: userRoleEnum('role').notNull(),
    active: boolean('active').notNull().default(true),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    mfaSecret: text('mfa_secret'), // cifrado, null si mfaEnabled = false
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    failedLoginCount: varchar('failed_login_count', { length: 10 }).notNull().default('0'),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // Email único dentro de una instalación
    emailInstallationUnique: uniqueIndex('idx_users_email_installation').on(
      t.installationId,
      t.email
    ),
    // Índice para login rápido: email + active
    emailActiveIdx: index('idx_users_email_active').on(t.email).where(sql`active = true`),
  })
);

// ============================================
// Tabla: refresh_tokens
// ============================================
// Almacenados hasheados. Rotación con revocación del anterior.

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Info de origen para auditoría
    userAgent: text('user_agent'),
    ipAddress: inet('ip_address'),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex('idx_refresh_tokens_hash').on(t.tokenHash),
    // Índice parcial: solo tokens activos (no revocados, no expirados)
    userActiveIdx: index('idx_refresh_tokens_user_active')
      .on(t.userId)
      .where(sql`revoked_at IS NULL AND expires_at > NOW()`),
  })
);

// ============================================
// Tabla: accounting_clients
// ============================================
// Empresas (clientes contables). Viven dentro de una instalación.
// En el MVP, normalmente 1 cliente principal por instalación.

export const accountingClients = pgTable(
  'accounting_clients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    installationId: uuid('installation_id')
      .notNull()
      .references(() => installations.id, { onDelete: 'cascade' }),
    rut: varchar('rut', { length: 20 }).notNull(),
    legalName: text('legal_name').notNull(),
    taxRegime: varchar('tax_regime', { length: 50 }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // RUT único dentro de la instalación
    rutInstallationUnique: uniqueIndex('idx_clients_rut_installation').on(
      t.installationId,
      t.rut
    ),
  })
);

// ============================================
// Tabla: user_client_access
// ============================================
// Relación N:M entre users y accounting_clients con nivel de acceso.
// modela quién puede ver/editar qué cliente contable.

export const userClientAccess = pgTable(
  'user_client_access',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => accountingClients.id, { onDelete: 'cascade' }),
    accessLevel: accessLevelEnum('access_level').notNull().default('read_only'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.clientId] }),
  })
);

// ============================================
// Tabla: audit_log
// ============================================
// Registro de acciones sensibles. Aplica 1FN (campos atómicos) pero acepta
// `metadata jsonb` para contexto flexible (NO datos de dominio).

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    installationId: uuid('installation_id').references(() => installations.id, {
      onDelete: 'set null',
    }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 50 }).notNull(),
    resourceType: varchar('resource_type', { length: 50 }),
    resourceId: uuid('resource_id'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCreatedIdx: index('idx_audit_user_created').on(t.userId, t.createdAt),
    installationCreatedIdx: index('idx_audit_installation_created').on(
      t.installationId,
      t.createdAt
    ),
    actionCreatedIdx: index('idx_audit_action_created').on(t.action, t.createdAt),
  })
);

// ============================================
// Tipos inferidos
// ============================================

export type Installation = typeof installations.$inferSelect;
export type NewInstallation = typeof installations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type AccountingClient = typeof accountingClients.$inferSelect;
export type NewAccountingClient = typeof accountingClients.$inferInsert;

export type UserClientAccess = typeof userClientAccess.$inferSelect;
export type NewUserClientAccess = typeof userClientAccess.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
