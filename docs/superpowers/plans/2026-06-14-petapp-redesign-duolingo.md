# PetApp — Redesign "Duolingo-grade" + Tema escuro + Pet-demo — Plano

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repaginar o MVP do PetApp para um visual bonito/profissional/divertido estilo Duolingo, com tema escuro alternável e um pet-demo (Thor, Dobermann macho) pré-carregado no primeiro acesso — sem alterar a lógica.

**Architecture:** A transformação visual é feita quase toda em `css/styles.css` **mantendo os mesmos nomes de variáveis CSS** (só mudam valores + bloco `[data-theme="dark"]`), então os estilos inline das views seguem funcionando. Fontes arredondadas (Fredoka/Nunito) são vendorizadas como woff2. Módulos novos e isolados — `theme.js`, `mascots.js`, `confetti.js`, `demo-seed.js` — adicionam tema, mascote, deleite e demo sem tocar em `db.js`/`alerts.js`/`router`.

**Tech Stack:** HTML/CSS/JS ES modules (sem build), IndexedDB, Service Worker/PWA, `node --test`. Fontes via `@fontsource` (woff2, licença SIL OFL).

---

## Convenções de verificação
- Servir: `python -m http.server 8080` (raiz) → `http://localhost:8080/`.
- Testes de lógica pura: `node --test`.
- O controlador (sessão principal) faz a verificação **visual** no navegador (claro e escuro). Os subagentes verificam `node --check` e `node --test` e que arquivos existem.
- Commits ao fim de cada task, mensagens em português.

## Mapa de arquivos
```
fonts/                         woff2 (Fredoka 600/700, Nunito 600/700/800) + OFL.txt   [novo]
css/styles.css                 REESCRITO: tokens claro/escuro, @font-face, 3D, animações
js/theme.js                    initTheme/toggleTheme/currentTheme                       [novo]
js/mascots.js                  mascot(especie) -> SVG (cão/gato/genérico)               [novo]
js/confetti.js                 celebrate()                                              [novo]
js/demo-seed.js                seedDemo() — semeia Thor uma vez                         [novo]
js/icons.js                    + ícones sun/moon
js/dates.js                    + addDays(iso,n) (testado)
index.html                     boot de tema no <head> + botão toggle no header
js/app.js                      init async: initTheme + toggle + seedDemo
js/components/chart.js         recolorir linha para o verde novo
js/views/inicio.js, pet.js     mascote nos vazios/avatar
js/views/rotina.js             confete ao concluir 100%
js/views/tutor.js              botão "Começar do zero"
sw.js                          cache v2 + fontes + novos js
```

---

### Task 1: Vendorizar as fontes (Fredoka + Nunito)

**Files:**
- Create: `fonts/fredoka-600.woff2`, `fonts/fredoka-700.woff2`, `fonts/nunito-600.woff2`, `fonts/nunito-700.woff2`, `fonts/nunito-800.woff2`, `fonts/OFL.txt`

- [ ] **Step 1: Baixar os woff2** (na raiz do projeto)

```bash
mkdir -p fonts
curl -fL -o fonts/fredoka-600.woff2 "https://cdn.jsdelivr.net/npm/@fontsource/fredoka@5/files/fredoka-latin-600-normal.woff2"
curl -fL -o fonts/fredoka-700.woff2 "https://cdn.jsdelivr.net/npm/@fontsource/fredoka@5/files/fredoka-latin-700-normal.woff2"
curl -fL -o fonts/nunito-600.woff2  "https://cdn.jsdelivr.net/npm/@fontsource/nunito@5/files/nunito-latin-600-normal.woff2"
curl -fL -o fonts/nunito-700.woff2  "https://cdn.jsdelivr.net/npm/@fontsource/nunito@5/files/nunito-latin-700-normal.woff2"
curl -fL -o fonts/nunito-800.woff2  "https://cdn.jsdelivr.net/npm/@fontsource/nunito@5/files/nunito-latin-800-normal.woff2"
```

- [ ] **Step 2: Verificar que são woff2 válidos**

