import i18next from 'https://cdn.jsdelivr.net/npm/i18next@23.7.6/+esm';
import LanguageDetector from 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/+esm';


import servicios from './translations/servicios.js';
import cotizacionServicios from './translations/cotizacion-servicios.js';

//import translations from './translations.js';

const translations = {
    es: {
        ...servicios.es,
        ...cotizacionServicios.es
    },
    en: {
        ...servicios.en,
        ...cotizacionServicios.en
    }
};

function getLang() {
    return new URLSearchParams(window.location.search).get("lang") || "es";
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => {
        return acc?.[part];
    }, obj);
}

function applyTranslations() {
    const lang = getLang();

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");

        const value = getNestedValue(translations[lang], key);

        if (value) {
            el.textContent = value;
        }
    });
}

document.addEventListener("DOMContentLoaded", applyTranslations);