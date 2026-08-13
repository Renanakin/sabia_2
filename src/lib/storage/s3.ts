/**
 * Storage client (S3 / MinIO)
 * =============================
 *
 * Wrapper sobre @aws-sdk/client-s3 con config para MinIO local.
 * Expone operaciones básicas: put, get, delete, head.
 *
 * Lazy init: no conecta hasta el primer uso.
 * Server-only: nunca importar desde cliente.
 */

import 'server-only';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

export function getS3Client(): S3Client {
  if (globalForS3.s3Client) return globalForS3.s3Client;

  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION ?? 'us-east-1';
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === 'true';

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      'STORAGE_ENDPOINT, STORAGE_ACCESS_KEY y STORAGE_SECRET_KEY deben estar definidas. ' +
        'Ver .env.example.'
    );
  }

  const client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle, // necesario para MinIO
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForS3.s3Client = client;
  }

  return client;
}

/**
 * Cliente S3 "virtual" con el endpoint PÚBLICO.
 *
 * Se usa SOLO para firmar URLs que verá el usuario final (navegador).
 * Si no se setea STORAGE_PUBLIC_ENDPOINT, usa el endpoint interno
 * (que es lo que pasa en dev cuando todo corre en localhost).
 */
export function getPublicS3Client(): S3Client {
  const endpoint = process.env.STORAGE_PUBLIC_ENDPOINT ?? process.env.STORAGE_ENDPOINT;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION ?? 'us-east-1';
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === 'true';

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      'STORAGE_ENDPOINT, STORAGE_ACCESS_KEY y STORAGE_SECRET_KEY deben estar definidas. ' +
        'Ver .env.example.'
    );
  }

  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle,
  });
}

export function getBucket(): string {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) {
    throw new Error('STORAGE_BUCKET no definida');
  }
  return bucket;
}

/**
 * Sube un buffer a S3/MinIO.
 */
export async function putObject(
  key: string,
  body: Buffer,
  contentType?: string
): Promise<void> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Obtiene metadata del objeto (sin descargar el body).
 */
export async function headObject(key: string): Promise<{ size: number; contentType?: string } | null> {
  try {
    const client = getS3Client();
    const res = await client.send(
      new HeadObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );
    return {
      size: res.ContentLength ?? 0,
      contentType: res.ContentType,
    };
  } catch {
    return null;
  }
}

/**
 * Borra un objeto.
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}
