import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, scheduledItems, buildAlerts, overallStatus } from '../js/alerts.js';

test('classify por dias restantes', () => {
  assert.equal(classify(-1), 'overdue');
  assert.equal(classify(3), 'warn');
  assert.equal(classify(7), 'warn');
  assert.equal(classify(8), 'ok');
  assert.equal(classify(null), null);
});
test('scheduledItems extrai proximas datas de vacinas e vermifugos', () => {
  const data = { vacinas:[{ id:1, nome:'V8', proximaDose:'2026-06-20' }, { id:2, nome:'Raiva' }],
                 vermifugos:[{ id:9, produto:'X', proximaAplicacao:'2026-07-01' }] };
  const items = scheduledItems(data);
  assert.equal(items.length, 2);
  assert.equal(items[0].titulo, 'Vacina: V8');
});
test('buildAlerts filtra e ordena por urgência', () => {
  const data = { vacinas:[{ id:1, nome:'V8', proximaDose:'2026-06-12' }, { id:2, nome:'Gripe', proximaDose:'2026-06-18' }],
                 vermifugos:[{ id:3, produto:'Y', proximaAplicacao:'2026-09-01' }] };
  const a = buildAlerts(data, '2026-06-14');
  assert.equal(a.length, 2);            // o de set/2026 fica fora (ok)
  assert.equal(a[0].status, 'overdue'); // vencido vem primeiro
  assert.equal(a[1].status, 'warn');
});
test('overallStatus retorna o pior status', () => {
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-06-10' }] }, '2026-06-14'), 'overdue');
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-06-18' }] }, '2026-06-14'), 'warn');
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-12-01' }] }, '2026-06-14'), 'ok');
});
