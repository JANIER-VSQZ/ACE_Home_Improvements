import test from 'node:test';
import assert from 'node:assert/strict';
import { validateValue, formRules } from '../src/scripts/forms/rules.js';

const rule = (type, name) => formRules[type].find(field => field.name === name);

test('blank required fields are rejected and surrounding whitespace is ignored', () => {
  assert.equal(validateValue('  ', rule('jobs', 'puesto')), 'validacion.puestoEmpleo');
  assert.equal(validateValue(' Ana María ', rule('jobs', 'nombre')), null);
});
test('names accept accents and natural separators but reject digits', () => {
  for (const name of ['Ana María', "Anne-Marie O’Neil", 'José', 'María del Carmen']) {
    assert.equal(validateValue(name, rule('jobs', 'nombre')), null, name);
  }
  for (const name of ['Ana123', '@@@', 'Ana--Maria']) {
    assert.equal(validateValue(name, rule('jobs', 'nombre')), 'validacion.nombreCompletoInvalido', name);
  }
});
test('an email must have a domain and satisfy native type validation', () => {
  assert.equal(validateValue('ana@example.com', rule('contact', 'correo')), null);
  assert.equal(validateValue('ana@', rule('contact', 'correo')), 'validacion.correoEmpleo');
  assert.equal(validateValue('ana@example..com', rule('contact', 'correo'), true), 'validacion.correoEmpleo');
});
test('job phone numbers require exactly ten digits', () => {
  assert.equal(validateValue('2019513723', rule('jobs', 'telefono')), null);
  for (const phone of ['201951372', '20195137230', 'abcdefghij']) {
    assert.equal(validateValue(phone, rule('jobs', 'telefono')), 'validacion.telefonoEmpleo');
  }
});
test('quote areas accept decimal separators and reject zero or nonnumeric values', () => {
  for (const area of ['120', '120.5', '120,5']) assert.equal(validateValue(area, rule('quotes', 'Dimensiones')), null);
  for (const area of ['0', '-10', 'abc', '1e3']) assert.equal(validateValue(area, rule('quotes', 'Dimensiones')), 'validacion.areaInvalida');
});
test('quote phones permit formatting but must actually contain digits', () => {
  assert.equal(validateValue('+1 (201) 951-3723', rule('quotes', 'Telefono')), null);
  assert.equal(validateValue('-------', rule('quotes', 'Telefono')), 'validacion.telefonoInvalido');
});
test('optional observations have no required-field rule', () => {
  assert.equal(rule('quotes', 'Observacion'), undefined);
  assert.equal(validateValue('', {}), null);
});
