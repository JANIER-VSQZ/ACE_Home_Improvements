// Integration checks against the compiled multi-page site.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import { pages } from '../src/data/site.js';

process.chdir(resolve(import.meta.dirname, '..'));
const candidates = process.platform === 'win32' ? [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
] : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const executable = process.env.BROWSER_PATH || candidates.find(path => existsSync(path));
if (!executable) throw new Error('Set BROWSER_PATH to a Chrome or Chromium executable.');

const locales = Object.fromEntries(await Promise.all(['es', 'en'].map(async language => [
  language, JSON.parse(await readFile('src/locales/' + language + '/translation.json', 'utf8')),
])));
const dist = resolve('dist');
assert(existsSync(dist), 'Run npm run build first.');
const basePath = process.env.SMOKE_BASE || '/';
const requests = [];
const missingResources = [];
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  requests.push({ method: req.method, url: req.url });
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') return res.writeHead(204).end();
    assert(pathname.startsWith(basePath), 'Asset outside configured base');
    const relativePath = pathname.slice(basePath.length) || 'index.html';
    const file = resolve(dist, relativePath);
    assert(file.startsWith(dist + sep), 'Asset outside dist');
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    missingResources.push(req.url);
    res.writeHead(404).end();
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = 'http://127.0.0.1:' + server.address().port;
const baseUrl = origin + basePath;
const profile = await mkdtemp(join(tmpdir(), 'ace-smoke-'));
const browser = spawn(executable, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;

try {
  const address = await new Promise((done, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Browser startup timed out')), 20000);
    browser.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); done(match[1]); }
    });
    browser.on('error', error => { clearTimeout(timer); reject(error); });
    browser.on('exit', code => { clearTimeout(timer); reject(new Error('Browser exited: ' + code)); });
  });
  socket = new WebSocket(address);
  await new Promise((done, reject) => {
    socket.addEventListener('open', done);
    socket.addEventListener('error', reject);
  });

  let nextId = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      clearTimeout(handler.timer);
      if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
      else handler.done(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params);
  });
  function send(method, params = {}, sessionId) {
    return new Promise((done, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000);
      pending.set(id, { done, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  await command('Page.enable');
  await command('Runtime.enable');
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function until(expression) {
    const limit = Date.now() + 15000;
    while (Date.now() < limit) {
      if (await evaluate(expression)) return;
      await new Promise(done => setTimeout(done, 75));
    }
    throw new Error('Timed out: ' + expression);
  }
  async function navigate(file, language = 'es', extra = '') {
    await command('Page.navigate', { url: baseUrl + file + '?lang=' + language + extra });
    await until("location.pathname.endsWith('" + file + "') && document.readyState === 'complete' && document.querySelector('[data-language=\"" + language + "\"]')?.getAttribute('aria-pressed') === 'true'");
  }
  async function viewport(width, height = 900) {
    await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  }
  const fill = values => evaluate('for (const [id, value] of Object.entries(' + JSON.stringify(values) + ')) { const field = document.getElementById(id); field.value = value; field.dispatchEvent(new Event(field.tagName === "SELECT" ? "change" : "input", { bubbles: true })); }');
  const submit = id => evaluate('document.getElementById(' + JSON.stringify(id) + ').requestSubmit()');

  for (const language of ['es', 'en']) {
    for (const page of pages) {
      await viewport(1440);
      await navigate(page.file, language);
      const snapshot = await evaluate("({ main: document.querySelectorAll('main').length, h1: document.querySelectorAll('h1').length, ids: [...document.querySelectorAll('[id]')].map(el => el.id), bindings: [...document.querySelectorAll('[data-i18n]')].map(el => ({ key: el.dataset.i18n, text: el.textContent, attributes: Object.fromEntries([...el.attributes].map(attr => [attr.name, attr.value])) })), links: [...document.querySelectorAll('a[href]')].map(a => a.href), brokenImages: [...document.images].filter(img => img.loading !== 'lazy' && img.complete && !img.naturalWidth).map(img => img.src) })");
      assert.equal(snapshot.main, 1, page.file);
      assert.equal(snapshot.h1, 1, page.file);
      assert.equal(new Set(snapshot.ids).size, snapshot.ids.length, 'Duplicate IDs: ' + page.file);
      assert.deepEqual(snapshot.brokenImages, [], 'Broken images: ' + page.file);
      for (const binding of snapshot.bindings) {
        for (const entry of binding.key.split(';')) {
          const [, attribute, key] = entry.match(/^(?:\[([^\]]+)\])?(.+)$/);
          const expected = key.split('.').reduce((parent, part) => parent?.[part], locales[language]);
          assert.equal(typeof expected, 'string', 'Missing locale key: ' + key);
          assert.equal(attribute ? binding.attributes[attribute] : binding.text, expected, language + ': ' + key);
        }
      }
      for (const href of snapshot.links) {
        const url = new URL(href);
        if (url.origin === origin && url.pathname.endsWith('.html')) assert.equal(url.searchParams.get('lang'), language, href);
      }
      for (const width of [320, 390, 768, 1024]) {
        await viewport(width);
        assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), true, 'Horizontal overflow ' + page.file + ' at ' + width);
      }
      console.log('PASS ' + language + ' ' + page.file + ': semantics, translations, assets, links and responsive widths');
    }
  }

  await navigate('index.html');
  await viewport(390, 844);
  await evaluate("document.querySelector('[data-menu-toggle]').click()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-menu]')).display"), 'flex');
  await evaluate("document.querySelector('[data-dropdown-toggle]').click()");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.navigation__submenu')).display"), 'block');
  await evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))");
  assert.equal(await evaluate("document.querySelector('[data-dropdown-toggle]').getAttribute('aria-expanded')"), 'false');
  await evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))");
  assert.equal(await evaluate("document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded')"), 'false');

  await navigate('mesaEmpleos.html', 'en');
  assert.equal(await evaluate("document.querySelectorAll('form').length"), 1);
  await submit('jobForm');
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 4);
  assert.equal(await evaluate('document.activeElement.id'), 'puesto');
  assert.equal(await evaluate("getComputedStyle(document.getElementById('puesto')).borderTopColor"), 'rgb(180, 35, 24)');
  await submit('jobForm');
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 4);
  await fill({ puesto: '14', name: 'Ana123', email: 'invalid', phone: '123' });
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 3);
  assert.equal(await evaluate("document.querySelectorAll('[data-job-details]:not([hidden])').length"), 1);
  await evaluate("document.querySelector('[data-language=\"es\"]').click()");
  await until("document.getElementById('nameError').textContent.includes('nombre válido')");
  await fill({ name: 'Ana María', email: 'ana@example.com', phone: '2019513723' });
  await submit('jobForm');
  assert.equal(await evaluate("document.querySelector('[data-demo-status]').hidden"), false);
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 0);

  await navigate('cotizaciones.html', 'en', '&boton=Siding');
  assert.equal(await evaluate("document.getElementById('txtObservacion').required"), false);
  await fill({ txtDimensiones: '120,5', txtCondicion: 'Good', txtUbicacion: '07024', txtNombre: 'Ana', txtApellido: 'Lopez', txtCorreo: 'ana@example.com', txtTelefono: '+1 (201) 951-3723' });
  await submit('frmCotizacion');
  assert.equal(await evaluate("document.querySelector('[data-demo-status]').hidden"), false);
  await fill({ txtDimensiones: '0' });
  await submit('frmCotizacion');
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 1);
  await evaluate("document.querySelector('[data-language=\"es\"]').click()");
  await until("document.getElementById('txtDimensionesError').textContent.includes('mayor que cero')");
  assert.equal(await evaluate("document.getElementById('txtNombre').value"), 'Ana');
  assert.equal(await evaluate("new URL(location.href).searchParams.get('boton')"), 'Siding');

  await navigate('contactenos.html', 'en');
  await submit('contactForm');
  assert.equal(await evaluate("document.querySelectorAll('[data-validation-error]').length"), 3);
  await fill({ nombre: 'Ana María', correo: 'ana@example.com', mensaje: 'Test message' });
  await submit('contactForm');
  assert.equal(await evaluate("document.querySelector('[data-demo-status]').hidden"), false);

  await navigate('galeria.html', 'en');
  await evaluate("document.querySelector('[data-gallery-tab=\"tools\"]').click()");
  assert.equal(await evaluate("document.querySelector('[data-gallery-panel=\"work\"]').hidden"), true);
  assert.equal(await evaluate("document.querySelector('[data-gallery-panel=\"tools\"]').hidden"), false);
  await evaluate("document.querySelector('[data-gallery-tab=\"tools\"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))");
  assert.equal(await evaluate("document.querySelector('[data-gallery-tab=\"work\"]').getAttribute('aria-selected')"), 'true');

  await navigate('preguntasFrecuentes.html', 'en');
  assert.equal(await evaluate("document.querySelectorAll('.faq-item').length"), 10);
  await evaluate("document.querySelector('.faq-item__question').click()");
  assert.equal(await evaluate("document.querySelector('.faq-item__answer').hidden"), false);
  await fill({ 'faq-search': 'warranty' });
  assert.equal(await evaluate("document.querySelectorAll('.faq-item').length"), 1);
  assert.match(await evaluate("document.querySelector('.faq-item__answer').textContent"), /warranty/);

  await navigate('servicios.html', 'en', '&SRV=Techos%20de%20asfalto');
  assert.equal(await evaluate("document.activeElement.dataset.serviceName"), 'Techos de asfalto');
  assert.equal(requests.filter(request => request.method !== 'GET').length, 0, 'Demo forms sent a request');
  assert.deepEqual(missingResources, [], 'Missing local resources');
  assert.deepEqual(exceptions, [], 'Browser exceptions');

  await mkdir('.artifacts', { recursive: true });
  for (const [name, width, height, page] of [
    ['home-mobile', 390, 844, 'index.html'],
    ['home-desktop', 1440, 1000, 'index.html'],
    ['jobs-mobile', 390, 844, 'mesaEmpleos.html'],
    ['quotes-desktop', 1440, 1000, 'cotizaciones.html'],
  ]) {
    await viewport(width, height);
    await navigate(page);
    const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile('.artifacts/' + name + '.png', Buffer.from(screenshot.data, 'base64'));
  }
  console.log('PASS menus, all three forms, localization of errors, job selection, gallery tabs, FAQ filtering and service links.');
  console.log('PASS zero submissions, missing local resources or browser exceptions. Screenshots: .artifacts/');
} finally {
  socket?.close();
  browser.kill();
  await new Promise(done => server.close(done));
  assert(profile.startsWith(join(tmpdir(), 'ace-smoke-')));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }).catch(error => console.warn('Temporary profile cleanup: ' + error.code));
}