Run:
```bash
node -e "const fs=require('fs');for(const f of ['fredoka-600','fredoka-700','nunito-600','nunito-700','nunito-800']){const b=fs.readFileSync('fonts/'+f+'.woff2');const sig=b.slice(0,4).toString('latin1');console.log(f,b.length,sig);if(sig!=='wOF2'||b.length<1000)throw new Error('woff2 inválido: '+f)}"
```
Expected: cada arquivo com tamanho > 1000 e assinatura `wOF2`. Se algum 404/baixar inválido, **PARAR e reportar BLOCKED** (a URL do @fontsource pode ter mudado).

- [ ] **Step 3: Criar `fonts/OFL.txt`** (atribuição/licença)

```
Fontes empacotadas neste diretório:

- Fredoka — Copyright The Fredoka Project Authors (Google). SIL Open Font License 1.1.
- Nunito  — Copyright The Nunito Project Authors (Vernon Adams, Cyreal). SIL Open Font License 1.1.

Ambas distribuídas sob a SIL Open Font License, Version 1.1.
Texto completo da licença: https://openfontlicense.org
Arquivos woff2 obtidos via @fontsource (https://fontsource.org).
```

- [ ] **Step 4: Commit**

```bash
git add fonts/
git commit -m "feat: vendorizar fontes Fredoka e Nunito (woff2, OFL)"
```

---

### Task 2: Reescrever o sistema de design (`css/styles.css`)

Mantém TODOS os nomes de variáveis já usados (inclusive `--teal-*`), só muda valores e adiciona tema escuro, fontes, profundidade 3D e animações.

**Files:**
- Modify (substituir todo o conteúdo): `css/styles.css`

- [ ] **Step 1: Substituir `css/styles.css` por:**

