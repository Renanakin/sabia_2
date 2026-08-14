/**
 * md-to-pdf.js
 * ============
 * Convierte un .md a PDF con branding Sabia, usando Playwright.
 *
 * Usage:
 *   node scripts/md-to-pdf.js <input.md> <output.pdf> [--cover="Título del manual"]
 *
 * Imágenes Markdown: las rutas relativas se resuelven contra el directorio
 * del .md de entrada, así `screenshots/01-foo.png` se convierte a
 * `file:///...docs/screenshots/01-foo.png` y el browser las carga.
 */

const { chromium } = require('playwright');
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');
const url = require('url');

function parseArgs(argv) {
  const args = { _: [], cover: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--cover=')) args.cover = a.slice('--cover='.length);
    else args._.push(a);
  }
  return args;
}

/** Convierte rutas relativas tipo screenshots/x.png a file:// absolutas. */
function absolutizeImages(html, baseDir) {
  return html.replace(
    /<img\s+([^>]*?)src="([^"]+)"/g,
    (m, attrs, src) => {
      if (/^(https?:|file:|data:)/i.test(src)) return m;
      const abs = path.resolve(baseDir, src);
      return `<img ${attrs}src="${url.pathToFileURL(abs).toString()}"`;
    }
  );
}

const CSS = `
  @page {
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
  }
  @page :first { margin: 0; }

  * { box-sizing: border-box; }
  html {
    font-size: 10.5pt;
    /* hyphenation hint for Chromium */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    background: #ffffff;
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
    hyphenate-limit-chars: 8 4 4;
  }

  /* ====== TIPOGRAFÍA SIN CORTES FEOS ====== */
  p {
    margin: 6pt 0;
    orphans: 4;       /* ≥ 4 líneas al inicio de página */
    widows: 4;        /* ≥ 4 líneas al final de página */
    page-break-inside: avoid;
    break-inside: avoid;
  }
  li {
    orphans: 3;
    widows: 3;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  h1, h2, h3, h4, h5 {
    page-break-after: avoid;
    break-after: avoid;
    text-align: left;
    hyphens: none;
    -webkit-hyphens: none;
  }
  h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #0f172a;
    margin: 24pt 0 10pt 0;
    padding-bottom: 8pt;
    border-bottom: 3px solid #ec4899;
  }
  h2 {
    font-size: 16pt;
    font-weight: 700;
    color: #0f172a;
    margin: 20pt 0 8pt 0;
    padding-bottom: 4pt;
    border-bottom: 1px solid #e2e8f0;
  }
  h3 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e293b;
    margin: 14pt 0 6pt 0;
  }
  h4 {
    font-size: 11pt;
    font-weight: 700;
    color: #334155;
    margin: 10pt 0 4pt 0;
  }
  strong { color: #0f172a; }
  a { color: #ec4899; text-decoration: none; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 1pt 5pt;
    border-radius: 3pt;
    color: #be185d;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12pt 14pt;
    border-radius: 6pt;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }
  blockquote {
    margin: 8pt 0;
    padding: 8pt 14pt;
    border-left: 4px solid #ec4899;
    background: #fdf2f8;
    color: #831843;
    border-radius: 0 6pt 6pt 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 14pt 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8pt 0;
    font-size: 10pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  th, td {
    text-align: left;
    padding: 6pt 9pt;
    border-bottom: 1px solid #e2e8f0;
    /* las celdas también sin cortes feos */
    page-break-inside: avoid;
  }
  th {
    background: #0f172a;
    color: #f1f5f9;
    font-weight: 600;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:nth-child(even) td { background: #f8fafc; }

  /* Imágenes: entran limpias o saltan a la siguiente página */
  img {
    max-width: 100%;
    max-height: 145mm;     /* no más altas que ~ 2/3 de página */
    width: auto;
    height: auto;
    display: block;
    margin: 10pt auto;
    border-radius: 6pt;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1pt 3pt rgba(15, 23, 42, 0.08);
    page-break-inside: avoid;
    break-inside: avoid;
    object-fit: contain;
  }
  p > img:only-child { margin: 10pt auto; }

  /* Si una imagen no entra al final de la página, sáltala entera */
  figure, .img-frame {
    page-break-inside: avoid;
    break-inside: avoid;
    margin: 10pt 0;
  }

  /* ====== PORTADA ====== */
  .cover {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    page-break-after: always;
    background:
      radial-gradient(ellipse at top right, #ec4899 0%, transparent 60%),
      linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: #f1f5f9;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.25) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 40%);
    pointer-events: none;
  }
  .cover-inner {
    position: relative;
    z-index: 1;
    padding: 30mm 24mm;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }
  .cover-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 14pt;
    letter-spacing: 0.5px;
  }
  .cover-brand .logo-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #ec4899;
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.25);
  }
  .cover-content { margin-top: 60mm; }
  .cover-eyebrow {
    display: inline-block;
    padding: 5px 12px;
    background: rgba(236, 72, 153, 0.18);
    border: 1px solid rgba(236, 72, 153, 0.4);
    color: #fbcfe8;
    border-radius: 999px;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .cover h1 {
    font-size: 36pt;
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 18px 0;
    color: #ffffff;
    letter-spacing: -0.5px;
  }
  .cover h1 span { color: #f472b6; }
  .cover-subtitle {
    font-size: 13pt;
    color: #cbd5e1;
    max-width: 130mm;
    line-height: 1.45;
  }
  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    color: #94a3b8;
    font-size: 9pt;
  }
  .cover-footer .meta { line-height: 1.7; }
  .cover-footer .meta strong { color: #e2e8f0; }
  .cover-footer .by {
    text-align: right;
    line-height: 1.7;
  }
  .cover-footer .by strong {
    color: #ec4899;
    letter-spacing: 2px;
    font-size: 11pt;
  }

  /* ====== CONTENIDO ====== */
  .content { padding: 0; }

  h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #0f172a;
    margin: 24pt 0 10pt 0;
    padding-bottom: 8pt;
    border-bottom: 3px solid #ec4899;
    page-break-after: avoid;
  }
  h2 {
    font-size: 16pt;
    font-weight: 700;
    color: #0f172a;
    margin: 20pt 0 10pt 0;
    padding-bottom: 4pt;
    border-bottom: 1px solid #e2e8f0;
    page-break-after: avoid;
  }
  h3 {
    font-size: 13pt;
    font-weight: 700;
    color: #1e293b;
    margin: 16pt 0 8pt 0;
    page-break-after: avoid;
  }
  h4 {
    font-size: 11pt;
    font-weight: 700;
    color: #334155;
    margin: 12pt 0 6pt 0;
    page-break-after: avoid;
  }
  p { margin: 6pt 0; }
  ul, ol { margin: 6pt 0; padding-left: 20pt; }
  li { margin: 3pt 0; }
  strong { color: #0f172a; }
  a { color: #ec4899; text-decoration: none; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 1pt 5pt;
    border-radius: 3pt;
    color: #be185d;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12pt 14pt;
    border-radius: 6pt;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }
  blockquote {
    margin: 10pt 0;
    padding: 8pt 14pt;
    border-left: 4px solid #ec4899;
    background: #fdf2f8;
    color: #831843;
    border-radius: 0 6pt 6pt 0;
    page-break-inside: avoid;
  }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 16pt 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  th, td {
    text-align: left;
    padding: 6pt 9pt;
    border-bottom: 1px solid #e2e8f0;
  }
  th {
    background: #0f172a;
    color: #f1f5f9;
    font-weight: 600;
    font-size: 9.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:nth-child(even) td { background: #f8fafc; }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 10pt auto;
    border-radius: 6pt;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1pt 3pt rgba(15, 23, 42, 0.08);
    page-break-inside: avoid;
  }
  /* Si la imagen está dentro de <p>, le sacamos el margen al <p> */
  p > img:only-child { margin: 10pt auto; }

  /* ====== FOOTER DE PÁGINA ====== */
  .page-footer {
    position: running(footer);
    text-align: center;
    color: #94a3b8;
    font-size: 8.5pt;
  }
`;

