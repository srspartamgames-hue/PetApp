import * as db from './db.js';
import { setCurrentPetId } from './state.js';
import { todayISO, addMonths, addDays } from './dates.js';

const OPT_OUT = 'petapp.noDemo';

export async function seedDemo() {
  // Modo vitrine: a cada carregamento restaura o Thor pristino — exceto se o
  // usuário optou por sair do demo via "Começar do zero" (flag petapp.noDemo).
  try { if (localStorage.getItem(OPT_OUT)) return; } catch { return; }
  await Promise.all(db.ALL_STORES.map(s => db.clearStore(s)));

  const t = todayISO();
  const petId = await db.put('pets', {
    nome: 'Thor', especie: 'Cão', sexo: 'Macho', raca: 'Dobermann',
    nascimento: addMonths(t, -36), idadeAprox: '', porte: 'Grande', cor: 'Preto e castanho', foto: '',
    comportamento: 'Leal, protetor, muito enérgico e inteligente.',
    preferencias: 'Corridas no parque, brinquedos de morder e ficar perto do tutor.',
    restricoes: 'Sensível ao frio (pelo curto); evitar exercício intenso logo após comer.'
  });
  setCurrentPetId(petId);

  await db.put('tutor', { id: 'tutor', nome: 'Maria Oliveira', telefone: '(11) 98888-7777',
    email: 'maria.demo@petapp.app', endereco: 'Rua das Acácias, 123 — São Paulo/SP' });

  await db.put('saude', { petId,
    condicoes: 'Raça predisposta a cardiomiopatia dilatada (DCM) — acompanhamento cardiológico anual.',
    alergias: 'Nenhuma conhecida.',
    medicacao: 'Suplemento de ômega-3 (apoio cardiovascular), 1x ao dia.' });

  for (const [off, v] of [[-10, 34.0], [-7, 37.5], [-4, 39.8], [-2, 41.0], [0, 41.5]])
    await db.put('pesos', { petId, data: addMonths(t, off), valor: v });

  await db.put('vacinas', { petId, nome: 'V10 (múltipla)', dataAplicacao: addMonths(t, -11), proximaDose: addMonths(t, 1), clinica: 'Clínica VetSaúde' });
  await db.put('vacinas', { petId, nome: 'Antirrábica', dataAplicacao: addMonths(t, -11), proximaDose: addMonths(t, 1), clinica: 'Clínica VetSaúde' });
  await db.put('vacinas', { petId, nome: 'Tosse dos canis (Bordetella)', dataAplicacao: addMonths(t, -6), proximaDose: addMonths(t, 6), clinica: 'Clínica VetSaúde' });

  await db.put('vermifugos', { petId, produto: 'NexGard (antipulgas/carrapatos)', dataAplicacao: addDays(t, -25), frequencia: 'Mensal', proximaAplicacao: addDays(t, 5) });
  await db.put('vermifugos', { petId, produto: 'Drontal Plus (vermífugo)', dataAplicacao: addMonths(t, -2), frequencia: 'A cada 3 meses', proximaAplicacao: addMonths(t, 1) });

  await db.put('consultas', { petId, data: addMonths(t, -2), motivo: 'Check-up anual', diagnostico: 'Saudável', tratamento: 'Manter rotina', observacoes: 'Peso ideal para a raça.' });
  await db.put('consultas', { petId, data: addMonths(t, -6), motivo: 'Avaliação cardiológica (rastreio DCM)', diagnostico: 'Coração sem alterações', tratamento: 'Reavaliar em 12 meses', observacoes: 'Raça predisposta a cardiomiopatia dilatada.' });

  await db.put('cirurgias', { petId, tipo: 'Castração', data: addMonths(t, -24), veterinario: 'Clínica VetSaúde', observacoes: 'Recuperação sem intercorrências.' });

  await db.put('exames', { petId, tipo: 'Imagem', data: addMonths(t, -6), resultado: 'Ecocardiograma de rastreio de DCM — sem alterações.' });
  await db.put('exames', { petId, tipo: 'Sangue', data: addMonths(t, -2), resultado: 'Hemograma completo dentro da normalidade.' });

  const r1 = await db.put('rotina', { petId, titulo: 'Ração da manhã', tipo: 'Alimentação', horario: '07:00' });
  const r2 = await db.put('rotina', { petId, titulo: 'Passeio matinal', tipo: 'Passeio', horario: '08:00' });
  await db.put('rotina', { petId, titulo: 'Ração da noite', tipo: 'Alimentação', horario: '19:00' });
  await db.put('rotina', { petId, titulo: 'Suplemento ômega-3', tipo: 'Medicamento', horario: '20:00' });
  await db.put('rotinaLog', { petId, rotinaId: r1, data: t });
  await db.put('rotinaLog', { petId, rotinaId: r2, data: t });
}