```css
/* ===== Fontes (vendorizadas) ===== */
@font-face{font-family:'Fredoka';font-style:normal;font-weight:600;font-display:swap;src:url('../fonts/fredoka-600.woff2') format('woff2')}
@font-face{font-family:'Fredoka';font-style:normal;font-weight:700;font-display:swap;src:url('../fonts/fredoka-700.woff2') format('woff2')}
@font-face{font-family:'Nunito';font-style:normal;font-weight:600;font-display:swap;src:url('../fonts/nunito-600.woff2') format('woff2')}
@font-face{font-family:'Nunito';font-style:normal;font-weight:700;font-display:swap;src:url('../fonts/nunito-700.woff2') format('woff2')}
@font-face{font-family:'Nunito';font-style:normal;font-weight:800;font-display:swap;src:url('../fonts/nunito-800.woff2') format('woff2')}

/* ===== Tokens (tema claro = padrão) ===== */
:root{
  --teal-50:#E1F5EE; --teal-100:#A6E6CF; --teal-400:#19B888;
  --teal-600:#0F6E56; --teal-800:#085041; --teal-900:#04342C;
  --green-lip:#0F8A66; --card-lip:#E3EFE9;
  --bg:#F2FBF7; --surface:#FFFFFF; --line:#E3EFE9;
  --text:#16241F; --text-2:#5B6B66; --text-3:#8A9A95;
  --ok:#19B888; --ok-bg:#E1F5EE; --ok-ink:#0F6E56;
  --warn:#EF9F27; --warn-bg:#FAEEDA; --warn-ink:#854F0B;
  --late:#E24B4A; --late-bg:#FBE9E7; --late-ink:#7A241B; --late-lip:#B23B3A;
  --r-sm:10px; --r-md:14px; --r-lg:18px; --r-xl:22px; --r-pill:999px;
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
  --shadow:0 1px 2px rgba(16,40,34,.04), 0 6px 18px rgba(16,40,34,.06);
  --nav-h:66px; --header-h:56px;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --display: 'Fredoka', var(--font);
  --body: 'Nunito', var(--font);
}
/* ===== Tema escuro ===== */
:root[data-theme="dark"]{
  --teal-50:#163026; --teal-100:#1E3D32; --teal-400:#19B888;
  --teal-600:#5DD6AE; --teal-800:#9FE7CD; --teal-900:#CFF3E6;
  --green-lip:#0C6B50; --card-lip:#0A120F;
  --bg:#0E1A16; --surface:#16241F; --line:#243A32;
  --text:#EAF3EF; --text-2:#9DB3AB; --text-3:#6E847C;
  --ok:#19B888; --ok-bg:#163026; --ok-ink:#7FE0BE;
  --warn:#EF9F27; --warn-bg:#3A2E14; --warn-ink:#F2C879;
  --late:#FF6B6A; --late-bg:#3A1E1D; --late-ink:#F0A9A8; --late-lip:#7A2E2D;
  --shadow:0 1px 2px rgba(0,0,0,.3), 0 6px 18px rgba(0,0,0,.35);
}

*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--body);font-weight:600;color:var(--text);background:var(--bg);
  -webkit-font-smoothing:antialiased;line-height:1.5;
  padding-bottom:calc(var(--nav-h) + env(safe-area-inset-bottom))}
h1{font-family:var(--display);font-size:23px;font-weight:700;margin:0}
h2{font-family:var(--display);font-size:19px;font-weight:600;margin:0}
h3{font-family:var(--display);font-size:16px;font-weight:600;margin:0}
small{color:var(--text-2)}
button{font-family:inherit}
.icon{width:24px;height:24px;display:inline-block;vertical-align:middle;fill:none;
  stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}

/* Shell */
.app-header{position:sticky;top:0;z-index:10;height:var(--header-h);
  display:flex;align-items:center;gap:var(--sp-2);padding:0 var(--sp-4);
  background:var(--surface);border-bottom:1.5px solid var(--line)}
.app-header strong{font-family:var(--display);font-weight:700;font-size:20px;color:var(--teal-600)}
.theme-toggle{border:none;background:var(--teal-50);color:var(--teal-600);width:38px;height:38px;
  border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
.theme-toggle .icon{width:20px;height:20px}
main#app{max-width:560px;margin:0 auto;padding:var(--sp-4)}

.bottom-nav{position:fixed;left:0;right:0;bottom:0;height:calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding-bottom:env(safe-area-inset-bottom);display:flex;background:var(--surface);
  border-top:1.5px solid var(--line);z-index:10}
.bottom-nav a{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;color:var(--text-3);text-decoration:none;
  font-family:var(--display);font-weight:600;font-size:11px}
.bottom-nav a .icon,.bottom-nav a span{position:relative;z-index:1}
.bottom-nav a.active{color:var(--teal-600)}
.bottom-nav a.active::before{content:"";position:absolute;top:9px;left:50%;transform:translateX(-50%);
  width:48px;height:30px;border-radius:var(--r-pill);background:var(--teal-50);z-index:0}
.bottom-nav a .badge{position:absolute;top:7px;right:50%;transform:translateX(18px);z-index:2;
  min-width:18px;height:18px;padding:0 5px;border-radius:var(--r-pill);background:var(--late);
  color:#fff;font-size:10px;line-height:18px;text-align:center;font-family:var(--body);font-weight:800}

/* Cards */
.card{background:var(--surface);border:1.5px solid var(--line);border-radius:var(--r-xl);
  padding:var(--sp-4);box-shadow:0 3px 0 var(--card-lip);margin-bottom:var(--sp-4)}
.card-row{display:flex;align-items:center;gap:var(--sp-3)}

/* Pílulas */
.pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:600;
  font-size:13px;padding:7px 13px;border-radius:var(--r-pill)}
.pill .icon{width:15px;height:15px}
.pill.ok{background:var(--ok-bg);color:var(--ok-ink)}
.pill.warn{background:var(--warn-bg);color:var(--warn-ink)}
.pill.late{background:var(--late-bg);color:var(--late-ink)}

/* Botões 3D */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--display);font-weight:600;font-size:15px;border:none;cursor:pointer;
  border-radius:var(--r-lg);padding:13px 18px;background:var(--surface);color:var(--text);
  box-shadow:0 3px 0 var(--card-lip);-webkit-tap-highlight-color:transparent;
  transition:transform .05s ease, box-shadow .05s ease}
.btn:active{transform:translateY(3px);box-shadow:0 0 0 var(--card-lip)}
.btn.primary{background:var(--teal-400);color:#fff;box-shadow:0 4px 0 var(--green-lip)}
.btn.primary:active{transform:translateY(4px);box-shadow:0 0 0 var(--green-lip)}
.btn.danger{background:var(--late);color:#fff;box-shadow:0 4px 0 var(--late-lip)}
.btn.danger:active{transform:translateY(4px);box-shadow:0 0 0 var(--late-lip)}
.btn.ghost{background:transparent;box-shadow:none;color:var(--teal-600);font-family:var(--body);font-weight:800}
.btn.ghost:active{transform:none}
.btn.block{width:100%}
.fab-add{display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:600;
  color:var(--teal-600);background:var(--teal-50);border:none;border-radius:var(--r-lg);
  padding:10px 14px;font-size:14px;cursor:pointer}

/* Formulários */
.field{margin-bottom:var(--sp-3)}
.field label{display:block;font-family:var(--body);font-weight:700;font-size:12px;color:var(--text-2);margin-bottom:5px}
.field input,.field select,.field textarea{width:100%;border:2px solid var(--line);
  border-radius:var(--r-lg);padding:13px 14px;font-size:16px;font-family:var(--body);font-weight:600;
  background:var(--surface);color:var(--text)}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;
  border-color:var(--teal-400);box-shadow:0 0 0 4px var(--teal-50)}
.field textarea{min-height:88px;resize:vertical}
.form-actions{display:flex;gap:var(--sp-3);margin-top:var(--sp-4)}

/* Acordeão */
.acc-item{background:var(--surface);border:1.5px solid var(--line);border-radius:var(--r-xl);
  margin-bottom:var(--sp-3);overflow:hidden;box-shadow:0 3px 0 var(--card-lip)}
.acc-head{display:flex;align-items:center;gap:var(--sp-3);width:100%;border:none;background:transparent;
  padding:var(--sp-4);cursor:pointer;font-family:var(--display);font-size:15px;font-weight:600;color:var(--text)}
.acc-head .chev{margin-left:auto;transition:transform .2s ease;color:var(--text-3)}
.acc-item.open .chev{transform:rotate(180deg)}
.acc-ico{color:var(--teal-400);display:flex}
.acc-body{padding:0 var(--sp-4) var(--sp-4);display:none}
.acc-item.open .acc-body{display:block}

/* Lista de registros */
.rec{display:flex;gap:var(--sp-3);padding:var(--sp-3) 0;border-top:1.5px solid var(--line)}
.rec:first-child{border-top:none}
.rec-main{flex:1;min-width:0}
.rec-main .t{font-family:var(--body);font-size:14px;font-weight:800}
.rec-main .s{font-size:12px;color:var(--text-2)}
.rec-actions{display:flex;gap:4px}
.icon-btn{border:none;background:transparent;color:var(--text-3);padding:7px;border-radius:var(--r-sm);cursor:pointer}
.icon-btn:active{background:var(--bg)}

/* Estado vazio + mascote */
.empty{text-align:center;color:var(--text-3);padding:var(--sp-6) var(--sp-4)}
.empty .icon{width:44px;height:44px;color:var(--teal-100);margin-bottom:var(--sp-3)}
.mascot{width:100%;height:100%;display:block}
.empty .mascot{width:104px;height:104px;margin:0 auto var(--sp-3)}
.empty p{margin:0 0 var(--sp-4);font-size:15px}

/* Rotina */
.check-row{display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-3);
  border:2px solid var(--line);border-radius:var(--r-lg);margin-bottom:var(--sp-2);cursor:pointer;
  box-shadow:0 2px 0 var(--card-lip);font-family:var(--body);font-weight:800;
  transition:background .15s ease, border-color .15s ease}
.check-row.done{background:var(--teal-50);border-color:var(--teal-400)}
.check-row .box{width:26px;height:26px;border-radius:50%;border:2.5px solid var(--line);
  display:flex;align-items:center;justify-content:center;color:transparent;flex:none}
.check-row.done .box{background:var(--teal-400);border-color:var(--teal-400);color:#fff;animation:pop .25s ease}
@keyframes pop{0%{transform:scale(.6)}60%{transform:scale(1.18)}100%{transform:scale(1)}}

/* Toast */
.toast{position:fixed;left:50%;bottom:calc(var(--nav-h) + 16px);transform:translateX(-50%);
  background:var(--teal-900);color:var(--bg);padding:11px 18px;border-radius:var(--r-pill);
  font-family:var(--display);font-weight:600;font-size:13px;z-index:50;opacity:0;transition:opacity .2s ease}
.toast.show{opacity:1}

/* Diálogo / sheet */
.scrim{position:fixed;inset:0;background:rgba(8,24,20,.5);display:flex;align-items:flex-end;
  justify-content:center;z-index:40}
.sheet{background:var(--surface);width:100%;max-width:560px;border-radius:var(--r-xl) var(--r-xl) 0 0;
  padding:var(--sp-5);max-height:90vh;overflow:auto}
@media(min-width:600px){.scrim{align-items:center}.sheet{border-radius:var(--r-xl)}}

/* Confete */
@keyframes confetti-fall{to{transform:translateY(108vh) rotate(720deg);opacity:.2}}

@media print{
  .app-header,.bottom-nav,.theme-toggle,.no-print{display:none!important}
  body{padding:0;background:#fff;color:#000}
  .card,.acc-item{box-shadow:none;border-color:#ccc}
  .acc-body{display:block!important}
}
@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;transition-duration:.001ms!important}
}
```

