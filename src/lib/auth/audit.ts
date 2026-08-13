/**
 * Audit log helper
 * =================
 * Inserta registros en `audit_log` para acciones sensibles:
 * login exitoso, login fallido, logout, refresh, cambio de password, etc.
 *
 * No bloquea: si falla el insert, la acción principal sigue OK pero
 * se loguea el error en consola para revisión.
 */

import { db } from '../db/client';
import { auditLog } from '../db/schema';

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'login_locked'
  | 'logout'
  | 'refresh_token'
  | 'password_changed'
  | 'mfa_enabled'
  | 'session_expired'
  | 'installation_created'
  | 'installation_updated'
  | 'installation_archived'
  | 'user_created'
  | 'user_updated'
  | 'user_archived'
  | 'document_uploaded'
  | 'document_published'
  | 'document_downloaded';

export interface AuditEntry {
  installationId?: string | null;
  userId?: string | null;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      installationId: entry.installationId ?? null,
      userId: entry.userId ?? null,
      action: entry.action,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (error) {
    // No fallar la operación principal por un audit log
    console.error('[audit] failed to write log:', error);
  }
}
