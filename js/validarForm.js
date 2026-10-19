import { t } from './i18n.js';
import './formulariosDemo.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('jobForm');
    if (!form) return;

    const puesto = form.elements.namedItem('puesto');
    const campos = [
        { campo: puesto, requerido: 'puestoEmpleo' },
        {
            campo: form.elements.namedItem('nombre'),
            requerido: 'nombreEmpleo',
            patron: /^\p{L}+(?:[ '’-]\p{L}+)*$/u,
            invalido: 'nombreCompletoInvalido',
        },
        {
            campo: form.elements.namedItem('email'),
            requerido: 'correoRequeridoEmpleo',
            patron: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            invalido: 'correoEmpleo',
        },
        {
            campo: form.elements.namedItem('telefono'),
            requerido: 'telefonoRequeridoEmpleo',
            patron: /^\d{10}$/,
            invalido: 'telefonoEmpleo',
        },
    ];

    function mostrarPuesto() {
        document.querySelectorAll('[data-job-details]').forEach((detalle) => {
            detalle.hidden = detalle.dataset.jobDetails !== puesto.value;
        });
        document.querySelector('[data-job-placeholder]').hidden = puesto.value !== '';
    }

    function limpiarError(campo) {
        form.querySelector(`#${campo.id}Error`)?.remove();
        campo.classList.remove('error');
        campo.removeAttribute('aria-invalid');
        campo.removeAttribute('aria-describedby');
    }

    function validarCampo({ campo, requerido, patron, invalido }) {
        limpiarError(campo);
        const valor = campo.value.trim();
        let key;
        if (!valor) key = `validacion.${requerido}`;
        else if (patron && (!patron.test(valor) || campo.validity.typeMismatch)) key = `validacion.${invalido}`;
        if (!key) return true;

        const mensaje = document.createElement('div');
        mensaje.id = `${campo.id}Error`;
        mensaje.className = 'error-message';
        mensaje.dataset.validationError = '';
        mensaje.dataset.i18n = key;
        mensaje.textContent = t(key);
        campo.parentElement.appendChild(mensaje);
        campo.classList.add('error');
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('aria-describedby', mensaje.id);
        return false;
    }

    campos.forEach((regla) => {
        regla.campo.addEventListener(regla.campo === puesto ? 'change' : 'input', () => {
            if (regla.campo.getAttribute('aria-invalid') === 'true') validarCampo(regla);
            form.querySelector('[data-demo-status]').hidden = true;
        });
    });

    puesto.addEventListener('change', mostrarPuesto);
    mostrarPuesto();

    form.addEventListener('submit', (event) => {
        let primerError;
        campos.forEach((regla) => {
            if (!validarCampo(regla)) primerError ||= regla.campo;
        });
        if (primerError) {
            event.preventDefault();
            primerError.focus();
        }
    });
});
