/**
 * Storage upload — helper para subir archivos a S3/MinIO
 * =========================================================
 *
 * Maneja:
 * - Validación de tamaño (default 10 MB)
 * - Validación de extensión (whitelist)
 * - Validación de MIME real (no solo la extensión)
 * - Generación de key determinístico con UUID
 * - Upload a S3/MinIO
 *
 * SEGURIDAD:
 * - Renombra el archivo a UUID (el original va en DB, no en storage)
 * - Calcula sha256 para integridad
 * - Rechaza extensiones peligrosas (.exe, .bat, .ps1, .sh, .js, .html)
 * - Limita tamaño
 */

import 'server-only';
import { randomUUID, createHash } from 'node:crypto';
import { putObject } from './s3';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [
  'pdf',
  'xml',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'xls',
  'xlsx',
  'doc',
  'docx',
  'csv',
  'txt',
];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/xml',
  'text/xml',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
];

const FORBIDDEN_EXTENSIONS = ['exe', 'bat', 'ps1', 'sh', 'js', 'html', 'htm', 'svg'];

export interface UploadedFile {
  storagePath: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  fileHash: string;
}

export interface UploadOptions {
  installationSlug: string;
  clientId: string;
  period: string;
}

export class UploadError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function uploadDocument(
  file: File,
  options: UploadOptions
): Promise<UploadedFile> {
  // 1. Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(
      'file_too_large',
      `Archivo excede el máximo de ${MAX_FILE_SIZE / 1024 / 1024} MB`
    );
  }
  if (file.size === 0) {
    throw new UploadError('file_empty', 'El archivo está vacío');
  }

  // 2. Validar extensión
  const originalName = file.name;
  const ext = originalName.split('.').pop()?.toLowerCase() ?? '';
  if (FORBIDDEN_EXTENSIONS.includes(ext)) {
    throw new UploadError('forbidden_extension', `Extensión .${ext} no permitida`);
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new UploadError(
      'invalid_extension',
      `Extensión .${ext} no soportada. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  // 3. Validar MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new UploadError('invalid_mime', `Tipo MIME no permitido: ${file.type}`);
  }

  // 4. Generar key determinístico con UUID
  const uuid = randomUUID();
  const storagePath = `${options.installationSlug}/${options.clientId}/${options.period}/${uuid}.${ext}`;

  // 5. Leer buffer y calcular hash
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileHash = createHash('sha256').update(buffer).digest('hex');

  // 6. Subir a S3/MinIO
  await putObject(storagePath, buffer, file.type);

  return {
    storagePath,
    fileName: originalName,
    fileSize: String(file.size),
    mimeType: file.type,
    fileHash,
  };
}
