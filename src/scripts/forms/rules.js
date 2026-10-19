export const patterns = {
  name: /^\p{L}+(?:[ '’-]\p{L}+)*$/u,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  jobPhone: /^\d{10}$/,
  area: /^\d+(?:[.,]\d+)?$/,
  quotePhone: /^\+?[0-9\s().-]{7,20}$/,
};

export function validateValue(value, rule, typeMismatch = false) {
  const trimmed = value.trim();
  if (!trimmed) return rule.requiredKey || null;
  if (rule.pattern && (!rule.pattern.test(trimmed) || typeMismatch)) return rule.invalidKey;
  if (rule.check && !rule.check(trimmed)) return rule.invalidKey;
  return null;
}

const quoteField = (name, pattern, invalidKey, check) => ({
  name, pattern, check,
  requiredKey: 'validacion.requeridos.' + name,
  invalidKey: 'validacion.' + invalidKey,
});
const email = (name, requiredKey) => ({
  name, requiredKey, pattern: patterns.email, invalidKey: 'validacion.correoEmpleo',
});

export const formRules = {
  quotes: [
    quoteField('Dimensiones', patterns.area, 'areaInvalida', value => Number(value.replace(',', '.')) > 0),
    quoteField('Condicion'),
    quoteField('Ubicacion'),
    quoteField('Nombre', patterns.name, 'nombreInvalido'),
    quoteField('Apellido', patterns.name, 'apellidoInvalido'),
    quoteField('Correo', patterns.email, 'correoInvalido'),
    quoteField('Telefono', patterns.quotePhone, 'telefonoInvalido', value => (value.match(/\d/g) || []).length >= 7),
  ],
  jobs: [
    { name: 'puesto', requiredKey: 'validacion.puestoEmpleo' },
    { name: 'nombre', requiredKey: 'validacion.nombreEmpleo', pattern: patterns.name, invalidKey: 'validacion.nombreCompletoInvalido' },
    email('email', 'validacion.correoRequeridoEmpleo'),
    { name: 'telefono', requiredKey: 'validacion.telefonoRequeridoEmpleo', pattern: patterns.jobPhone, invalidKey: 'validacion.telefonoEmpleo' },
  ],
  contact: [
    { name: 'nombre', requiredKey: 'validacion.nombreEmpleo', pattern: patterns.name, invalidKey: 'validacion.nombreCompletoInvalido' },
    email('correo', 'validacion.correoRequeridoEmpleo'),
    { name: 'mensaje', requiredKey: 'validacion.mensajeRequerido' },
  ],
};
