import * as db from '../db.js';
import { getCurrentPetId, setCurrentPetId } from '../state.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { ageString, formatBR, todayISO } from '../dates.js';

const SPEC = [
  { name:'nome', label:'Nome', required:true },
  { name:'especie', label:'Espécie', type:'select', options:['Cão','Gato','Ave','Roedor','Réptil','Outro'], required:true },
  { name:'sexo', label:'Sexo', type:'select', options:['Macho','Fêmea'] },
  { name:'nascimento', label:'Data de nascimento', type:'date' },
  { name:'idadeAprox', label:'Idade aproximada (se não souber a data)', placeholder:'ex.: 2 anos' },
  { name:'raca', label:'Raça' },
  { name:'porte', label:'Porte', type:'select', options:['Pequeno','Médio','Grande'] },
  { name:'cor', label:'Cor' },
  { name:'foto', label:'Foto', type:'photo' },
  { name:'comportamento', label:'Comportamento', type:'textarea' },
  { name:'preferencias', label:'Preferências', type:'textarea' },
  { name:'restricoes', label:'Restrições', type:'textarea' }
];

export async function render(outlet, params) {
  const [arg] = params;
  if (arg === 'novo') return form(outlet, null);
  if (arg) return form(outlet, Number(arg));
  return list(outlet);
}

async function list(outlet) {
  const pets = await db.getAll('pets');
  const box = el('<div></div>');
  box.append(el(`<div class="card-row" style="margin-bottom:var(--sp-4)">
    <h1>Meus pets</h1>
    <a class="btn primary" style="margin-left:auto" href="#/pet/novo">${icon('plus')} Novo</a></div>`));
  if (!pets.length) {
    box.append(el(`<div class="empty">${icon('paw')}<p>Nenhum pet ainda.<br>Cadastre o primeiro!</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
  } else {
    for (const p of pets) {
      const sub = p.nascimento ? ageString(p.nascimento, todayISO()) : (p.idadeAprox || '');
      const row = el(`<div class="card card-row">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--teal-50);overflow:hidden;display:flex;align-items:center;justify-content:center;color:var(--teal-400)">
          ${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover">` : icon('paw')}</div>
        <div class="rec-main"><div class="t">${p.nome}</div><div class="s">${[p.especie,p.raca,sub].filter(Boolean).join(' · ')}</div></div>
        <a class="icon-btn" href="#/pet/${p.id}">${icon('edit')}</a>
        <button class="icon-btn" data-del>${icon('trash')}</button></div>`);
      row.querySelector('[data-del]').onclick = async () => {
        if (await confirmDialog(`Excluir ${p.nome} e todo o histórico?`)) {
          await db.remove('pets', p.id);
          toast('Pet excluído'); list(outlet);
        }
      };
      box.append(row);
    }
  }
  outlet.innerHTML=''; outlet.append(box);
}

async function form(outlet, id) {
  const pet = id ? await db.get('pets', id) : {};
  const { form, getValues } = fieldForm(SPEC, pet);
  const wrap = el(`<div><div class="card-row" style="margin-bottom:var(--sp-4)">
    <a class="icon-btn" href="#/pet">${icon('x')}</a><h1>${id?'Editar pet':'Novo pet'}</h1></div></div>`);
  const card = el('<div class="card"></div>'); card.append(form);
  form.append(el(`<div class="form-actions">
    <a class="btn block" href="#/pet">Cancelar</a>
    <button class="btn primary block" type="submit">Salvar</button></div>`));
  form.onsubmit = async e => {
    e.preventDefault();
    const v = getValues();
    if (!v.nome || !v.especie) { toast('Nome e espécie são obrigatórios'); return; }
    const saved = { ...pet, ...v };
    const newId = await db.put('pets', saved);
    if (!id) setCurrentPetId(newId);
    toast('Salvo'); location.hash = '#/pet';
  };
  wrap.append(card); outlet.innerHTML=''; outlet.append(wrap);
}
