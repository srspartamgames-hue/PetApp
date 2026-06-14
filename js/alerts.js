import { daysUntil } from './dates.js';

export function classify(d) {
  if (d == null || Number.isNaN(d)) return null;
  if (d < 0) return 'overdue';
  if (d <= 7) return 'warn';
  return 'ok';
}
export function scheduledItems(data) {
  const items = [];
  for (const v of data.vacinas || []) if (v.proximaDose)
    items.push({ tipo:'vacina', titulo:`Vacina: ${v.nome || ''}`.trim(), dateISO:v.proximaDose, petId:v.petId, refId:v.id });
  for (const v of data.vermifugos || []) if (v.proximaAplicacao)
    items.push({ tipo:'vermifugo', titulo:`Vermífugo: ${v.produto || ''}`.trim(), dateISO:v.proximaAplicacao, petId:v.petId, refId:v.id });
  return items;
}
export function buildAlerts(data, today) {
  return scheduledItems(data)
    .map(it => { const d = daysUntil(it.dateISO, today); return { ...it, daysUntil:d, status:classify(d) }; })
    .filter(it => it.status === 'warn' || it.status === 'overdue')
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
export function overallStatus(data, today) {
  const st = scheduledItems(data).map(it => classify(daysUntil(it.dateISO, today)));
  if (st.includes('overdue')) return 'overdue';
  if (st.includes('warn')) return 'warn';
  return 'ok';
}
