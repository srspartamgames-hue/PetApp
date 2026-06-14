function fmtKg(v) { return (Math.round(v * 10) / 10).toString().replace('.', ','); }
function shortDate(iso) { if (!iso) return ''; const p = iso.split('-'); return `${p[2]}/${p[1]}`; }

// Posiciona e preenche a "bolha" de peso acima do ponto (abaixo se perto do topo),
// alinhada para dentro nas pontas para não sair do gráfico.
function posTip(tip, c) {
  const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy');
  tip.textContent = c.getAttribute('data-v') + ' kg';
  tip.setAttribute('text-anchor', cx < 44 ? 'start' : cx > 276 ? 'end' : 'middle');
  tip.setAttribute('x', cx);
  tip.setAttribute('y', cy > 42 ? cy - 12 : cy + 20);
}

// Handler global (definido uma vez): hover do mouse mostra/oculta; toque (iPhone)
// fixa o peso do ponto tocado. A bolinha cresce um pouco em ambos os casos.
if (typeof window !== 'undefined' && !window.__wc) {
  window.__wc = function (c, e) {
    const svg = c.ownerSVGElement; if (!svg) return;
    const tip = svg.querySelector('.wtip'); if (!tip) return;
    const grow = () => { c.style.transform = 'scale(1.55)'; posTip(tip, c); tip.style.opacity = '1'; };
    if (e.type === 'pointerenter') { if (e.pointerType === 'mouse') grow(); }
    else if (e.type === 'pointerleave') { if (e.pointerType === 'mouse') { c.style.transform = ''; tip.style.opacity = '0'; } }
    else if (e.type === 'pointerdown') {
      if (e.pointerType !== 'mouse') {
        svg.querySelectorAll('circle[data-v]').forEach(o => { o.style.transform = ''; });
        grow();
      }
    }
  };
}

/* pontos: [{data:'YYYY-MM-DD', valor:Number}] em ordem crescente por data.
   Linha de peso com eixos X (datas) e Y (kg) e área suave. O peso de cada ponto
   aparece ao passar o mouse ou tocar na bolinha (sem rótulos fixos).
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

  // Bolinhas interativas (peso aparece no hover/toque)
  const dots = coords.map((c, i) =>
    `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="4.5" fill="var(--teal-400)" stroke="var(--surface)" stroke-width="2" data-v="${fmtKg(pontos[i].valor)}" style="cursor:pointer;transform-box:fill-box;transform-origin:center;transition:transform .12s ease" onpointerenter="__wc(this,event)" onpointerleave="__wc(this,event)" onpointerdown="__wc(this,event)"/>`).join('');

  // Datas no eixo X: no máximo ~6 rótulos para não amontoar.
  const maxL = 6, stepL = Math.ceil(pontos.length / maxL);
  const xLabels = pontos.map((p, i) => {
    if (pontos.length > maxL && i % stepL !== 0 && i !== pontos.length - 1) return '';
    const anchor = i === 0 ? 'start' : i === pontos.length - 1 ? 'end' : 'middle';
    return `<text x="${X(i).toFixed(1)}" y="${(y1 + 16).toFixed(1)}" font-size="9.5" fill="var(--text-3)" text-anchor="${anchor}">${shortDate(p.data)}</text>`;
  }).join('');

  // Bolha de peso (uma só, mostrada sob demanda) — fica por cima de tudo.
  const tip = `<text class="wtip" x="0" y="0" font-size="11" font-weight="700" fill="var(--teal-600)" font-family="var(--display)" text-anchor="middle" style="opacity:0;transition:opacity .12s ease;pointer-events:none"></text>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolução de peso">`
    + grid
    + `<path d="${areaPath}" fill="var(--teal-50)"/>`
    + `<polyline points="${linePts}" fill="none" stroke="var(--teal-400)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
    + dots + xLabels + tip
    + `</svg>`;
}
