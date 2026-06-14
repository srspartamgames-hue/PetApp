const MS = 86400000;
export function todayISO(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
export function daysUntil(targetISO, baseISO) {
  return Math.round((Date.parse(targetISO + 'T00:00:00') - Date.parse(baseISO + 'T00:00:00')) / MS);
}
export function formatBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
export function ageString(birthISO, baseISO) {
  if (!birthISO) return '';
  const [by, bm, bd] = birthISO.split('-').map(Number);
  const [ty, tm, td] = baseISO.split('-').map(Number);
  let years = ty - by, months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}
export function addMonths(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}
