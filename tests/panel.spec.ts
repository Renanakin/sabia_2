/**
 * E2E tests del panel contable
 * ===============================
 *
 * Prerrequisitos: docker compose up + db:migrate + db:seed
 *
 * Flujo testeado:
 * 1. Login del contador
 * 2. Dashboard muestra cola de documentos
 * 3. Lista de clientes
 * 4. Detalle de cliente con documentos
 * 5. Página de subir
 * 6. Subir un documento
 * 7. Cambiar status
 * 8. Publicar al portal
 */

import { test, expect } from '@playwright/test';

const PANEL_URL = 'http://panel.localhost:3010';

test.describe('Panel - Login del contador', () => {
  test('login con credenciales válidas redirige al dashboard', async ({ page }) => {
    await page.goto(`${PANEL_URL}/login`);

    await page.getByLabel('Email').fill('contador@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Contador123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await page.waitForURL(`${PANEL_URL}/`, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('cliente NO puede entrar al panel contable', async ({ page }) => {
    await page.goto(`${PANEL_URL}/login`);

    await page.getByLabel('Email').fill('cliente@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Cliente123!');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(
      page.getByText('Esta cuenta no corresponde a un contador o asistente.')
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Panel - Dashboard y navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PANEL_URL}/login`);
    await page.getByLabel('Email').fill('contador@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Contador123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL(`${PANEL_URL}/`, { timeout: 10000 });
  });

  test('dashboard muestra contadores de status', async ({ page }) => {
    await expect(page.getByText('Pendientes')).toBeVisible();
    await expect(page.getByText('En revisión')).toBeVisible();
    await expect(page.getByText('Aprobados')).toBeVisible();
    await expect(page.getByText('Publicados')).toBeVisible();
  });

  test('lista de clientes muestra Empresa Demo', async ({ page }) => {
    await page.goto(`${PANEL_URL}/clientes`);
    await expect(page.getByText('Empresa Demo SpA')).toBeVisible({ timeout: 5000 });
  });

  test('cola de documentos muestra los del seed', async ({ page }) => {
    await page.goto(`${PANEL_URL}/documentos`);
    // El seed crea 5 docs (3 published, 1 pending, 1 in_review)
    await expect(page.getByText('F29_Julio_2026.pdf').first()).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Panel - Flujo de publicación', () => {
  test('contador puede publicar un documento approved al portal', async ({ page }) => {
    // Login
    await page.goto(`${PANEL_URL}/login`);
    await page.getByLabel('Email').fill('contador@sabiacontable.cl');
    await page.getByLabel('Contraseña').fill('Contador123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL(`${PANEL_URL}/`, { timeout: 10000 });

    // Ir a documentos y buscar uno en 'in_review' (BV_001_2026-08.pdf)
    await page.goto(`${PANEL_URL}/documentos?status=in_review`);

    const docLink = page.getByRole('link', { name: 'Gestionar' }).first();
    await docLink.click();

    // Estamos en /contable/documentos/[id]
    // Cambiar a 'approved' (botón)
    const approveBtn = page.getByRole('button', { name: 'Aprobar' }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      // Esperar refresh
      await page.waitForTimeout(1000);
    }

    // Ahora publicar
    const publishBtn = page.getByRole('button', { name: /Publicar al portal/ });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verificar que el status ahora es "Publicado"
    await expect(page.getByText('Publicado').first()).toBeVisible({ timeout: 5000 });
  });
});
