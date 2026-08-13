/**
 * Script de migración — corre las migraciones pendientes de Drizzle.
 * Uso: `npm run db:migrate`
 *
 * IMPORTANTE: usar el usuario `sabia_migrator` (con SUPERUSER) en producción.
 * El usuario `sabia_user` de aplicación NO debe correr migraciones.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
  }

  console.log('🔄 Corriendo migraciones...');
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migraciones aplicadas');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
