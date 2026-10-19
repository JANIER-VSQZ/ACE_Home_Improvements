import { t } from '../core/i18n.js';
import { formRules } from './rules.js';
import { createValidator } from './validation.js';

export function initForms() {
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    const validator = createValidator(form, formRules[form.dataset.formType]);
    const status = form.querySelector('[data-demo-status]');

    function clearStatus() {
      status.hidden = true;
    }
    form.addEventListener('input', clearStatus);
    form.addEventListener('change', clearStatus);
    form.addEventListener('submit', event => {
      // Prototype: validate locally and never send personal information.
      event.preventDefault();
      clearStatus();
      if (!validator.validate()) return;
      status.dataset.i18n = 'formularios.validado';
      status.textContent = t('formularios.validado');
      status.hidden = false;
      status.scrollIntoView({ block: 'nearest' });
    });
  });
}
