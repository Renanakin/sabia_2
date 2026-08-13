/**
 * E2E tests del portal del cliente
 * ===================================
 *
 * Prerrequisitos: docker compose up + db:migrate + db:seed
 *
 * Credenciales del seed:
 *   cliente@sabiacontable.cl / Cliente123!  (asignado a Empresa Demo SpA)
 */

import { test, expect } from '@playwright/test';

const PORTAL_URL = 'http://dev.localhost:3010';

test.describe('Portal - Login del cliente', () => {
  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto(`${PORTAL_URL}/login`);

    await page.getByLabel('Email').fill('cliente@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Cliente123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await page.waitForURL(`${PORTAL_URL}/`, { timeout: 10000 });

    // Dashboard muestra el nombre del cliente
    await expect(page.getByText('Bienvenido, Empresa Demo SpA')).toBeVisible({
      timeout: 5000,
    });
  });

  test('login con rol incorrecto (superadmin) es rechazado', async ({ page }) => {
    await page.goto(`${PORTAL_URL}/login`);

    await page.getByLabel('Email').fill('admin@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Admin123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(
      page.getByText('Esta cuenta no corresponde a un cliente.')
    ).toBeVisible({ timeout: 5000 });
  });

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto(`${PORTAL_URL}/login`);

    await page.getByLabel('Email').fill('cliente@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('WrongPassword!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Portal - Documentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PORTAL_URL}/login`);
    await page.getByLabel('Email').fill('cliente@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Cliente123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL(`${PORTAL_URL}/`, { timeout: 10000 });
  });

  test('dashboard muestra KPIs y documentos recientes', async ({ page }) => {
    await expect(page.getByText('Documentos disponibles')).toBeVisible();
    await expect(page.getByText('Período actual')).toBeVisible();
    // El seed crea 3 documentos visibles (F29, Balance, Libro Mayor de Julio)
    await expect(page.getByText('F29_Julio_2026.pdf').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('lista de documentos muestra solo los visibles (no los pending)', async ({ page }) => {
    await page.goto(`${PORTAL_URL}/documentos`);

    await expect(page.getByRole('heading', { name: 'Mis documentos' })).toBeVisible();

    // Visibles del seed
    await expect(page.getByText('F29_Julio_2026.pdf').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('Balance_Julio_2026.pdf').first()).toBeVisible();

    // NO debe estar el documento no publicado
    await expect(page.getByText('BV_001_2026-08.pdf')).not.toBeVisible();
  });

  test('botón Descargar genera link firmado', async ({ page }) => {
    await page.goto(`${PORTAL_URL}/documentos`);

    // Interceptar la request de download
    let downloadUrl: string | null = null;
    page.on('response', async (response) => {
      if (response.url().includes('/download') && response.ok()) {
        try {
          const body = await response.json();
          downloadUrl = body.data?.url;
        } catch {
          // ignore
        }
      }
    });

    const firstDownload = page.getByRole('button', { name: 'Descargar' }).first();
    await firstDownload.click();

    // Esperar un poco a que se genere el link
    await page.waitForTimeout(1500);

    expect(downloadUrl).not.toBeNull();
    // La URL firmada de MinIO contiene el host y el bucket
    if (downloadUrl) {
      expect(downloadUrl).toContain('localhost:9000');
    }
  });
});
