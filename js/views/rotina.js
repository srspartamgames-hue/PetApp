import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { todayISO } from '../dates.js';

const SPEC = [
  { name:'titulo', label:'Item', required:true, placeholder:'ex.: Ração da manhã' },
  { name:'tipo', label:'Tipo', type:'select', options:['Alimentação','Passeio','Medicamento','Outro'] },
  { name:'horario', label:'Horário', placeholder:'ex.: 08:00' }
];

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  if (!petId) { outlet.append(el(`<div class="empty">${icon('paw')}<p>Cadastre um pet primeiro.</p></div>`)); return; }
  await draw(outlet, petId);
}

async function draw(outlet, petId) {
  const hoje = todayISO();
  const [itens, logs] = await Promise.all([db.getAll('rotina', petId), db.getAll('rotinaLog', petId)]);
  const feitos = new Set(logs.filter(l => l.data === hoje).map(l => l.rotinaId));
  outlet.innerHTML = '';
  const total = itens.length, done = itens.filter(i => feitos.has(i.id)).length;

  outlet.append(el(`<div class="card-row" style="margin-bottom:var(--sp-4)"><h1>Rotina de hoje</h1></div>`));
  if (total) outlet.append(el(`<div class="card"><div class="s" style="margin-bottom:8px">Hoje: ${done}/${total} concluído(s)</div>
    <div style="height:8px;background:var(--teal-50);border-radius:var(--r-pill);overflow:hidden">
      <div style="height:100%;width:${total?Math.round(done/total*100):0}%;background:var(--teal-400)"></div></div></div>`));

  if (!itens.length) outlet.append(el(`<div class="empty"><p>Nenhum item de rotina ainda.</p></div>`));
  for (const it of itens) {
    const isDone = feitos.has(it.id);
    const row = el(`<div class="check-row ${isDone?'done':''}">
      <span class="box">${icon('check')}</span>
      <div class="rec-main"><div class="t">${it.titulo}</div>
        <div class="s">${[it.tipo, it.horario].filter(Boolean).join(' · ')}</div></div>
      <button class="icon-btn no-print" data-del>${icon('trash')}</button></div>`);
    row.onclick = async e => {
      if (e.target.closest('[data-del]')) {
        if (await confirmDialog('Remover este item da rotina?')) { await db.remove('rotina', it.id); draw(outlet, petId); }
        return;
      }
      if (isDone) { const log = logs.find(l => l.rotinaId === it.id && l.data === hoje); if (log) await db.remove('rotinaLog', log.id); }
      else { await db.put('rotinaLog', { petId, rotinaId: it.id, data: hoje }); }
      draw(outlet, petId);
    };
    outlet.append(row);
  }

  const { form, getValues } = fieldForm(SPEC, {});
  form.append(el(`<button class="fab-add no-print" style="margin-top:var(--sp-3)">${icon('plus')} Adicionar item</button>`));
  form.onsubmit = async e => { e.preventDefault(); const v = getValues();
    if (!v.titulo) return; await db.put('rotina', { petId, ...v }); toast('Item adicionado'); draw(outlet, petId); };
  outlet.append(form);
}
