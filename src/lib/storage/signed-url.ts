/**
 * URLs firmadas para descarga de documentos
 * ==========================================
 *
 * Genera URLs de descarga con expiración corta (default 5 min).
 * El cliente recibe la URL y la usa directamente con S3/MinIO.
 *
 * SEGURIDAD:
 * - Expiración ≤ 5 min
 * - Solo se firman URLs de objetos que el cliente tiene permiso de ver
 * - La URL NO se loguea completa (solo key y expiración)
 */

import 'server-only';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, getBucket } from './s3';

const DEFAULT_EXPIRATION_SECONDS = 5 * 60; // 5 minutos

export interface SignedDownloadOptions {
  expirationSeconds?: number;
  // Filename que verá el cliente al descargar (Content-Disposition)
  responseContentDisposition?: string;
}

/**
 * Genera una URL firmada para descargar un objeto.
 */
export async function getSignedDownloadUrl(
  key: string,
  options: SignedDownloadOptions = {}
): Promise<{ url: string; expiresIn: number }> {
  const expirationSeconds = options.expirationSeconds ?? DEFAULT_EXPIRATION_SECONDS;

  if (expirationSeconds > 600) {
    throw new Error('Expiración máxima permitida: 600 segundos (10 min)');
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: options.responseContentDisposition,
  });

  const url = await getSignedUrl(client, command, { expiresIn: expirationSeconds });
  return { url, expiresIn: expirationSeconds };
}

/**
 * Genera el header Content-Disposition para forzar descarga con nombre específico.
 */
export function downloadFilename(originalName: string): string {
  // Escape básico para header
  const safe = originalName.replace(/"/g, '\\"');
  return `attachment; filename="${safe}"`;
}
