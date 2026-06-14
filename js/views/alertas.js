import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';
import { loadAlerts } from '../alerts.js';
import { formatBR, todayISO } from '../dates.js';

const LABEL = { overdue:['late','Atrasado'], warn:['warn','Em breve'] };

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  outlet.append(el('<h1 style="margin-bottom:var(--sp-4)">Alertas</h1>'));
  if (!petId) { outlet.append(el(`<div class="empty">${icon('paw')}<p>Cadastre um pet primeiro.</p></div>`)); return; }
  const alerts = await loadAlerts(db, petId, todayISO());
  if (!alerts.length) {
    outlet.append(el(`<div class="empty">${icon('check')}<p>Tudo em dia! 🎉<br>Nenhum cuidado pendente.</p></div>`));
    return;
  }
  for (const a of alerts) {
    const [cls, txt] = LABEL[a.status];
    const when = a.daysUntil < 0 ? `${-a.daysUntil} dia(s) atrás` : (a.daysUntil === 0 ? 'hoje' : `em ${a.daysUntil} dia(s)`);
    outlet.append(el(`<div class="card card-row">
      <span class="acc-ico">${icon(a.tipo==='vacina'?'syringe':'pill')}</span>
      <div class="rec-main"><div class="t">${a.titulo}</div>
        <div class="s">${formatBR(a.dateISO)} · ${when}</div></div>
      <span class="pill ${cls}">${txt}</span></div>`));
  }
}
