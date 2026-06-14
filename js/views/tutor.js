import * as db from '../db.js';
import { el, fieldForm, icon, toast } from '../ui.js';

const SPEC = [
  { name:'nome', label:'Nome do tutor' },
  { name:'telefone', label:'Telefone', type:'tel' },
  { name:'email', label:'E-mail', type:'email' },
  { name:'endereco', label:'Endereço (opcional)', type:'textarea' }
];

export async function render(outlet) {
  const tutor = (await db.get('tutor', 'tutor')) || { id:'tutor' };
  const { form, getValues } = fieldForm(SPEC, tutor);
  const wrap = el(`<div><div class="card-row" style="margin-bottom:var(--sp-4)">
    <a class="icon-btn" href="#/inicio">${icon('x')}</a><h1>Dados do tutor</h1></div></div>`);
  const card = el('<div class="card"></div>'); card.append(form);
  form.append(el(`<div class="form-actions"><button class="btn primary block" type="submit">Salvar</button></div>`));
  form.onsubmit = async e => {
    e.preventDefault();
    await db.put('tutor', { id:'tutor', ...getValues() });
    toast('Dados salvos'); location.hash = '#/inicio';
  };
  wrap.append(card); outlet.innerHTML=''; outlet.append(wrap);
}
