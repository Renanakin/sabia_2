/**
 * Cliente Drizzle para Postgres
 * ==============================
 *
 * Una sola instancia compartida por toda la app (singleton).
 * Conexión con SSL configurable via DATABASE_URL.
 *
 * IMPORTANTE: este cliente es server-side ONLY.
 * - Nunca importar desde componentes del cliente (Next.js lo impediría por error).
 * - Si se usa en Route Handlers o Server Components, importar acá.
 *
 * Conexión LAZY: no abre conexión ni verifica env al cargar el módulo.
 * Solo abre cuando se ejecuta el primer query. Esto permite que `next build`
 * corra sin necesidad de tener la BD levantada.
 */

import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function getPostgresClient() {
  if (globalForDb.postgresClient) return globalForDb.postgresClient;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL no está definida. ' +
        'Copia .env.example a .env.local y configura la variable. ' +
        'Ver docs/ORQUESTADOR.md.'
    );
  }

  const client = postgres(databaseUrl, {
    max: 10, // pool size
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // mejor rendimiento en serverless
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.postgresClient = client;
  }

  return client;
}

export const db = drizzle(getPostgresClient(), { schema });

export type Db = typeof db;
