function fmtKg(v) { return (Math.round(v * 10) / 10).toString().replace('.', ','); }
function shortDate(iso) { if (!iso) return ''; const p = iso.split('-'); return `${p[2]}/${p[1]}`; }

/* pontos: [{data:'YYYY-MM-DD', valor:Number}] em ordem crescente por data.
   Gráfico de linha com eixos X (datas) e Y (kg), pontos rotulados e área suave.
   Cores via variáveis CSS → adapta ao tema claro/escuro. */
export function weightChart(pontos) {
  const W = 320, H = 172;
  if (!pontos.length) return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sem dados de peso"></svg>`;

  const PL = 34, PR = 14, PT = 26, PB = 28;
  const x0 = PL, x1 = W - PR, y1 = H - PB;
  const plotW = x1 - x0, plotH = y1 - PT;

  const vals = pontos.map(p => p.valor);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { lo -= 1; hi += 1; }
  const yMin = Math.floor(lo);
  const step = Math.max(1, Math.ceil((Math.ceil(hi) - yMin) / 4));
  const nTicks = Math.max(1, Math.ceil((Math.ceil(hi) - yMin) / step));
  const yMax = yMin + nTicks * step;

  const X = i => pontos.length === 1 ? (x0 + x1) / 2 : x0 + i * plotW / (pontos.length - 1);
  const Y = v => y1 - (v - yMin) / (yMax - yMin) * plotH;

  // Linhas-guia + rótulos do eixo Y (kg)
  let grid = '';
  for (let t = yMin; t <= yMax + 0.001; t += step) {
    const y = Y(t);
    grid += `<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1"/>`
      + `<text x="${x0 - 6}" y="${(y + 3).toFixed(1)}" font-size="10" fill="var(--text-3)" text-anchor="end">${t}</text>`;
  }

  const coords = pontos.map((p, i) => [X(i), Y(p.valor)]);
  const linePts = coords.map(c => `${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ');
  const areaPath = `M ${coords[0][0].toFixed(1)} ${y1} `
    + coords.map(c => `L ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ')
    + ` L ${coords[coords.length - 1][0].toFixed(1)} ${y1} Z`;

  const dots = coords.map(c =>
    `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="4.5" fill="var(--teal-400)" stroke="var(--surface)" stroke-width="2"/>`).join('');

  // Rótulos de valor: só com poucos pontos; sempre ACIMA do ponto (abaixo apenas
  // se muito perto do topo) — nunca embaixo, onde ficam as datas. Pontas alinhadas
  // para dentro para não invadir os eixos.
  let valLabels = '';
  if (pontos.length <= 7) {
    valLabels = coords.map((c, i) => {
      const above = c[1] - 10 > PT + 4;
      const ly = above ? c[1] - 9 : c[1] + 16;
      const anchor = i === 0 ? 'start' : i === pontos.length - 1 ? 'end' : 'middle';
      return `<text x="${c[0].toFixed(1)}" y="${ly.toFixed(1)}" font-size="10.5" font-weight="700" fill="var(--teal-600)" text-anchor="${anchor}" font-family="var(--display)">${fmtKg(pontos[i].valor)}</text>`;
    }).join('');
  }

  // Datas no eixo X: no máximo ~6 rótulos para não amontoar.
  const maxL = 6, stepL = Math.ceil(pontos.length / maxL);
  const xLabels = pontos.map((p, i) => {
    if (pontos.length > maxL && i % stepL !== 0 && i !== pontos.length - 1) return '';
    const anchor = i === 0 ? 'start' : i === pontos.length - 1 ? 'end' : 'middle';
    return `<text x="${X(i).toFixed(1)}" y="${(y1 + 16).toFixed(1)}" font-size="9.5" fill="var(--text-3)" text-anchor="${anchor}">${shortDate(p.data)}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolução de peso">`
    + grid
    + `<path d="${areaPath}" fill="var(--teal-50)"/>`
    + `<polyline points="${linePts}" fill="none" stroke="var(--teal-400)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    + dots + valLabels + xLabels
    + `</svg>`;
}
