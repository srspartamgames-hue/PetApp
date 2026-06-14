const DB_NAME = 'petapp';
const VERSION = 1;
export const LIST_STORES = ['pets','pesos','vacinas','vermifugos','consultas','cirurgias','exames','rotina','rotinaLog'];
export const ALL_STORES = [...LIST_STORES, 'saude', 'tutor'];
let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of LIST_STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const s = db.createObjectStore(name, { keyPath:'id', autoIncrement:true });
          if (name !== 'pets') s.createIndex('petId', 'petId', { unique:false });
        }
      }
      if (!db.objectStoreNames.contains('saude')) db.createObjectStore('saude', { keyPath:'petId' });
      if (!db.objectStoreNames.contains('tutor')) db.createObjectStore('tutor', { keyPath:'id' });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}
async function store(name, mode) {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}
function done(req) {
  return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
}
export async function getAll(name, petId) {
  const os = await store(name, 'readonly');
  const out = [];
  const req = (petId != null && os.indexNames.contains('petId'))
    ? os.index('petId').openCursor(IDBKeyRange.only(petId)) : os.openCursor();
  return new Promise((res, rej) => {
    req.onsuccess = () => { const c = req.result; if (c) { out.push(c.value); c.continue(); } else res(out); };
    req.onerror = () => rej(req.error);
  });
}
export async function get(name, key) { return done((await store(name, 'readonly')).get(key)); }
export async function put(name, value) { return done((await store(name, 'readwrite')).put(value)); }
export async function remove(name, key) { return done((await store(name, 'readwrite')).delete(key)); }
export async function clearStore(name) { return done((await store(name, 'readwrite')).clear()); }
