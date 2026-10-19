import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from '../../locales/es/translation.json';
import en from '../../locales/en/translation.json';

const languages = ['es', 'en'];

export const ready = i18next.use(LanguageDetector).init({
  resources: { es: { translation: es }, en: { translation: en } },
  supportedLngs: languages,
  fallbackLng: 'es',
  load: 'languageOnly',
  detection: {
    order: ['querystring', 'localStorage'],
    lookupQuerystring: 'lang',
    lookupLocalStorage: 'lang',
    caches: ['localStorage'],
  },
  interpolation: { escapeValue: false },
});

export const t = (key, options = {}) => i18next.t(key, options);
export const getLanguage = () => i18next.resolvedLanguage || 'es';

export function localizedUrl(href) {
  const url = new URL(href, window.location.href);
  url.searchParams.set('lang', getLanguage());
  return url.href;
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(element => {
    element.dataset.i18n.split(';').forEach(binding => {
      const match = binding.trim().match(/^(?:\[([^\]]+)\])?(.+)$/);
      if (!match) return;
      const [, attribute, key] = match;
      if (!i18next.exists(key)) return;
      const value = t(key);
      if (typeof value !== 'string') return;
      if (attribute) element.setAttribute(attribute, value);
      else element.textContent = value;
    });
  });
}

function updateLanguage() {
  document.documentElement.lang = getLanguage();
  applyTranslations();
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.hasAttribute('download')) return;
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin && /(?:\.html|\/)$/i.test(url.pathname)) {
      link.href = localizedUrl(href);
    }
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === getLanguage()));
  });
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: getLanguage() } }));
}

export async function setLanguage(language) {
  if (!languages.includes(language)) return;
  await ready;
  await i18next.changeLanguage(language);
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  window.history.replaceState(null, '', url);
}

export function initTranslations() {
  i18next.on('languageChanged', updateLanguage);
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  updateLanguage();
}
