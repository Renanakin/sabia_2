/**
 * Script de seed para desarrollo
 * ===============================
 *
 * Crea:
 * - 1 instalación (slug=dev)
 * - 1 superadmin (admin@sabiacontable.cl / Admin123!)
 * - 1 contador (contador@sabiacontable.cl / Contador123!)
 * - 1 cliente contable (Empresa Demo SpA, RUT 76.123.456-7)
 * - Asignación user_client_access para el contador
 *
 * ⚠️ SOLO PARA DESARROLLO. NO usar en producción.
 *    En prod, los usuarios se crean vía onboarding (ver Fase 9).
 *
 * Uso: `npm run db:seed` (con docker compose levantado)
 */

import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { db } from '../src/lib/db/client';
import {
  installations,
  users,
  accountingClients,
  userClientAccess,
} from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/auth/password';

function generateTokenHash(): string {
  return createHash('sha256')
    .update(randomBytes(48).toString('base64url'))
    .digest('hex');
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Instalación
  console.log('1/4 Creando instalación dev...');
  let installation = await db.query.installations.findFirst({
    where: eq(installations.slug, 'dev'),
  });

  if (!installation) {
    const inserted = await db
      .insert(installations)
      .values({
        slug: 'dev',
        subdomain: 'dev.localhost',
        status: 'active',
        panelApiTokenHash: generateTokenHash(),
        dbName: 'sabia_dev',
        storageBucket: 'sabia-dev',
      })
      .returning();
    installation = inserted[0];
  }

  console.log(`   ✅ Instalación: ${installation!.slug} (${installation!.id})`);

  // 2. Usuarios
  console.log('\n2/4 Creando usuarios...');
  const usersToCreate = [
    {
      email: 'admin@sabiacontable.cl',
      fullName: 'Super Admin',
      role: 'superadmin' as const,
      password: 'Admin123!',
    },
    {
      email: 'contador@sabiacontable.cl',
      fullName: 'Contador Demo',
      role: 'contador' as const,
      password: 'Contador123!',
    },
    {
      email: 'cliente@sabiacontable.cl',
      fullName: 'Cliente Demo',
      role: 'cliente' as const,
      password: 'Cliente123!',
    },
  ];

  for (const u of usersToCreate) {
    const existing = await db.query.users.findFirst({
      where: (users, { and, eq }) =>
        and(eq(users.installationId, installation!.id), eq(users.email, u.email)),
    });
    if (existing) {
      console.log(`   ⏭️  ${u.email} ya existe, skip`);
      continue;
    }
    const passwordHash = await hashPassword(u.password);
    await db.insert(users).values({
      installationId: installation!.id,
      email: u.email,
      passwordHash,
      fullName: u.fullName,
      role: u.role,
      active: true,
    });
    console.log(`   ✅ ${u.email} (${u.role})`);
  }

  // 3. Cliente contable
  console.log('\n3/4 Creando cliente contable...');
  let client = await db.query.accountingClients.findFirst({
    where: (c, { and, eq }) =>
      and(
        eq(c.installationId, installation!.id),
        eq(c.rut, '76.123.456-7')
      ),
  });
  if (!client) {
    const inserted = await db
      .insert(accountingClients)
      .values({
        installationId: installation!.id,
        rut: '76.123.456-7',
        legalName: 'Empresa Demo SpA',
        taxRegime: 'general',
      })
      .returning();
    client = inserted[0];
  }
  console.log(`   ✅ ${client!.legalName} (RUT: ${client!.rut})`);

  // 4. Asignación contador → cliente
  console.log('\n4/4 Asignando contador al cliente...');
  const contador = await db.query.users.findFirst({
    where: (u, { and, eq }) =>
      and(
        eq(u.installationId, installation!.id),
        eq(u.email, 'contador@sabiacontable.cl')
      ),
  });
  if (contador) {
    const existingAccess = await db.query.userClientAccess.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.userId, contador.id), eq(a.clientId, client!.id)),
    });
    if (!existingAccess) {
      await db.insert(userClientAccess).values({
        userId: contador.id,
        clientId: client!.id,
        accessLevel: 'admin',
      });
      console.log('   ✅ Contador asignado al cliente (admin)');
    } else {
      console.log('   ⏭️  Asignación ya existe, skip');
    }
  }

  console.log('\n✨ Seed completo.\n');
  console.log('Credenciales de prueba:');
  console.log('  Superadmin:  admin@sabiacontable.cl      / Admin123!');
  console.log('  Contador:    contador@sabiacontable.cl    / Contador123!');
  console.log('  Cliente:     cliente@sabiacontable.cl     / Cliente123!');
  console.log('\nLevantar el dev server:');
  console.log('  docker compose up -d');
  console.log('  npm run db:migrate && npm run db:seed');
  console.log('  npm run dev:equipo');
  console.log('\nLuego abrir:');
  console.log('  http://admin.localhost:80   (panel superadmin)');
  console.log('  http://panel.localhost:80   (panel contable)');
  console.log('  http://dev.localhost:80     (portal cliente dev)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