- [ ] **Step 2: Verificar visualmente** (controlador)

Run: servir e abrir `http://localhost:8080/`. Conferir que o app já parece transformado (fonte arredondada, botões verdes 3D, cards redondos). Sem erros de console.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: redesign do sistema de design (3D, fonte arredondada, tema escuro)"
```

---

### Task 3: Sistema de tema (toggle claro/escuro)

**Files:**
- Modify: `js/icons.js` (+ sun, moon)
- Create: `js/theme.js`
- Modify: `index.html` (boot no head + botão toggle)
- Modify: `js/app.js` (init async + wiring do tema)

- [ ] **Step 1: Adicionar ícones em `js/icons.js`** — no objeto `PATHS`, acrescentar duas entradas:

```js
  moon:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'
```
(adicione-as como propriedades dentro de `const PATHS = { ... }`, ex.: logo após `clock:'...'`).

- [ ] **Step 2: Criar `js/theme.js`**

```js
const KEY = 'petapp.theme';
export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
export function initTheme() {
  let t = 'light';
  try { t = localStorage.getItem(KEY) || 'light'; } catch {}
  document.documentElement.dataset.theme = t;
}
export function toggleTheme() {
  const t = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch {}
  return t;
}
```

- [ ] **Step 3: Editar `index.html`**

(a) No `<head>`, **antes** do `<link rel="stylesheet" ...>`, inserir o boot de tema (evita flash):
```html
  <script>(function(){try{document.documentElement.dataset.theme=localStorage.getItem('petapp.theme')||'light';}catch(e){document.documentElement.dataset.theme='light';}})();</script>
