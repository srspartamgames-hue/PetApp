import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysUntil, formatBR, ageString, addMonths, todayISO, addDays } from '../js/dates.js';

test('daysUntil conta dias com sinal', () => {
  assert.equal(daysUntil('2026-06-20', '2026-06-14'), 6);
  assert.equal(daysUntil('2026-06-10', '2026-06-14'), -4);
  assert.equal(daysUntil('2026-06-14', '2026-06-14'), 0);
});
test('formatBR converte ISO para dd/mm/aaaa', () => {
  assert.equal(formatBR('2026-06-14'), '14/06/2026');
  assert.equal(formatBR(''), '');
});
test('ageString em anos e meses', () => {
  assert.equal(ageString('2023-06-14', '2026-06-14'), '3 anos');
  assert.equal(ageString('2025-06-14', '2026-06-14'), '1 ano');
  assert.equal(ageString('2026-01-14', '2026-06-14'), '5 meses');
});
test('addMonths soma meses', () => {
  assert.equal(addMonths('2026-01-15', 2), '2026-03-15');
});
test('todayISO retorna a data local da Date dada', () => {
  assert.equal(todayISO(new Date(2026, 5, 14, 9, 0)), '2026-06-14');
});
test('addDays soma e subtrai dias', () => {
  assert.equal(addDays('2026-06-14', 5), '2026-06-19');
  assert.equal(addDays('2026-06-01', -25), '2026-05-07');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});
