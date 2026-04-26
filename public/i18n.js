import i18next from 'https://cdn.jsdelivr.net/npm/i18next@23.7.6/+esm';
import LanguageDetector from 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/+esm';

import general from './translations/general.js';
import servicios from './translations/servicios.js';
import cotizacionServicios from './translations/cotizacion-servicios.js';
import preguntasFrecuentes from './translations/faqData.js';


//import translations from './translations.js';

const translations = {
    es: {
        ...servicios.es,
        ...cotizacionServicios.es,
        ...preguntasFrecuentes.es,
        ...general.es
    },
    en: {
        ...servicios.en,
        ...cotizacionServicios.en,
        ...preguntasFrecuentes.en,
        ...general.en

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

console.log(getNestedValue(translations.es, "cotizacionServicios.0.nombreServicio"));
console.log(getNestedValue(translations.es, "generalServicios.titulo"));
function applyTranslations() {
  console.log(translations.es.generalServicios);
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