import { t } from './i18n.js';

// These forms only demonstrate validation; they never submit personal data.
document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!form.matches('form[data-demo-form]')) return;
    const valid = !event.defaultPrevented && form.reportValidity();
    event.preventDefault();
    const status = form.querySelector('[data-demo-status]');
    status.hidden = !valid;
    if (valid) {
        status.dataset.i18n = 'formularios.validado';
        status.textContent = t('formularios.validado');
        status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
});

document.addEventListener('input', (event) => {
    const status = event.target.closest('form[data-demo-form]')?.querySelector('[data-demo-status]');
    if (status) status.hidden = true;
});
