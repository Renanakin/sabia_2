/**
 * E2E tests del flujo de autenticación del superadmin
 * =====================================================
 *
 * Prerrequisitos:
 * - docker compose up -d  (Postgres, Redis, MinIO, Next.js, Nginx)
 * - npm run db:migrate
 * - npm run db:seed
 *
 * Credenciales de prueba (del seed):
 *   admin@sabiacontable.cl / Admin123!
 *   contador@sabiacontable.cl / Contador123!
 *   cliente@sabiacontable.cl / Cliente123!
 *
 * En Windows, los subdominios *.localhost resuelven a 127.0.0.1
 * automáticamente, no requiere editar el archivo hosts.
 */

import { test, expect } from '@playwright/test';

// URL del panel admin (subdominio)
const ADMIN_URL = 'http://admin.localhost:3010';

test.describe('Auth - Superadmin login', () => {
  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);

    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

    await page.getByLabel('Email').fill('admin@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('WrongPassword!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Mensaje genérico de credenciales inválidas
    await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible({
      timeout: 5000,
    });
  });

  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);

    await page.getByLabel('Email').fill('admin@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Admin123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Redirige al dashboard
    await page.waitForURL(`${ADMIN_URL}/`, { timeout: 10000 });

    // Dashboard cargado
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Instalaciones')).toBeVisible();
    await expect(page.getByText('Usuarios totales')).toBeVisible();
  });

  test('contador NO puede entrar al panel superadmin', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);

    await page.getByLabel('Email').fill('contador@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Contador123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    // El login es OK pero el form valida el rol y muestra error
    await expect(
      page.getByText('Esta cuenta no tiene permisos de superadmin.')
    ).toBeVisible({ timeout: 5000 });
  });

  test('logout limpia sesión y vuelve a /login', async ({ page }) => {
    // 1. Login
    await page.goto(`${ADMIN_URL}/login`);
    await page.getByLabel('Email').fill('admin@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Admin123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL(`${ADMIN_URL}/`, { timeout: 10000 });

    // 2. Logout
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    // 3. Vuelve a /login
    await page.waitForURL(`${ADMIN_URL}/login`, { timeout: 10000 });

    // 4. Verificar que /admin ya no carga el dashboard
    await page.goto(`${ADMIN_URL}/`);
    await page.waitForURL(`${ADMIN_URL}/login`, { timeout: 10000 });
  });
});

test.describe('Auth - Rate limit', () => {
  test.skip('login con 6+ intentos seguidos devuelve 429', async ({ page }) => {
    // Skipped: este test requiere resetear el rate limit en Redis entre runs
    // o esperar 5 minutos. Se deja como test de referencia para correr manualmente.
    await page.goto(`${ADMIN_URL}/login`);
    for (let i = 0; i < 6; i++) {
      await page.getByLabel('Email').fill('admin@sabiacontable.cl');
      await page.getByLabel('Contraseña').fill('WrongPassword!');
      await page.getByRole('button', { name: 'Ingresar' }).click();
      await page.waitForTimeout(500);
    }
    await expect(page.getByText('Demasiados intentos.')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Admin - Listado de instalaciones', () => {
  test('muestra instalaciones del seed', async ({ page }) => {
    // Login primero
    await page.goto(`${ADMIN_URL}/login`);
    await page.getByLabel('Email').fill('admin@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Admin123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL(`${ADMIN_URL}/`, { timeout: 10000 });

    // Ir a instalaciones
    await page.goto(`${ADMIN_URL}/instalaciones`);

    await expect(page.getByRole('heading', { name: 'Instalaciones' })).toBeVisible();

    // El seed crea una instalación "dev" — debería estar visible
    await expect(page.getByText('dev', { exact: true }).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
