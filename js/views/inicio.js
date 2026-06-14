import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';
import { overallStatus, loadAlerts } from '../alerts.js';
import { weightChart } from '../components/chart.js';
import { ageString, formatBR, todayISO } from '../dates.js';

const STATUS = { ok:['ok','Tudo em dia','check'], warn:['warn','Atenção','bell'], overdue:['late','Atrasado','bell'] };

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  if (!petId) {
    outlet.append(el(`<div class="empty">${icon('paw')}
      <p>Bem-vindo ao PetApp!<br>Comece cadastrando seu pet.</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
    return;
  }
  const hoje = todayISO();
  const pet = await db.get('pets', petId);
  const [vacinas, vermifugos, pesos, rotina, logs] = await Promise.all([
    db.getAll('vacinas', petId), db.getAll('vermifugos', petId), db.getAll('pesos', petId),
    db.getAll('rotina', petId), db.getAll('rotinaLog', petId)]);

  // Cabeçalho do pet
  const sub = pet.nascimento ? ageString(pet.nascimento, hoje) : (pet.idadeAprox || '');
  outlet.append(el(`<div class="card card-row">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--teal-50);overflow:hidden;display:flex;align-items:center;justify-content:center;color:var(--teal-400)">
      ${pet.foto?`<img src="${pet.foto}" style="width:100%;height:100%;object-fit:cover">`:icon('paw')}</div>
    <div class="rec-main"><h2>${pet.nome}</h2><div class="s">${[pet.especie,pet.raca,sub].filter(Boolean).join(' · ')}</div></div>
    <a class="icon-btn" href="#/pet/${pet.id}">${icon('edit')}</a></div>`));

  // Status
  const [scls, stxt, sico] = STATUS[overallStatus({ vacinas, vermifugos }, hoje)];
  const alerts = await loadAlerts(db, petId, hoje);
  outlet.append(el(`<div class="card"><div class="s" style="margin-bottom:8px">Status de saúde</div>
    <span class="pill ${scls}">${icon(sico)} ${stxt}</span></div>`));

  // Peso
  if (pesos.length) {
    const ord = pesos.slice().sort((a,b)=>a.data.localeCompare(b.data));
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Peso</div><strong style="margin-left:auto">${ord[ord.length-1].valor} kg</strong></div>
      ${weightChart(ord)}</div>`));
  }

  // Rotina de hoje
  const feitos = new Set(logs.filter(l=>l.data===hoje).map(l=>l.rotinaId));
  if (rotina.length) {
    const lines = rotina.map(i => `<div class="card-row" style="padding:4px 0">
      <span style="color:${feitos.has(i.id)?'var(--teal-600)':'var(--text-3)'}">${icon(feitos.has(i.id)?'check':'clock')}</span>
      <span style="${feitos.has(i.id)?'':'color:var(--text-2)'}">${i.titulo}</span></div>`).join('');
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Rotina de hoje</div><a class="btn ghost" style="margin-left:auto" href="#/rotina">Ver</a></div>${lines}</div>`));
  }

  // Próximos alertas
  if (alerts.length) {
    const items = alerts.slice(0,3).map(a => `<div class="card-row" style="padding:4px 0">
      <span class="pill ${a.status==='overdue'?'late':'warn'}">${a.status==='overdue'?'Atrasado':formatBR(a.dateISO)}</span>
      <span>${a.titulo}</span></div>`).join('');
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Próximos cuidados</div><a class="btn ghost" style="margin-left:auto" href="#/alertas">Ver todos</a></div>${items}</div>`));
  }

  // Atalho tutor
  outlet.append(el(`<a class="btn block no-print" href="#/tutor">${icon('user')} Dados do tutor</a>`));
}
