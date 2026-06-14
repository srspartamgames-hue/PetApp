const KEY = 'petapp.currentPet';
export function getCurrentPetId() { const v = localStorage.getItem(KEY); return v ? Number(v) : null; }
export function setCurrentPetId(id) { localStorage.setItem(KEY, String(id)); }
