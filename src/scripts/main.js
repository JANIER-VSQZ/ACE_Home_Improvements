import '../styles/main.less';
import { ready, initTranslations } from './core/i18n.js';
import { initNavigation } from './components/navigation.js';
import { initCarousel } from './components/carousel.js';
import { initForms } from './forms/index.js';
import { initFaq } from './pages/faq.js';
import { initGallery } from './pages/gallery.js';
import { initJobs } from './pages/jobs.js';
import { initServices } from './pages/services.js';

const domReady = document.readyState === 'loading'
  ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
  : Promise.resolve();

Promise.all([ready, domReady]).then(() => {
  initTranslations();
  initNavigation();
  initCarousel();
  initForms();
  const pages = { faq: initFaq, gallery: initGallery, jobs: initJobs, services: initServices };
  pages[document.body.dataset.page]?.();
}).catch(error => console.error('Unable to initialize the site.', error));