```

(b) Substituir o `<header>` inteiro por:
```html
  <header class="app-header">
    <strong>PetApp</strong>
    <div id="pet-switcher" style="margin-left:auto"></div>
    <button id="theme-toggle" class="theme-toggle" aria-label="Alternar tema claro/escuro"></button>
  </header>
```

- [ ] **Step 4: Editar `js/app.js`**

(a) Adicionar imports no topo (junto aos demais):
```js
import { initTheme, toggleTheme, currentTheme } from './theme.js';
```
(b) Acrescentar a função `paintThemeToggle` (perto de `paintNav`):
```js
function paintThemeToggle() {
  const b = document.getElementById('theme-toggle');
  b.innerHTML = icon(currentTheme() === 'dark' ? 'sun' : 'moon');
}
```
(c) Substituir a função `init` por (torna-se async; semente entra na Task 7):
```js
async function init() {
  document.getElementById('sprite').innerHTML = iconSprite();
  initTheme();
  paintNav();
  paintThemeToggle();
  document.getElementById('theme-toggle').onclick = () => { toggleTheme(); paintThemeToggle(); };
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
```

- [ ] **Step 5: Verificar** (controlador) — `node --check js/app.js js/theme.js js/icons.js`; no navegador, o toggle alterna claro/escuro, persiste ao recarregar, e o app **começa claro** na primeira visita.

- [ ] **Step 6: Commit**

```bash
git add js/icons.js js/theme.js index.html js/app.js
git commit -m "feat: tema escuro com toggle (inicia claro, persiste)"
```

---

### Task 4: Mascote

**Files:**
- Create: `js/mascots.js`
- Modify: `js/views/inicio.js`, `js/views/pet.js`, `js/components/chart.js`

- [ ] **Step 1: Criar `js/mascots.js`**

```js
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
```

- [ ] **Step 2: Usar o mascote em `js/views/inicio.js`**

(a) Adicionar import no topo:
```js
import { mascot } from '../mascots.js';
```
(b) Na tela de boas-vindas (sem pet), trocar `${icon('paw')}` pelo mascote. Substituir:
```js
    outlet.append(el(`<div class="empty">${icon('paw')}
      <p>Bem-vindo ao PetApp!<br>Comece cadastrando seu pet.</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
```
por:
```js
    outlet.append(el(`<div class="empty">${mascot('')}
      <p>Bem-vindo ao PetApp!<br>Comece cadastrando seu pet.</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
```
(c) No cabeçalho do pet (cartão com o avatar 56px), trocar o fallback `icon('paw')` por `mascot(pet.especie)` — é a ocorrência de `icon('paw')` que resta em `inicio.js` após o passo (b). O ramo `pet.foto ? <img...> : ...` continua igual; só muda o `else`.

- [ ] **Step 3: Usar o mascote em `js/views/pet.js`**

(a) Import:
```js
import { mascot } from '../mascots.js';
```
(b) No estado vazio da lista, trocar `${icon('paw')}` por `${mascot('')}`.
(c) No avatar de cada item da lista, trocar o fallback `icon('paw')` por `mascot(p.especie)` (o ramo quando `p.foto` é vazio).

- [ ] **Step 4: Recolorir a linha do gráfico** em `js/components/chart.js` — trocar as cores antigas pelo verde novo: `stroke="#1D9E75"` → `stroke="#19B888"`; e os `fill="#0F6E56"` dos pontos/círculos → `fill="#0F8A66"`.

- [ ] **Step 5: Verificar** (controlador) — `node --check` nos 3 arquivos; no navegador, o mascote aparece nos estados vazios e como avatar quando não há foto.

- [ ] **Step 6: Commit**

```bash
git add js/mascots.js js/views/inicio.js js/views/pet.js js/components/chart.js
git commit -m "feat: mascote-pet (cao/gato/generico) nos vazios e avatares"
```

---

### Task 5: Confete ao concluir a rotina

**Files:**
- Create: `js/confetti.js`
- Modify: `js/views/rotina.js`

- [ ] **Step 1: Criar `js/confetti.js`**

```js
export function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cores = ['#19B888', '#FFC34D', '#FF7A59', '#5DD6AE', '#378ADD'];
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden';
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    const s = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:${s}px;height:${s}px;`
      + `background:${cores[i % cores.length]};border-radius:2px;opacity:.9;`
      + `transform:rotate(${Math.random() * 360}deg);`
      + `animation:confetti-fall ${1.2 + Math.random() * 1.2}s ${Math.random() * 0.3}s ease-in forwards`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2800);
}
```

- [ ] **Step 2: Disparar no `js/views/rotina.js`**

(a) Import no topo:
```js
import { celebrate } from '../confetti.js';
```
(b) No handler de clique da `check-row`, disparar quando uma marcação completa 100% da rotina. Localizar o trecho que alterna o log:
```js
      if (isDone) { const log = logs.find(l => l.rotinaId === it.id && l.data === hoje); if (log) await db.remove('rotinaLog', log.id); }
      else { await db.put('rotinaLog', { petId, rotinaId: it.id, data: hoje }); }
      draw(outlet, petId);
```
e substituir por (marca; se a ação completou todos os itens, comemora):
```js
      if (isDone) { const log = logs.find(l => l.rotinaId === it.id && l.data === hoje); if (log) await db.remove('rotinaLog', log.id); }
      else {
        await db.put('rotinaLog', { petId, rotinaId: it.id, data: hoje });
        const logsNow = await db.getAll('rotinaLog', petId);
        const feitosNow = new Set(logsNow.filter(l => l.data === hoje).map(l => l.rotinaId));
        if (itens.length > 0 && itens.every(i => feitosNow.has(i.id))) celebrate();
      }
      draw(outlet, petId);
```

- [ ] **Step 3: Verificar** (controlador) — `node --check js/confetti.js js/views/rotina.js`; no navegador, marcar o último item da rotina dispara o confete (e nada dispara ao desmarcar).

- [ ] **Step 4: Commit**

```bash
git add js/confetti.js js/views/rotina.js
git commit -m "feat: confete ao concluir 100% da rotina do dia"
```

---

### Task 6: `addDays` em dates.js (TDD)

**Files:**
- Modify: `tests/dates.test.js`, `js/dates.js`

- [ ] **Step 1: Adicionar o teste** — em `tests/dates.test.js`, incluir no import `addDays` e acrescentar:

```js
test('addDays soma e subtrai dias', () => {
  assert.equal(addDays('2026-06-14', 5), '2026-06-19');
  assert.equal(addDays('2026-06-01', -25), '2026-05-07');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});
```
(O import passa a ser: `import { daysUntil, formatBR, ageString, addMonths, todayISO, addDays } from '../js/dates.js';`)

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test`
Expected: FALHA em `addDays` (`addDays is not a function`).

- [ ] **Step 3: Implementar em `js/dates.js`** — adicionar:

```js
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test`
Expected: todos passam (agora 10 testes).

- [ ] **Step 5: Commit**

```bash
git add js/dates.js tests/dates.test.js
git commit -m "feat: dates.addDays com teste"
```

---

### Task 7: Pet-demo (Thor, Dobermann)

**Files:**
- Create: `js/demo-seed.js`
- Modify: `js/app.js` (chamar `seedDemo` no boot)

- [ ] **Step 1: Criar `js/demo-seed.js`**

```js
import * as db from './db.js';
import { setCurrentPetId } from './state.js';
import { todayISO, addMonths, addDays } from './dates.js';

const FLAG = 'petapp.seeded';

export async function seedDemo() {
  try { if (localStorage.getItem(FLAG)) return; } catch { return; }
  const pets = await db.getAll('pets');
  if (pets.length) { try { localStorage.setItem(FLAG, '1'); } catch {} return; }

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

  try { localStorage.setItem(FLAG, '1'); } catch {}
}
```

- [ ] **Step 2: Chamar no boot** — em `js/app.js`:

(a) Import:
```js
import { seedDemo } from './demo-seed.js';
```
(b) Em `init()`, inserir `await seedDemo();` imediatamente antes de `render();`. O bloco final de `init` fica:
```js
  paintThemeToggle();
  document.getElementById('theme-toggle').onclick = () => { toggleTheme(); paintThemeToggle(); };
  await seedDemo();
  render();
```

- [ ] **Step 3: Verificar** (controlador) — `node --check js/demo-seed.js js/app.js`. No navegador, num perfil/IndexedDB **vazio**, ao abrir o app o "Thor" aparece populado (painel com peso, status, rotina 2/4, 1 alerta do NexGard). Recarregar **não** duplica dados. Em um navegador que já tinha dados próprios, nada é semeado.

- [ ] **Step 4: Commit**

```bash
git add js/demo-seed.js js/app.js
git commit -m "feat: pet-demo Thor (Dobermann) semeado no primeiro acesso"
```

---

### Task 8: "Começar do zero" no tutor

**Files:**
- Modify: `js/views/tutor.js`

- [ ] **Step 1: Editar `js/views/tutor.js`**

(a) O `tutor.js` já importa `* as db from '../db.js'` e `{ el, fieldForm, icon, toast } from '../ui.js'`. A ÚNICA mudança de import é acrescentar `confirmDialog` ao import de `../ui.js`:
```js
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
```
Não adicione um novo `import * as db` (já existe). Use `db.ALL_STORES` e `db.clearStore` pelo namespace `db`.

(b) Antes de `wrap.append(card)`, criar o cartão de "Começar do zero" e anexá-lo por último:
```js
  const danger = el(`<div class="card"><h3 style="margin-bottom:var(--sp-3)">Começar do zero</h3>
    <p class="s" style="margin-top:0;color:var(--text-2)">Remove o pet de demonstração e todos os dados deste navegador para você usar o app com o seu próprio pet.</p>
    <button class="btn danger block" data-reset>${icon('trash')} Limpar tudo</button></div>`);
  danger.querySelector('[data-reset]').onclick = async () => {
    if (await confirmDialog('Limpar TODOS os dados deste navegador? Esta ação não pode ser desfeita.')) {
      for (const s of db.ALL_STORES) await db.clearStore(s);
      try { localStorage.setItem('petapp.seeded', '1'); localStorage.removeItem('petapp.currentPet'); } catch {}
      toast('Tudo limpo'); location.hash = '#/inicio'; location.reload();
    }
  };
```
e logo após `wrap.append(bkp);` (ou após `wrap.append(card);` caso o backup esteja em outro ponto) acrescentar:
```js
  wrap.append(danger);
```
Confirmar que a ordem final de montagem inclua `card`, `bkp` e `danger` dentro de `wrap`, antes de `outlet.append(wrap)`.

- [ ] **Step 2: Verificar** (controlador) — `node --check js/views/tutor.js`. No navegador, "Limpar tudo" pede confirmação, esvazia os dados e mantém o app vazio (sem re-semear o demo).

- [ ] **Step 3: Commit**

```bash
git add js/views/tutor.js
git commit -m "feat: botao 'comecar do zero' (limpa dados e sai do modo demo)"
```

---

### Task 9: Atualizar o cache do PWA (v2 + fontes + novos JS)

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Substituir `sw.js` por** (cache `petapp-v2`, incluindo fontes e novos módulos)

```js
const CACHE = 'petapp-v2';
const ASSETS = [
  './', './index.html', './manifest.json', './css/styles.css',
  './js/app.js', './js/state.js', './js/db.js', './js/dates.js', './js/alerts.js',
  './js/backup.js', './js/icons.js', './js/ui.js', './js/notify.js',
  './js/theme.js', './js/mascots.js', './js/confetti.js', './js/demo-seed.js',
  './js/components/accordion.js', './js/components/recordSection.js',
  './js/components/chart.js', './js/components/petSwitcher.js',
  './js/views/inicio.js', './js/views/saude.js', './js/views/rotina.js',
  './js/views/alertas.js', './js/views/pet.js', './js/views/tutor.js',
  './fonts/fredoka-600.woff2', './fonts/fredoka-700.woff2',
  './fonts/nunito-600.woff2', './fonts/nunito-700.woff2', './fonts/nunito-800.woff2',
  './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
    return res;
  }).catch(() => caches.match('./index.html'))));
});
```

- [ ] **Step 2: Verificar** — `node --check sw.js`. Conferir (Node) que todos os caminhos de ASSETS (tirando `./`) existem no disco, lendo `sw.js` como texto (sem executá-lo):
```bash
node -e "const fs=require('fs');const m=fs.readFileSync('sw.js','utf8');const body=m.split('ASSETS = [')[1].split('];')[0];const arr=JSON.parse('['+body+']');let miss=0;for(const p of arr){if(p==='./')continue;const f=p.replace(/^\.\//,'');if(!fs.existsSync(f)){console.log('FALTA',p);miss++}}console.log(miss?('faltam '+miss+' assets'):'todos os assets existem')"
```
Expected: `todos os assets existem`.

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "chore: cache do PWA v2 (fontes + novos modulos)"
```

