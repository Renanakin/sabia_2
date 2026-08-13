/**
 * Rate limit con Redis (sliding window via INCR + EXPIRE)
 * ========================================================
 * Default: 5 requests por 5 minutos por (IP + key).
 * Usado en /api/auth/login, /api/auth/refresh, etc.
 */

import { redis, rkey } from '../redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // segundos hasta reset
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 300
): Promise<RateLimitResult> {
  const key = rkey('rl', bucket, identifier);
  const current = await redis.incr(key);

  if (current === 1) {
    // Primera request de la ventana, setear TTL
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current <= limit,
    remaining,
    resetIn: ttl > 0 ? ttl : windowSeconds,
  };
}
