const DOG = `<svg class="mascot" viewBox="0 0 100 100" role="img" aria-label="Cachorro">
<ellipse cx="27" cy="40" rx="11" ry="18" fill="#C77B45"/><ellipse cx="73" cy="40" rx="11" ry="18" fill="#C77B45"/>
<circle cx="50" cy="50" r="29" fill="#E8A368"/><ellipse cx="50" cy="60" rx="15" ry="12" fill="#F6D7B0"/>
<circle cx="40" cy="45" r="4" fill="#3A2A1A"/><circle cx="60" cy="45" r="4" fill="#3A2A1A"/>
<ellipse cx="50" cy="55" rx="5" ry="4" fill="#3A2A1A"/>
<path d="M42 62 q8 7 16 0" stroke="#3A2A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
const CAT = `<svg class="mascot" viewBox="0 0 100 100" role="img" aria-label="Gato">
<path d="M26 30 L34 50 L20 48 Z" fill="#9AA7B0"/><path d="M74 30 L66 50 L80 48 Z" fill="#9AA7B0"/>
<circle cx="50" cy="52" r="28" fill="#B6C2CC"/>
<path d="M40 46 q3 4 6 0" stroke="#2A3338" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M54 46 q3 4 6 0" stroke="#2A3338" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M48 56 l2 2 2-2" stroke="#2A3338" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 58 v3" stroke="#2A3338" stroke-width="2" stroke-linecap="round"/>
<path d="M30 56 h12M30 60 h12M58 56 h12M58 60 h12" stroke="#809099" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const GEN = `<svg class="mascot" viewBox="0 0 100 100" role="img" aria-label="Pet">
<circle cx="50" cy="52" r="30" fill="#A6E6CF"/><circle cx="40" cy="47" r="4" fill="#0F6E56"/><circle cx="60" cy="47" r="4" fill="#0F6E56"/>
<path d="M42 60 q8 7 16 0" stroke="#0F6E56" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<circle cx="30" cy="34" r="7" fill="#A6E6CF"/><circle cx="70" cy="34" r="7" fill="#A6E6CF"/></svg>`;

export function mascot(especie) {
  const e = (especie || '').toLowerCase();
  if (e.startsWith('cã') || e.startsWith('ca')) return DOG;
  if (e.startsWith('gat')) return CAT;
  return GEN;
}
