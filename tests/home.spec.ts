import { test, expect } from '@playwright/test';

test.describe('Flujo E2E - Sabia Contable', () => {
  test('La página principal carga correctamente y navega a contacto', async ({ page }) => {
    // 1. Visitar la página principal
    await page.goto('/');
    
    // 2. Verificar el título en el hero
    await expect(page.locator('h1')).toContainText('¡Lleva la Contabilidad de tu Empresa');

    // 3. Hacer click en el botón "Agendar Asesoría"
    const agendarBtn = page.getByRole('link', { name: /Agenda tu Asesoría|Agendar Asesoría Gratuita/i });
    await expect(agendarBtn).toBeVisible();
    await agendarBtn.click();

    // 4. Verificar que navegamos a la página de contacto
    await expect(page).toHaveURL(/\/contacto/);
    await expect(page.locator('h1')).toContainText('Conversemos');

    // 5. Verificar que el formulario existe
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="user_name"]')).toBeVisible();
    await expect(page.locator('input[name="user_email"]')).toBeVisible();
    await expect(page.locator('input[name="user_phone"]')).toBeVisible();
  });
});
