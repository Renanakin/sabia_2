import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // dbCredentials es opcional para `generate` (solo lee schema).
  // `migrate` y `push` sí lo necesitan.
  ...(process.env.DATABASE_URL
    ? {
        dbCredentials: {
          url: process.env.DATABASE_URL,
        },
      }
    : {}),
  strict: true,
  verbose: true,
} satisfies Config;
