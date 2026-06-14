import * as db from './db.js';
import { ALL_STORES } from './db.js';

export async function exportData() {
  const dump = { app:'petapp', version:1, exportedAt:new Date().toISOString(), stores:{} };
  for (const s of ALL_STORES) dump.stores[s] = await db.getAll(s);
  const blob = new Blob([JSON.stringify(dump)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `petapp-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(a.href);
}
export async function importData(file) {
  const text = await file.text();
  const dump = JSON.parse(text);
  if (dump.app !== 'petapp') throw new Error('Arquivo inválido');
  for (const s of ALL_STORES) {
    await db.clearStore(s);
    for (const rec of dump.stores[s] || []) await db.put(s, rec);
  }
}
