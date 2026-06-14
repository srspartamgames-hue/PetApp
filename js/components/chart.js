import { formatBR } from '../dates.js';

/* pontos: [{data:'YYYY-MM-DD', valor:Number}] (ordem crescente por data) */
export function weightChart(pontos) {
  const W = 320, H = 120, P = 24;
  if (!pontos.length) return `<svg viewBox="0 0 ${W} ${H}"></svg>`;
  const vals = pontos.map(p => p.valor);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = (max - min) || 1;
  const x = i => P + (pontos.length === 1 ? (W-2*P)/2 : i * (W - 2*P) / (pontos.length - 1));
  const y = v => H - P - ((v - min) / span) * (H - 2*P);
  const pts = pontos.map((p,i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
  const dots = pontos.map((p,i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="3" fill="#0F6E56"/>`).join('');
  const last = pontos[pontos.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolução de peso">
    <polyline points="${pts}" fill="none" stroke="#1D9E75" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <text x="${P}" y="14" font-size="11" fill="#8A9A95">${min.toFixed(1)}–${max.toFixed(1)} kg</text>
    <text x="${W-P}" y="${H-6}" font-size="11" fill="#5B6B66" text-anchor="end">${formatBR(last.data)}</text>
  </svg>`;
}
