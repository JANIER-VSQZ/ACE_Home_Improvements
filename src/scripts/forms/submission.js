import forms from '../../data/forms.json' with { type: 'json' };

export function buildSubmission(type, values, { translate, pageUrl, language }) {
  const definition = forms[type];
  if (!definition) throw new Error('Unknown form type: ' + type);
  const fields = definition.sections.flatMap(section => section.fields);
  const emailField = fields.find(field => field.type === 'email');
  const url = new URL(pageUrl);
  const payload = {
    _subject: translate(definition.subjectKey),
    _template: 'table',
    _url: url.origin + url.pathname,
    _honey: String(values._honey || ''),
    email: String(values[emailField.name] || '').trim(),
  };

  for (const field of fields) {
    const value = String(values[field.name] || '').trim();
    const option = field.options?.find(entry => entry.value === value);
    payload[translate(field.labelKey)] = option ? translate(option.labelKey) : value;
  }
  if (type === 'quotes' && url.searchParams.get('boton')) {
    payload[translate('formularios.servicio')] = url.searchParams.get('boton');
  }
  payload[translate('formularios.idioma')] = language;
  return payload;
}

export class SubmissionError extends Error {
  constructor(reason) {
    super('Form submission failed: ' + reason);
    this.name = 'SubmissionError';
    this.reason = reason;
  }
}

export async function sendSubmission(endpoint, payload, { fetcher = globalThis.fetch, timeout = 20000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || (result?.success !== true && result?.success !== 'true')) {
      const activation = /activat|confirm.*email/i.test(result?.message || '');
      throw new SubmissionError(activation ? 'activacion' : 'error');
    }
  } catch (error) {
    if (controller.signal.aborted) throw new SubmissionError('tiempoAgotado');
    if (error instanceof SubmissionError) throw error;
    throw new SubmissionError('error');
  } finally {
    clearTimeout(timer);
  }
}