---

## Self-Review (cobertura da spec)

- **Fontes vendorizadas + @font-face + offline** → Task 1, 2, 9 ✓
- **Tokens claro/escuro, 3D lip, cantos maiores, cor semântica (verde positivo, vermelho destrutivo)** → Task 2 ✓
- **Componentes repaginados (botão/checkrow/card/pill/nav/inputs/sheet/empty)** → Task 2 ✓
- **Tema escuro + toggle, inicia claro, persiste, sem FOUC** → Task 3 ✓
- **Mascote por espécie (vazios + avatar)** → Task 4 ✓
- **Microinteração: confete ao concluir rotina, respeita reduced-motion** → Task 2 (keyframe) + Task 5 ✓
- **`addDays` (datas relativas do demo)** → Task 6 ✓
- **Pet-demo Thor (Dobermann) com todos os dados realistas, semeia 1x, datas relativas, define pet atual** → Task 7 ✓
- **"Começar do zero"** → Task 8 ✓
- **PWA cache atualizado (bump de versão)** → Task 9 ✓
- **Lógica intacta / testes verdes** → nenhuma task altera db/alerts/router; `node --test` cresce para 10 (Task 6) ✓

Consistência de nomes verificada: as views referenciam variáveis CSS `--teal-*`, `--line`, `--sp-*`, `--r-*`, `--text-*`, `--late` — todas **preservadas** em Task 2 (com overrides no tema escuro). `seedDemo`, `initTheme`, `toggleTheme`, `currentTheme`, `mascot`, `celebrate`, `addDays` usados exatamente como exportados.

## Fora de escopo (continua no roadmap)
Gamificação real (streaks/XP/níveis/conquistas), comunidade, marketplace, IA, integração com vet, conteúdo personalizado, login/nuvem, alertas externos. O mascote é decorativo.
