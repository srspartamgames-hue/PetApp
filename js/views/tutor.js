import * as db from '../db.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { exportData, importData } from '../backup.js';

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
  const bkp = el(`<div class="card"><h3 style="margin-bottom:var(--sp-3)">Backup dos dados</h3>
    <p class="s" style="margin-top:0">Seus dados ficam neste navegador. Exporte um backup para guardar ou levar para outro aparelho.</p>
    <div class="form-actions">
      <button class="btn block" data-exp>${icon('download')} Exportar</button>
      <label class="btn block" style="cursor:pointer">${icon('upload')} Importar
        <input type="file" accept="application/json" data-imp hidden></label>
    </div></div>`);
  bkp.querySelector('[data-exp]').onclick = () => exportData();
  bkp.querySelector('[data-imp]').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { await importData(f); toast('Backup importado'); location.reload(); }
    catch { toast('Arquivo inválido'); }
  };
  const danger = el(`<div class="card"><h3 style="margin-bottom:var(--sp-3)">Começar do zero</h3>
    <p class="s" style="margin-top:0;color:var(--text-2)">Remove o pet de demonstração e todos os dados deste navegador para você usar o app com o seu próprio pet.</p>
    <button class="btn danger block" data-reset>${icon('trash')} Limpar tudo</button></div>`);
  danger.querySelector('[data-reset]').onclick = async () => {
    if (await confirmDialog('Limpar TODOS os dados deste navegador? Esta ação não pode ser desfeita.', { ok: 'Limpar tudo' })) {
      for (const s of db.ALL_STORES) await db.clearStore(s);
      try { localStorage.setItem('petapp.seeded', '1'); localStorage.removeItem('petapp.currentPet'); } catch {}
      toast('Tudo limpo'); location.hash = '#/inicio'; location.reload();
    }
  };
  const demo = el(`<div class="card"><h3 style="margin-bottom:var(--sp-3)">Pet de demonstração</h3>
    <p class="s" style="margin-top:0;color:var(--text-2)">Carrega o "Thor" (Dobermann) com dados de exemplo para explorar o app. Isso substitui os dados atuais.</p>
    <button class="btn primary block" data-demo>${icon('paw')} Usar o cão de demonstração</button></div>`);
  demo.querySelector('[data-demo]').onclick = async () => {
    if (await confirmDialog('Isto vai substituir os dados atuais pelo pet de demonstração (Thor). Continuar?', { ok: 'Usar demo', danger: false })) {
      for (const s of db.ALL_STORES) await db.clearStore(s);
      try { localStorage.removeItem('petapp.seeded'); localStorage.removeItem('petapp.currentPet'); } catch {}
      toast('Carregando demo…'); location.hash = '#/inicio'; location.reload();
    }
  };
  wrap.append(card); wrap.append(bkp); wrap.append(demo); wrap.append(danger); outlet.innerHTML=''; outlet.append(wrap);
}
