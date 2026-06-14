const KEY = 'petapp.lastNotify';
export async function maybeNotify(alerts) {
  if (!('Notification' in window) || !alerts.length) return;
  if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
  if (Notification.permission !== 'granted') return;
  const today = new Date().toISOString().slice(0,10);
  if (localStorage.getItem(KEY) === today) return;   // 1x por dia
  localStorage.setItem(KEY, today);
  const due = alerts.filter(a => a.status === 'overdue').length;
  const body = due ? `${due} item(ns) vencido(s) e ${alerts.length-due} próximo(s)` : `${alerts.length} alerta(s) próximo(s)`;
  new Notification('PetApp — cuidados pendentes', { body });
}
