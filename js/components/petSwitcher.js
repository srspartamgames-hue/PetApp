import * as db from '../db.js';
import { getCurrentPetId, setCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';

export async function renderSwitcher() {
  const host = document.getElementById('pet-switcher');
  if (!host) return;
  const pets = await db.getAll('pets');
  let current = getCurrentPetId();
  if (pets.length && !pets.some(p => p.id === current)) { current = pets[0].id; setCurrentPetId(current); }
  if (!pets.length) {
    host.innerHTML = `<a class="fab-add" href="#/pet/novo">${icon('plus')} Pet</a>`;
    return;
  }
  const sel = el(`<select aria-label="Selecionar pet" style="border:1px solid var(--line);border-radius:var(--r-pill);padding:6px 12px;font-size:14px;background:var(--surface)">${
    pets.map(p => `<option value="${p.id}" ${p.id===current?'selected':''}>${p.nome}</option>`).join('')
  }</select>`);
  sel.onchange = () => { setCurrentPetId(Number(sel.value)); location.reload(); };
  host.innerHTML = '';
  host.append(sel);
}
