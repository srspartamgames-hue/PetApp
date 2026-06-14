import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, fieldForm, icon, toast } from '../ui.js';
import { recordSection } from '../components/recordSection.js';
import { formatBR } from '../dates.js';

const SECOES = [
  { store:'vacinas', title:'Vacinas', icon:'syringe', add:'Adicionar vacina',
    fields:[
      { name:'nome', label:'Nome da vacina', required:true },
      { name:'dataAplicacao', label:'Data de aplicação', type:'date' },
      { name:'proximaDose', label:'Próxima dose', type:'date' },
      { name:'clinica', label:'Clínica/veterinário' }],
    line:r => ({ t:r.nome, s:[r.dataAplicacao&&'Aplicada '+formatBR(r.dataAplicacao), r.proximaDose&&'Próxima '+formatBR(r.proximaDose)].filter(Boolean).join(' · ') }) },
  { store:'vermifugos', title:'Vermífugo e antipulgas', icon:'pill', add:'Adicionar',
    fields:[
      { name:'produto', label:'Produto utilizado', required:true },
      { name:'dataAplicacao', label:'Última aplicação', type:'date' },
      { name:'frequencia', label:'Frequência', placeholder:'ex.: a cada 3 meses' },
      { name:'proximaAplicacao', label:'Próxima aplicação', type:'date' }],
    line:r => ({ t:r.produto, s:[r.dataAplicacao&&formatBR(r.dataAplicacao), r.proximaAplicacao&&'Próxima '+formatBR(r.proximaAplicacao)].filter(Boolean).join(' · ') }) },
  { store:'consultas', title:'Consultas', icon:'health', add:'Nova consulta',
    fields:[
      { name:'data', label:'Data', type:'date', required:true },
      { name:'motivo', label:'Motivo' },
      { name:'diagnostico', label:'Diagnóstico', type:'textarea' },
      { name:'tratamento', label:'Tratamento indicado', type:'textarea' },
      { name:'observacoes', label:'Observações', type:'textarea' }],
    line:r => ({ t:r.motivo||'Consulta', s:formatBR(r.data) }) },
  { store:'cirurgias', title:'Cirurgias e procedimentos', icon:'scissors', add:'Adicionar',
    fields:[
      { name:'tipo', label:'Tipo de procedimento', required:true },
      { name:'data', label:'Data', type:'date' },
      { name:'veterinario', label:'Veterinário/clínica' },
      { name:'observacoes', label:'Observações e pós-operatório', type:'textarea' }],
    line:r => ({ t:r.tipo, s:formatBR(r.data) }) },
  { store:'exames', title:'Exames', icon:'flask', add:'Adicionar exame',
    fields:[
      { name:'tipo', label:'Tipo de exame', type:'select', options:['Sangue','Imagem','Outros'], required:true },
      { name:'data', label:'Data', type:'date' },
      { name:'resultado', label:'Resultado', type:'textarea' }],
    line:r => ({ t:r.tipo, s:formatBR(r.data) }) }
];

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  if (!petId) { outlet.append(el(`<div class="empty">${icon('paw')}<p>Cadastre um pet primeiro.</p>
    <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`)); return; }

  outlet.append(el(`<div class="card-row" style="margin-bottom:var(--sp-4)"><h1>Saúde</h1>
    <button class="btn ghost no-print" style="margin-left:auto" onclick="window.print()">${icon('download')} PDF</button></div>`));

  outlet.append(await saudeGeral(petId));
  outlet.append(await pesoSection(petId));
  for (const cfg of SECOES) outlet.append(recordSection(cfg, petId));
}

async function saudeGeral(petId) {
  const data = (await db.get('saude', petId)) || { petId };
  const spec = [
    { name:'condicoes', label:'Condições pré-existentes', type:'textarea' },
    { name:'alergias', label:'Alergias conhecidas', type:'textarea' },
    { name:'medicacao', label:'Medicação contínua (nome, dosagem, frequência)', type:'textarea' }
  ];
  const { accordionItem } = await import('../components/accordion.js');
  const { form, getValues } = fieldForm(spec, data);
  form.append(el(`<button class="btn primary block" type="submit">Salvar</button>`));
  form.onsubmit = async e => { e.preventDefault(); await db.put('saude', { petId, ...getValues() }); toast('Salvo'); };
  return accordionItem({ title:'Saúde geral', iconName:'health', body:form, open:true });
}

async function pesoSection(petId) {
  const { accordionItem } = await import('../components/accordion.js');
  const body = el('<div></div>');
  await fill();
  return accordionItem({ title:'Peso', iconName:'list', body });

  async function fill() {
    const pesos = (await db.getAll('pesos', petId)).sort((a,b)=>a.data.localeCompare(b.data));
    body.innerHTML = '';
    for (const p of pesos.slice().reverse()) {
      const row = el(`<div class="rec"><div class="rec-main"><div class="t">${p.valor} kg</div>
        <div class="s">${formatBR(p.data)}</div></div>
        <button class="icon-btn" data-del>${icon('trash')}</button></div>`);
      row.querySelector('[data-del]').onclick = async () => { await db.remove('pesos', p.id); fill(); };
      body.append(row);
    }
    const { form, getValues } = fieldForm(
      [{ name:'data', label:'Data', type:'date', required:true }, { name:'valor', label:'Peso (kg)', type:'number', required:true }], {});
    form.append(el(`<button class="fab-add" style="margin-top:var(--sp-2)">${icon('plus')} Registrar peso</button>`));
    form.onsubmit = async e => { e.preventDefault(); const v = getValues();
      if (!v.data || !v.valor) return; await db.put('pesos', { petId, data:v.data, valor:Number(v.valor) }); toast('Peso registrado'); fill(); };
    body.append(form);
  }
}
