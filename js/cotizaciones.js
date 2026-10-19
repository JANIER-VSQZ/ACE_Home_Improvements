import { t } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('frmCotizacion');
    const obligatorios = ['Dimensiones', 'Condicion', 'Ubicacion', 'Observacion', 'Nombre', 'Apellido', 'Correo', 'Telefono'];
    const validadores = {
        Dimensiones: [/^\d+$/, 'soloNumeros'],
        Nombre: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/, 'nombreInvalido'],
        Apellido: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/, 'apellidoInvalido'],
        Correo: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'correoInvalido'],
        Telefono: [/^\+?[0-9\s().-]{7,20}$/, 'telefonoInvalido'],
    };

    formulario.addEventListener('submit', (event) => {
        formulario.querySelectorAll('[data-validation-error]').forEach((error) => error.remove());
        let primerError;

        obligatorios.forEach((nombre) => {
            const campo = formulario.elements.namedItem(nombre);
            campo.classList.remove('error');
            campo.removeAttribute('aria-invalid');
            campo.removeAttribute('aria-describedby');
            const valor = campo.value.trim();
            const validador = validadores[nombre];
            let key;
            if (!valor) key = `validacion.requeridos.${nombre}`;
            else if (validador && !validador[0].test(valor)) key = `validacion.${validador[1]}`;
            if (!key) return;

            const mensaje = document.createElement('div');
            mensaje.id = `${nombre}Error`;
            mensaje.className = 'error';
            mensaje.dataset.validationError = '';
            mensaje.dataset.i18n = key;
            mensaje.textContent = t(key);
            campo.parentElement.appendChild(mensaje);
            campo.classList.add('error');
            campo.setAttribute('aria-invalid', 'true');
            campo.setAttribute('aria-describedby', mensaje.id);
            primerError ||= campo;
        });

        if (primerError) {
            event.preventDefault();
            primerError.focus();
        }
    });
});
