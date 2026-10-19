import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const languages = ['es', 'en'];
const resourceBase = new URL(import.meta.env.BASE_URL, document.baseURI);

export const ready = Promise.all(languages.map(async (language) => {
    const response = await fetch(new URL(`locales/${language}/translation.json`, resourceBase));
    if (!response.ok) throw new Error(`Unable to load translations: ${language}`);
    return [language, { translation: await response.json() }];
})).then((entries) => i18next.use(LanguageDetector).init({
    resources: Object.fromEntries(entries),
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
}));

export function t(key, options = {}) {
    return i18next.t(key, options);
}

export function getLanguage() {
    return i18next.resolvedLanguage || 'es';
}

export function localizedUrl(href) {
    const url = new URL(href, window.location.href);
    url.searchParams.set('lang', getLanguage());
    return url.href;
}

// Attribute translations use data-i18n="[placeholder]key;[title]otherKey".
export function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((element) => {
        const options = JSON.parse(element.dataset.i18nOptions || '{}');
        element.dataset.i18n.split(';').forEach((binding) => {
            const match = binding.trim().match(/^(?:\[([^\]]+)\])?(.+)$/);
            if (!match) return;
            const [, attribute, key] = match;
            if (!i18next.exists(key, options)) return;
            const value = t(key, options);
            if (typeof value !== 'string') return;
            if (attribute) element.setAttribute(attribute, value);
            else element.textContent = value;
        });
    });
}

function updatePageLanguage() {
    const language = getLanguage();
    document.documentElement.lang = language;
    applyTranslations();

    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.hasAttribute('download')) return;
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin && /(?:\.html|\/)$/i.test(url.pathname)) {
            link.href = localizedUrl(href);
        }
    });

    document.querySelectorAll('form[method="get" i]').forEach((form) => {
        let input = form.querySelector('input[name="lang"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'lang';
            form.appendChild(input);
        }
        input.value = language;
    });

    document.querySelectorAll('[data-language]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
}

export async function setLanguage(language) {
    if (!languages.includes(language)) return;
    await ready;
    await i18next.changeLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
}

const domReady = document.readyState === 'loading'
    ? new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();

Promise.all([ready, domReady]).then(() => {
    i18next.on('languageChanged', updatePageLanguage);
    document.querySelectorAll('[data-language]').forEach((button) => {
        button.addEventListener('click', () => setLanguage(button.dataset.language));
    });
    updatePageLanguage();
}).catch((error) => console.error('Could not initialize translations.', error));
