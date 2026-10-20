import { t, getLanguage } from '../core/i18n.js';
import { formRules } from './rules.js';
import { createValidator } from './validation.js';
import { buildSubmission, sendSubmission } from './submission.js';

export function initForms() {
  document.querySelectorAll('form[data-submit-form]').forEach(form => {
    const validator = createValidator(form, formRules[form.dataset.formType]);
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    const submitKey = button.dataset.i18n;
    let submitting = false;

    function showStatus(key, state) {
      status.dataset.i18n = key;
      status.dataset.state = state;
      status.setAttribute('role', state === 'error' ? 'alert' : 'status');
      status.setAttribute('aria-live', state === 'error' ? 'assertive' : 'polite');
      status.textContent = t(key);
      status.hidden = false;
    }

    function setBusy(busy) {
      submitting = busy;
      form.setAttribute('aria-busy', String(busy));
      form.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = busy; });
      button.disabled = busy;
      button.dataset.i18n = busy ? 'formularios.enviando' : submitKey;
      button.textContent = t(button.dataset.i18n);
    }

    function clearStatus() {
      if (!submitting) status.hidden = true;
    }
    form.addEventListener('input', clearStatus);
    form.addEventListener('change', clearStatus);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting) return;
      clearStatus();
      if (!validator.validate()) return;
      const payload = buildSubmission(form.dataset.formType, Object.fromEntries(new FormData(form)), {
        translate: t, pageUrl: window.location.href, language: getLanguage(),
      });
      setBusy(true);
      showStatus('formularios.enviando', 'sending');
      try {
        await sendSubmission(form.action, payload);
        form.reset();
        showStatus('formularios.enviado', 'success');
      } catch (error) {
        showStatus('formularios.' + (error.reason || 'error'), 'error');
      } finally {
        setBusy(false);
      }
      status.scrollIntoView({ block: 'nearest' });
    });
    setBusy(false);
  });
}
