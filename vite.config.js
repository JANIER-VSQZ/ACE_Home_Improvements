import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import htmlPurge from 'vite-plugin-purgecss';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import getPageContext, { pages, translate, assetUrl } from './src/data/site.js';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  appType: 'mpa',
  base: process.env.DEPLOY_BASE_URL || '/',
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map(page => [page.id, root + page.file])),
    },
  },
  plugins: [
    handlebars({
      partialDirectory: root + 'src/partials',
      context: getPageContext,
      helpers: {
        t: translate,
        asset: assetUrl,
        concat: (...parts) => parts.slice(0, -1).join(''),
      },
    }),
    htmlPurge({
      safelist: ['is-open', 'is-active', 'is-invalid'],
      dynamicAttributes: ['aria-pressed', 'aria-expanded', 'aria-selected'],
    }),
    ViteMinifyPlugin(),
  ],
});
