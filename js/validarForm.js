import { t, localizedUrl } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.job-card__form').forEach((form) => {
        const nombre = form.elements.namedItem('nombre');
        const correo = form.elements.namedItem('email');
        const telefono = form.elements.namedItem('telefono');

        function mostrarError(input, key) {
            input.dataset.validationKey = key;
            input.setCustomValidity(key ? t(key) : '');
        }

        nombre.addEventListener('input', () => {
            nombre.value = nombre.value.replace(/[^\p{L}\s]/gu, '');
            mostrarError(nombre, '');
        });
        telefono.addEventListener('input', () => {
            telefono.value = telefono.value.replace(/[^0-9]/g, '');
            mostrarError(telefono, '');
        });
        correo.addEventListener('input', () => mostrarError(correo, ''));

        document.addEventListener('languageChanged', () => {
            [nombre, correo, telefono].forEach((input) => {
                if (input.dataset.validationKey) mostrarError(input, input.dataset.validationKey);
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            mostrarError(nombre, nombre.value.trim() ? '' : 'validacion.nombreEmpleo');
            mostrarError(correo, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim()) ? '' : 'validacion.correoEmpleo');
            mostrarError(telefono, /^\d{10}$/.test(telefono.value.trim()) ? '' : 'validacion.telefonoEmpleo');

            if (form.reportValidity() && window.confirm(t('empleos.enviado'))) {
                window.location.href = localizedUrl('index.html');
            }
        });
    });
});
