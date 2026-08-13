/**
 * Cliente Redis singleton (cache + rate limit + cola BullMQ)
 * ===========================================================
 * Conexión lazy, reusable. Maneja reconexión automática.
 *
 * Lazy init: no conecta al cargar el módulo, solo cuando se usa.
 */

import 'server-only';
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

function getRedis(): Redis {
  if (globalForRedis.redisClient) return globalForRedis.redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL no está definida. Configúrala en .env.local');
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redisClient = client;
  }

  return client;
}

// Proxy para mantener la API síncrona y lazy
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedis();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});

// Helper para keys con prefijo
export const rkey = (...parts: (string | number)[]) =>
  `sabia:${parts.join(':')}`;
