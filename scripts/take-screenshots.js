/**
 * Take screenshots of the running app for use in user/client manuals.
 *
 * Estrategia:
 *  - Las pantallas de LOGIN se capturan sin sesión (form vacío).
 *  - Las pantallas post-login se capturan autenticando vía API
 *    (`context.request.post('/api/auth/login', ...)`), que setea las
 *    cookies de sesión en el browser context de forma atómica.
 *  - Se navega por RUTAS ABSOLUTAS (sin subdominios) porque el middleware
 *    también responde a /admin, /contable, /portal/[slug] desde IP:puerto.
 *
 * Requires: docker compose up, npm run db:migrate, npm run db:seed
 * Usage:    node scripts/take-screenshots.js
 *
 * Outputs:  docs/screenshots/*.png  (12 imágenes)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://127.0.0.1:3010';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

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
  // pequeño delay para que fuentes/animaciones se asienten
  await page.waitForTimeout(500);
  const out = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`  ✓ ${name}.png`);
}

/** Autentica vía API y deja la cookie de sesión lista en el context. */
async function authInContext(context, creds) {
  const res = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email: creds.email, password: creds.password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    const text = await res.text().catch(() => '');
    throw new Error(`Login API ${res.status()}: ${text}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'es-CL',
  });

  // ============== 1. MARKETING (público) ==============
  console.log('\n[Marketing]');
  const landingPage = await context.newPage();
  await landingPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await snap(landingPage, '01-marketing-landing');
  await landingPage.close();

  // ============== 2. LOGIN superadmin (sin sesión) ==============
  console.log('\n[Superadmin]');
  await context.clearCookies();
  const adminLoginPage = await context.newPage();
  await adminLoginPage.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await snap(adminLoginPage, '02-admin-login');
  await adminLoginPage.close();

  // ============== 3-4. SUPERADMIN autenticado ==============
  await authInContext(context, CREDENTIALS.admin);
  const adminPage = await context.newPage();
  await adminPage.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await snap(adminPage, '03-admin-dashboard');

  await adminPage.goto(`${BASE}/admin/instalaciones`, { waitUntil: 'domcontentloaded' });
  await snap(adminPage, '04-admin-instalaciones');
  await adminPage.close();

  // ============== 5. LOGIN contador (sin sesión) ==============
  console.log('\n[Contador]');
  await context.clearCookies();
  const contLoginPage = await context.newPage();
  await contLoginPage.goto(`${BASE}/contable/login`, { waitUntil: 'domcontentloaded' });
  await snap(contLoginPage, '05-contador-login');
  await contLoginPage.close();

  // ============== 6-9. CONTADOR autenticado ==============
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

  // ============== 10. LOGIN cliente (sin sesión) ==============
  console.log('\n[Cliente]');
  await context.clearCookies();
  const cliLoginPage = await context.newPage();
  await cliLoginPage.goto(`${BASE}/portal/dev/login`, { waitUntil: 'domcontentloaded' });
  await snap(cliLoginPage, '10-cliente-login');
  await cliLoginPage.close();

  // ============== 11-12. CLIENTE autenticado ==============
  await authInContext(context, CREDENTIALS.cliente);
  const cliPage = await context.newPage();
  await cliPage.goto(`${BASE}/portal/dev`, { waitUntil: 'domcontentloaded' });
  await snap(cliPage, '11-cliente-dashboard');

  await cliPage.goto(`${BASE}/portal/dev/documentos`, { waitUntil: 'domcontentloaded' });
  await snap(cliPage, '12-cliente-documentos');
  await cliPage.close();

  await browser.close();
  console.log(`\n✅ 12 screenshots guardados en ${OUT_DIR}`);
})().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
