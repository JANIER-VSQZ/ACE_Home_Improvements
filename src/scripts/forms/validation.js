import { t } from '../core/i18n.js';
import { validateValue } from './rules.js';

export function createValidator(form, rules) {
  function validateField(rule) {
    const field = form.elements.namedItem(rule.name);
    if (!field) throw new Error('Unknown form field: ' + rule.name);
    const errorId = field.id + 'Error';
    document.getElementById(errorId)?.remove();
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    const key = validateValue(field.value, rule, field.validity.typeMismatch);
    if (!key) return true;
    const message = document.createElement('p');
    message.id = errorId;
    message.className = 'form__error';
    message.dataset.validationError = '';
    message.dataset.i18n = key;
    message.textContent = t(key);
    field.closest('.form__field').appendChild(message);
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
    return false;
  }

  rules.forEach(rule => {
    const field = form.elements.namedItem(rule.name);
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(rule);
    });
  });

  return {
    validate() {
      let firstError;
      rules.forEach(rule => {
        if (!validateField(rule)) firstError ||= form.elements.namedItem(rule.name);
      });
      firstError?.focus();
      return !firstError;
    },
  };
}
