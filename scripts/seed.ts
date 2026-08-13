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
 *
 * NOTA: usa una conexión directa a Postgres para evitar el
 * `import 'server-only'` que rompe en scripts tsx.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import * as schema from '../src/lib/db/schema';
const { installations, users, accountingClients, userClientAccess, documents } = schema;
import { hashPassword } from '../src/lib/auth/password';

// Conexión directa para evitar `import 'server-only'` del client.ts
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL no definida');
  process.exit(1);
}
const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

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
  console.log('\n4/5 Asignando accesos...');
  // 4a. Asignar contador al cliente (admin)
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
      console.log('   ⏭️  Asignación contador ya existe, skip');
    }
  }

  // 4b. Asignar cliente (usuario final) al cliente contable (read_only)
  const clienteUser = await db.query.users.findFirst({
    where: (u, { and, eq }) =>
      and(
        eq(u.installationId, installation!.id),
        eq(u.email, 'cliente@sabiacontable.cl')
      ),
  });
  if (clienteUser) {
    const existingAccess = await db.query.userClientAccess.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.userId, clienteUser.id), eq(a.clientId, client!.id)),
    });
    if (!existingAccess) {
      await db.insert(userClientAccess).values({
        userId: clienteUser.id,
        clientId: client!.id,
        accessLevel: 'read_only',
      });
      console.log('   ✅ Cliente (usuario) asignado al cliente contable (read_only)');
    } else {
      console.log('   ⏭️  Asignación cliente ya existe, skip');
    }
  }

  // 5. Documentos de ejemplo
  console.log('\n5/5 Creando documentos de ejemplo...');
  const sampleDocs = [
    {
      period: '2026-07',
      documentType: 'f29' as const,
      fileName: 'F29_Julio_2026.pdf',
      visibleToClient: true,
      status: 'published' as const,
    },
    {
      period: '2026-07',
      documentType: 'balance' as const,
      fileName: 'Balance_Julio_2026.pdf',
      visibleToClient: true,
      status: 'published' as const,
    },
    {
      period: '2026-07',
      documentType: 'libro_mayor' as const,
      fileName: 'Libro_Mayor_Julio_2026.pdf',
      visibleToClient: true,
      status: 'published' as const,
    },
    {
      period: '2026-08',
      documentType: 'boleta_venta' as const,
      fileName: 'BV_001_2026-08.pdf',
      visibleToClient: false, // aún no publicado
      status: 'pending' as const,
    },
    {
      period: '2026-08',
      documentType: 'factura_compra' as const,
      fileName: 'FC_1234_Proveedor.pdf',
      visibleToClient: false,
      status: 'in_review' as const,
    },
  ];

  let docsCreated = 0;
  for (const d of sampleDocs) {
    const existing = await db.query.documents.findFirst({
      where: (doc, { and, eq }) =>
        and(
          eq(doc.clientId, client!.id),
          eq(doc.fileName, d.fileName)
        ),
    });
    if (existing) continue;
    const storagePath = `${installation!.slug}/${client!.id}/${d.period}/${d.fileName}`;
    const fileHash = createHash('sha256').update(storagePath).digest('hex');
    await db.insert(documents).values({
      clientId: client!.id,
      period: d.period,
      documentType: d.documentType,
      fileName: d.fileName,
      storagePath,
      fileHash,
      fileSize: '102400',
      mimeType: 'application/pdf',
      status: d.status,
      visibleToClient: d.visibleToClient,
      publishedAt: d.visibleToClient ? new Date() : null,
      publishedBy: d.visibleToClient ? contador?.id ?? null : null,
      uploadedBy: contador?.id ?? null,
    });
    docsCreated++;
  }
  console.log(`   ✅ ${docsCreated} documento(s) creado(s) (3 visibles, 2 internos)`);

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

seed().catch(async (err) => {
  console.error('❌ Error en seed:', err);
  await client.end();
  process.exit(1);
}).then(async () => {
  await client.end();
});
