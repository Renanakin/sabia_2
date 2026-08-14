/**
 * take-screenshots-presentation.js
 * =================================
 * Igual a take-screenshots.js pero con `fullPage: false` — solo el viewport
 * 1440x900. Las imágenes entran limpias en una página A4 sin recortes.
 *
 * Output: docs/screenshots-presentation/*.png  (12 imágenes)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://127.0.0.1:3010';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots-presentation');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CREDENTIALS = {
  admin: { email: 'admin@sabiacontable.cl', password: 'Admin123!' },
  contador: { email: 'contador@sabiacontable.cl', password: 'Contador123!' },
  cliente: { email: 'cliente@sabiacontable.cl', password: 'Cliente123!' },
};

async function snap(page, name) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  const out = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function authInContext(context, creds) {
  const res = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) throw new Error(`Login API ${res.status()}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'es-CL',
  });

  // 1. Marketing
  console.log('\n[Marketing]');
  const landing = await context.newPage();
  await landing.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await snap(landing, '01-marketing-hero');
  await landing.close();

  // 2. Login superadmin
  console.log('\n[Superadmin]');
  await context.clearCookies();
  const adminLogin = await context.newPage();
  await adminLogin.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await snap(adminLogin, '02-admin-login');
  await adminLogin.close();

  await authInContext(context, CREDENTIALS.admin);
  const adminPage = await context.newPage();
  await adminPage.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await snap(adminPage, '03-admin-dashboard');
  await adminPage.goto(`${BASE}/admin/instalaciones`, { waitUntil: 'domcontentloaded' });
  await snap(adminPage, '04-admin-instalaciones');
  await adminPage.close();

  // 3. Login contador
  console.log('\n[Contador]');
  await context.clearCookies();
  const contLogin = await context.newPage();
  await contLogin.goto(`${BASE}/contable/login`, { waitUntil: 'domcontentloaded' });
  await snap(contLogin, '05-contador-login');
  await contLogin.close();

  await authInContext(context, CREDENTIALS.contador);
  const contPage = await context.newPage();
  await contPage.goto(`${BASE}/contable`, { waitUntil: 'domcontentloaded' });
  await snap(contPage, '06-contador-dashboard');
  await contPage.goto(`${BASE}/contable/clientes`, { waitUntil: 'domcontentloaded' });
  await snap(contPage, '07-contador-clientes');
  await contPage.goto(`${BASE}/contable/documentos`, { waitUntil: 'domcontentloaded' });
  await snap(contPage, '08-contador-cola-docs');
  await contPage.goto(`${BASE}/contable/subir`, { waitUntil: 'domcontentloaded' });
  await snap(contPage, '09-contador-subir');
  await contPage.close();

  // 4. Login cliente
  console.log('\n[Cliente]');
  await context.clearCookies();
  const cliLogin = await context.newPage();
  await cliLogin.goto(`${BASE}/portal/dev/login`, { waitUntil: 'domcontentloaded' });
  await snap(cliLogin, '10-cliente-login');
  await cliLogin.close();

  await authInContext(context, CREDENTIALS.cliente);
  const cliPage = await context.newPage();
  await cliPage.goto(`${BASE}/portal/dev`, { waitUntil: 'domcontentloaded' });
  await snap(cliPage, '11-cliente-dashboard');
  await cliPage.goto(`${BASE}/portal/dev/documentos`, { waitUntil: 'domcontentloaded' });
  await snap(cliPage, '12-cliente-documentos');
  await cliPage.close();

  await browser.close();
  console.log(`\n✅ 12 screenshots de presentación en ${OUT_DIR}`);
})().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
