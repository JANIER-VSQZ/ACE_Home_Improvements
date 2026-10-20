import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSubmission, sendSubmission } from '../src/scripts/forms/submission.js';

const dictionaries = Object.fromEntries(['es', 'en'].map(language => [
  language, JSON.parse(readFileSync(new URL('../src/locales/' + language + '/translation.json', import.meta.url), 'utf8')),
]));
const context = language => ({
  translate: key => key.split('.').reduce((parent, part) => parent?.[part], dictionaries[language]),
  pageUrl: 'https://example.com/ace/cotizaciones.html?lang=' + language + '&boton=Siding',
  language,
});
const endpoint = 'https://formsubmit.co/ajax/test@example.com';
const accepted = success => new Response(JSON.stringify({ success }), { headers: { 'Content-Type': 'application/json' } });

test('quotes include every field, readable units, requested service and the reply email', () => {
  const values = {
    Dimensiones: '120,5', Unidad: 'm2', Condicion: 'Good', Ubicacion: '07024',
    Observacion: 'Repair the siding', Nombre: ' Ana ', Apellido: 'María',
    Correo: ' ana@example.com ', Telefono: '+1 (201) 951-3723', _honey: '',
  };
  const options = context('en');
  const payload = buildSubmission('quotes', values, options);
  assert.equal(payload.email, 'ana@example.com');
  assert.equal(payload._subject, dictionaries.en.formularios.asuntos.cotizacion);
  assert.equal(payload._url, 'https://example.com/ace/cotizaciones.html');
  assert.equal(payload._template, 'table');
  assert.equal(payload._honey, '');
  const fields = dictionaries.en.cotizaciones.campos;
  for (const name of ['Dimensiones', 'Condicion', 'Ubicacion', 'Observacion', 'Nombre', 'Apellido', 'Correo', 'Telefono']) {
    assert.equal(payload[fields[name].label], values[name].trim(), name);
  }
  assert.equal(payload[dictionaries.en.cotizaciones.unidad], dictionaries.en.cotizaciones.metros);
  assert.equal(payload['Requested service'], 'Siding');
  assert.equal(payload['Form language'], 'en');
});

test('job applications send the selected position name instead of its numeric index', () => {
  const options = { ...context('es'), pageUrl: 'https://example.com/ace/mesaEmpleos.html' };
  const payload = buildSubmission('jobs', {
    puesto: '14', nombre: 'Ana María', email: 'ana@example.com', telefono: '2019513723',
  }, options);
  assert.equal(payload[dictionaries.es.empleos.puesto], dictionaries.es.empleos.items[14].plaza);
  assert.equal(payload._subject, dictionaries.es.formularios.asuntos.empleo);
  assert.equal(payload.email, 'ana@example.com');
  assert.equal(payload[dictionaries.es.empleos.telefono], '2019513723');
});

test('contact messages retain their text and map the sender email for replies', () => {
  const payload = buildSubmission('contact', {
    nombre: 'Ana María', correo: 'ana@example.com', mensaje: 'Hola\nNecesito una cotización.', _honey: 'bot',
  }, { ...context('es'), pageUrl: 'https://example.com/ace/contactenos.html' });
  assert.equal(payload[dictionaries.es.contacto.labelMensaje], 'Hola\nNecesito una cotización.');
  assert.equal(payload.email, 'ana@example.com');
  assert.equal(payload._honey, 'bot');
  assert.equal(payload._subject, dictionaries.es.formularios.asuntos.contacto);
});

test('submission uses a credential-free JSON POST and accepts both provider success formats', async () => {
  for (const success of [true, 'true']) {
    await sendSubmission(endpoint, { email: 'ana@example.com', mensaje: 'Hola' }, {
      fetcher: async (url, options) => {
        assert.equal(url, endpoint);
        assert.equal(options.method, 'POST');
        assert.equal(options.credentials, 'omit');
        assert.equal(options.headers.Accept, 'application/json');
        assert.equal(options.headers['Content-Type'], 'application/json');
        assert.deepEqual(JSON.parse(options.body), { email: 'ana@example.com', mensaje: 'Hola' });
        assert(options.signal instanceof AbortSignal);
        return accepted(success);
      },
    });
  }
});

test('HTTP errors and unsuccessful or malformed provider responses never count as sent', async () => {
  for (const response of [
    new Response('{"success":true}', { status: 503 }),
    accepted(false), accepted('false'), accepted(undefined),
    new Response('<html>Service unavailable</html>'),
  ]) {
    await assert.rejects(sendSubmission(endpoint, {}, { fetcher: async () => response }), { reason: 'error' });
  }
});

test('an activation response is reported separately from a successful submission', async () => {
  await assert.rejects(sendSubmission(endpoint, {}, {
    fetcher: async () => new Response(JSON.stringify({ success: 'false', message: 'This form needs Activation.' })),
  }), { reason: 'activacion' });
});

test('a network failure is reported as an error', async () => {
  await assert.rejects(sendSubmission(endpoint, {}, {
    fetcher: async () => { throw new TypeError('Failed to fetch'); },
  }), { reason: 'error' });
});

test('a stalled submission is aborted and reported as a timeout', async () => {
  await assert.rejects(sendSubmission(endpoint, {}, {
    timeout: 10,
    fetcher: (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
  }), { reason: 'tiempoAgotado' });
});