const HTML_TEMPLATE = ({ cover, body }) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${cover || 'Manual'}</title>
  <style>${CSS}</style>
</head>
<body>
  ${cover ? `
    <div class="cover">
      <div class="cover-inner">
        <div class="cover-brand">
          <span class="logo-dot"></span>
          <span>Sabia Contable</span>
        </div>
        <div class="cover-content">
          <span class="cover-eyebrow">Manual</span>
          <h1>${cover}</h1>
          <p class="cover-subtitle">
            Plataforma contable por empresa. Cada cliente con su propia instalación aislada, accesible por subdominio.
          </p>
        </div>
        <div class="cover-footer">
          <div class="meta">
            <div><strong>Versión</strong> &nbsp; 1.0</div>
            <div><strong>Fecha</strong> &nbsp; ${new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <div><strong>Stack</strong> &nbsp; Next.js + Postgres + Redis + MinIO</div>
          </div>
          <div class="by">
            <div>Desarrollado por</div>
            <strong>HACKTECK</strong>
          </div>
        </div>
      </div>
    </div>
  ` : ''}
  <div class="content">${body}</div>
</body>
</html>`;

async function main() {
  const { _, cover } = parseArgs(process.argv);
  if (_.length < 2) {
    console.error('Uso: node scripts/md-to-pdf.js <input.md> <output.pdf> [--cover="Título"]');
    process.exit(1);
  }
  const [input, output] = _;
  const absIn = path.resolve(input);
  const absOut = path.resolve(output);
  if (!fs.existsSync(absIn)) {
    console.error(`No existe: ${absIn}`);
    process.exit(1);
  }

  const md = fs.readFileSync(absIn, 'utf-8');
  const baseDir = path.dirname(absIn);
  const htmlBody = marked.parse(md, { gfm: true, breaks: false });
  const htmlBodyAbs = absolutizeImages(htmlBody, baseDir);
  const title = cover || path.basename(absIn, '.md').replace(/^./, (c) => c.toUpperCase());
  const fullHtml = HTML_TEMPLATE({ cover: title, body: htmlBodyAbs });

  // Playwright: render en Chromium y exportar PDF
  // Truco: setContent bloquea <img src="file://..."> por CSP, así que
  // guardamos el HTML a un archivo temporal y navegamos con file://.
  const tmpHtml = path.join(path.dirname(absIn), '_pdf-temp.html');
  fs.writeFileSync(tmpHtml, fullHtml, 'utf-8');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(url.pathToFileURL(tmpHtml).toString(), {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  // Asegurar que las imágenes (file://) terminaron de cargar
  await page.waitForTimeout(800);
  await page.evaluate(() => Promise.all(
    Array.from(document.images).map((img) =>
      img.complete ? Promise.resolve() :
      new Promise((res) => { img.onload = res; img.onerror = res; })
    )
  ));

  await page.pdf({
    path: absOut,
    format: 'A4',
    printBackground: true,
    margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font-size:8.5pt;color:#94a3b8;padding:0 18mm;display:flex;justify-content:space-between;">
      <span>Sabia Contable · ${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>
    </div>`,
    footerTemplate: `<div style="width:100%;font-size:8.5pt;color:#94a3b8;padding:0 18mm;display:flex;justify-content:space-between;">
      <span>HackTeck · Manual v1.0</span>
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>`,
  });

  await browser.close();
  // Limpiar HTML temporal
  try { fs.unlinkSync(tmpHtml); } catch (_) {}

  const stat = fs.statSync(absOut);
  console.log(`✅ ${path.basename(absOut)}  (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
