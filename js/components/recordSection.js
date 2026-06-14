import * as db from '../db.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { accordionItem } from './accordion.js';

/* config: { store, title, icon, fields:[spec], line:(r)=>({t,s}) } */
export function recordSection(config, petId) {
  const body = el('<div></div>');
  reload();
  return accordionItem({ title: config.title, iconName: config.icon, body });

  async function reload() {
    const items = await db.getAll(config.store, petId);
    body.innerHTML = '';
    if (!items.length) body.append(el(`<div class="empty" style="padding:var(--sp-4)"><p>Nada registrado ainda.</p></div>`));
    for (const r of items) {
      const { t, s } = config.line(r);
      const row = el(`<div class="rec"><div class="rec-main"><div class="t">${t}</div><div class="s">${s||''}</div></div>
        <div class="rec-actions"><button class="icon-btn" data-edit>${icon('edit')}</button>
        <button class="icon-btn" data-del>${icon('trash')}</button></div></div>`);
      row.querySelector('[data-edit]').onclick = () => openForm(r);
      row.querySelector('[data-del]').onclick = async () => {
        if (await confirmDialog('Excluir este registro?')) { await db.remove(config.store, r.id); toast('Excluído'); reload(); }
      };
      body.append(row);
    }
    const addBtn = el(`<button class="fab-add" style="margin-top:var(--sp-2)">${icon('plus')} ${config.add||'Adicionar'}</button>`);
    addBtn.onclick = () => openForm(null);
    body.append(addBtn);
  }

  function openForm(record) {
    const { form, getValues } = fieldForm(config.fields, record || {});
    const scrim = el(`<div class="scrim"><div class="sheet">
      <h2 style="margin:0 0 var(--sp-4)">${record?'Editar':config.add||'Adicionar'}</h2></div></div>`);
    const sheet = scrim.querySelector('.sheet');
    sheet.append(form);
    form.append(el(`<div class="form-actions">
      <button type="button" class="btn block" data-cancel>Cancelar</button>
      <button type="submit" class="btn primary block">Salvar</button></div>`));
    form.querySelector('[data-cancel]').onclick = () => scrim.remove();
    scrim.onclick = e => { if (e.target === scrim) scrim.remove(); };
    form.onsubmit = async e => {
      e.preventDefault();
      await db.put(config.store, { ...(record||{}), petId, ...getValues() });
      scrim.remove(); toast('Salvo'); reload();
    };
    document.body.append(scrim);
  }
}
