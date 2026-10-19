import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import getPageContext, { pages, translate } from '../src/data/site.js';

const root = resolve(import.meta.dirname, '..');
process.chdir(root);

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
function leafKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => typeof child === 'string'
    ? [prefix + key] : leafKeys(child, prefix + key + '.'));
}
const spanish = JSON.parse(readFileSync('src/locales/es/translation.json', 'utf8'));
const english = JSON.parse(readFileSync('src/locales/en/translation.json', 'utf8'));
assert.deepEqual(leafKeys(spanish).sort(), leafKeys(english).sort(), 'Language keys must match');

const templates = files('src/partials').filter(file => file.endsWith('.hbs'));
const partials = new Set(templates.map(file => relative(resolve('src/partials'), file).replaceAll('\\', '/').replace(/\.hbs$/, '')));
for (const file of [...templates, ...pages.map(page => resolve(page.file))]) {
  const content = readFileSync(file, 'utf8');
  assert(!/\bstyle\s*=/.test(content), 'Inline style in ' + file);
  for (const [, name] of content.matchAll(/\{\{#?>\s*([^\s}]+)/g)) {
    if (name === '@partial-block') continue;
    assert(partials.has(name), 'Missing partial ' + name + ' in ' + file);
  }
  for (const [, key] of content.matchAll(/\bt\s+"([^"]+)"/g)) translate(key);
}
for (const page of pages) {
  assert(existsSync(page.file), 'Missing HTML entry: ' + page.file);
  assert(readFileSync(page.file, 'utf8').includes('{{#> layouts/page}}'), 'Missing shared layout');
  const context = getPageContext('/' + page.file);
  translate(context.page.titleKey);
  translate(context.page.headingKey);
  if (page.descriptionKey) translate(page.descriptionKey);
  for (const form of Object.values(context.forms)) {
    translate(form.submitKey);
    for (const section of form.sections) {
      if (section.titleKey) translate(section.titleKey);
      for (const field of section.fields) {
        translate(field.labelKey);
        if (field.placeholderKey) translate(field.placeholderKey);
        for (const option of field.options || []) translate(option.labelKey);
      }
    }
  }
}
const assets = JSON.parse(readFileSync('src/data/assets.json', 'utf8'));
const images = [
  ...assets.hero,
  ...assets.services.map(item => item.image),
  ...assets.projects.map(item => item.image),
  ...assets.testimonials.map(item => item.image),
  ...Object.values(assets.gallery).flat(),
];
for (const image of images) assert(existsSync(resolve('public', image.replace(/^\//, ''))), 'Missing image: ' + image);

for (const file of files('src/styles').filter(file => file.endsWith('.less'))) {
  for (const [, importPath] of readFileSync(file, 'utf8').matchAll(/@import\s+"([^"]+)"/g)) {
    assert(existsSync(resolve(dirname(file), importPath)), 'Missing style import in ' + file);
  }
}
console.log('Checked ' + pages.length + ' pages, ' + templates.length + ' partials, form definitions, images, styles and both locales.');
