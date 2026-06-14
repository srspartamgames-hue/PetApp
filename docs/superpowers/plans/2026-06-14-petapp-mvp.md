# PetApp MVP — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o MVP do PetApp — um PWA estático (sem backend) para tutores registrarem a saúde, rotina e alertas dos seus pets, publicável no GitHub Pages.

**Architecture:** SPA em HTML/CSS/JS puro (ES modules, sem build), roteamento por hash, persistência local em IndexedDB através de uma camada `db.js`. UI montada por componentes reutilizáveis e configs (DRY). Lógica de regra de negócio (datas, alertas) isolada em módulos puros testados com `node --test`. Visual caprichado é requisito de primeira classe (sistema de design com tokens).

**Tech Stack:** HTML5, CSS (custom properties), JavaScript ES modules, IndexedDB, Service Worker + Web App Manifest (PWA), Notifications API. Testes: `node --test` (nativo, sem dependências). Servidor de dev: `python -m http.server`.

---

## Convenções de verificação

- **Servidor de dev:** a partir da raiz do projeto, rode `python -m http.server 8080` e abra `http://localhost:8080/`. (ES modules e o service worker exigem `http://`, não `file://`.)
- **Testes de lógica pura:** `node --test` na raiz.
- **Commits:** ao final de cada task. Mensagens em português, prefixo `feat:`/`docs:`/`chore:`/`test:`.

## Estrutura de arquivos (mapa)

```
index.html              app-shell: header, <nav> inferior, sprite de ícones, <main id="app">
manifest.json           metadados do PWA
sw.js                   service worker (cache do app-shell, offline)
package.json            só para `node --test` ("type":"module")
.gitignore
icons/                  ícones PNG do PWA (192/512) + favicon
css/
  styles.css            tokens (cores/espaçamento/tipografia) + componentes
js/
  app.js                bootstrap + router por hash
  state.js              pet atual (localStorage)
  db.js                 camada IndexedDB (getAll/get/put/remove/dump/restore)
  dates.js              utilidades de data/idade (PURO, testado)
  alerts.js             cálculo de status/alertas (PURO, testado)
  backup.js             exportar/importar JSON
  icons.js              helper icon(name) -> markup <svg><use/></svg>
  ui.js                 helpers de DOM (el, fieldForm, confirmDialog, toast)
  components/
    accordion.js        seção colapsável
    recordSection.js    seção CRUD config-driven (lista + form)
    chart.js            gráfico de peso (SVG à mão)
    petSwitcher.js      seletor de pet no header
  views/
    inicio.js  saude.js  rotina.js  alertas.js  pet.js  tutor.js
tests/
  dates.test.js  alerts.test.js
docs/superpowers/...     spec e este plano
```

---

# FASE A — Fundação

### Task 1: Scaffolding do projeto

**Files:**
- Create: `package.json`, `.gitignore`, `index.html` (placeholder), `README.md`

- [ ] **Step 1: Criar `package.json`** (só habilita ES modules em testes e o atalho de teste)

```json
{
  "name": "petapp",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "dev": "python -m http.server 8080"
  }
}
```

- [ ] **Step 2: Criar `.gitignore`**

```
node_modules/
.DS_Store
*.log
.vscode/
```

- [ ] **Step 3: Criar `index.html` mínimo** (será expandido na Task 3)

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>PetApp</title>
</head>
<body>
  <main id="app">PetApp</main>
</body>
</html>
```

- [ ] **Step 4: Criar `README.md`**

```markdown
# PetApp

PWA de organização da saúde e rotina de pets. App estático (sem backend),
dados locais no navegador (IndexedDB). Publicável no GitHub Pages.

## Desenvolvimento
- Servir: `npm run dev` (python -m http.server 8080) e abrir http://localhost:8080
- Testes da lógica pura: `npm test` (node --test)

Spec e plano em `docs/superpowers/`.
```

- [ ] **Step 5: Verificar e commitar**

Run: `python -m http.server 8080` e abrir `http://localhost:8080/`.
Expected: a página mostra "PetApp".

```bash
git add package.json .gitignore index.html README.md
git commit -m "chore: scaffolding inicial do projeto"
```

---

### Task 2: Sistema de design (CSS)

Fundação visual — tokens + componentes base. Capricho aqui é o que cumpre o requisito de "validar o design".

**Files:**
- Create: `css/styles.css`

- [ ] **Step 1: Criar `css/styles.css` com tokens e base**

```css
:root {
  /* Paleta verde-água (saúde serena) */
  --teal-50:#E1F5EE; --teal-100:#9FE1CB; --teal-400:#1D9E75;
  --teal-600:#0F6E56; --teal-800:#085041; --teal-900:#04342C;
  /* Neutros */
  --bg:#F7F9F8; --surface:#FFFFFF; --line:#E7ECEA;
  --text:#1C2B27; --text-2:#5B6B66; --text-3:#8A9A95;
  /* Status */
  --ok:#1D9E75; --ok-bg:#E1F5EE; --ok-ink:#085041;
  --warn:#BA7517; --warn-bg:#FAEEDA; --warn-ink:#633806;
  --late:#C0392B; --late-bg:#FBE9E7; --late-ink:#7A241B;
  /* Forma e ritmo */
  --r-sm:8px; --r-md:12px; --r-lg:18px; --r-pill:999px;
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
  --shadow:0 1px 2px rgba(16,40,34,.04), 0 4px 16px rgba(16,40,34,.06);
  --nav-h:64px; --header-h:56px;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing:border-box; }
html,body { margin:0; }
body {
  font-family:var(--font); color:var(--text); background:var(--bg);
  -webkit-font-smoothing:antialiased; line-height:1.5;
  padding-bottom:calc(var(--nav-h) + env(safe-area-inset-bottom));
}
h1{font-size:22px;font-weight:600;margin:0} h2{font-size:18px;font-weight:600;margin:0}
h3{font-size:15px;font-weight:600;margin:0} small{color:var(--text-2)}
button{font-family:inherit}
.icon{width:24px;height:24px;display:inline-block;vertical-align:middle;fill:none;
  stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* Layout shell */
.app-header{position:sticky;top:0;z-index:10;height:var(--header-h);
  display:flex;align-items:center;gap:var(--sp-3);padding:0 var(--sp-4);
  background:var(--surface);border-bottom:1px solid var(--line)}
main#app{max-width:560px;margin:0 auto;padding:var(--sp-4)}
.bottom-nav{position:fixed;left:0;right:0;bottom:0;height:calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding-bottom:env(safe-area-inset-bottom);display:flex;background:var(--surface);
  border-top:1px solid var(--line);z-index:10}
.bottom-nav a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:2px;color:var(--text-3);text-decoration:none;font-size:11px;position:relative}
.bottom-nav a.active{color:var(--teal-600)}
.bottom-nav a .badge{position:absolute;top:8px;right:50%;transform:translateX(16px);
  min-width:16px;height:16px;padding:0 4px;border-radius:var(--r-pill);background:var(--late);
  color:#fff;font-size:10px;line-height:16px;text-align:center}

/* Cartões */
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:var(--sp-4);box-shadow:var(--shadow);margin-bottom:var(--sp-4)}
.card-row{display:flex;align-items:center;gap:var(--sp-3)}

/* Pílulas de status */
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;
  padding:5px 10px;border-radius:var(--r-pill)}
.pill .icon{width:14px;height:14px}
.pill.ok{background:var(--ok-bg);color:var(--ok-ink)}
.pill.warn{background:var(--warn-bg);color:var(--warn-ink)}
.pill.late{background:var(--late-bg);color:var(--late-ink)}

/* Botões */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  border:1px solid var(--line);background:var(--surface);color:var(--text);
  border-radius:var(--r-md);padding:10px 16px;font-size:14px;font-weight:500;cursor:pointer;
  transition:transform .06s ease, background .15s ease}
.btn:active{transform:scale(.98)}
.btn.primary{background:var(--teal-600);border-color:var(--teal-600);color:#fff}
.btn.primary:active{background:var(--teal-800)}
.btn.block{width:100%}
.btn.ghost{background:transparent;border-color:transparent;color:var(--teal-600)}
.fab-add{display:inline-flex;align-items:center;gap:6px;color:var(--teal-600);
  background:var(--teal-50);border:none;border-radius:var(--r-md);padding:8px 12px;
  font-size:13px;font-weight:500;cursor:pointer}

/* Formulários */
.field{margin-bottom:var(--sp-3)}
.field label{display:block;font-size:12px;color:var(--text-2);margin-bottom:4px}
.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);
  border-radius:var(--r-md);padding:11px 12px;font-size:15px;font-family:inherit;
  background:var(--surface);color:var(--text)}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;
  border-color:var(--teal-400);box-shadow:0 0 0 3px var(--teal-50)}
.field textarea{min-height:84px;resize:vertical}
.form-actions{display:flex;gap:var(--sp-3);margin-top:var(--sp-4)}

/* Acordeão */
.acc-item{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  margin-bottom:var(--sp-3);overflow:hidden}
.acc-head{display:flex;align-items:center;gap:var(--sp-3);width:100%;border:none;
  background:transparent;padding:var(--sp-4);cursor:pointer;font-size:15px;font-weight:600;color:var(--text)}
.acc-head .chev{margin-left:auto;transition:transform .2s ease;color:var(--text-3)}
.acc-item.open .chev{transform:rotate(180deg)}
.acc-ico{color:var(--teal-600);display:flex}
.acc-body{padding:0 var(--sp-4) var(--sp-4);display:none}
.acc-item.open .acc-body{display:block}

/* Lista de registros */
.rec{display:flex;gap:var(--sp-3);padding:var(--sp-3) 0;border-top:1px solid var(--line)}
.rec:first-child{border-top:none}
.rec-main{flex:1;min-width:0}
.rec-main .t{font-size:14px;font-weight:500}
.rec-main .s{font-size:12px;color:var(--text-2)}
.rec-actions{display:flex;gap:4px}
.icon-btn{border:none;background:transparent;color:var(--text-3);padding:6px;border-radius:var(--r-sm);cursor:pointer}
.icon-btn:active{background:var(--bg)}

/* Estado vazio */
.empty{text-align:center;color:var(--text-3);padding:var(--sp-6) var(--sp-4)}
.empty .icon{width:40px;height:40px;color:var(--teal-100);margin-bottom:var(--sp-3)}
.empty p{margin:0 0 var(--sp-4)}

/* Rotina */
.check-row{display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-3);
  border:1px solid var(--line);border-radius:var(--r-md);margin-bottom:var(--sp-2);cursor:pointer;
  transition:background .15s ease}
.check-row.done{background:var(--teal-50);border-color:var(--teal-100)}
.check-row .box{width:24px;height:24px;border-radius:50%;border:2px solid var(--line);
  display:flex;align-items:center;justify-content:center;color:transparent;flex:none}
.check-row.done .box{background:var(--teal-600);border-color:var(--teal-600);color:#fff}

/* Toast */
.toast{position:fixed;left:50%;bottom:calc(var(--nav-h) + 16px);transform:translateX(-50%);
  background:var(--teal-900);color:#fff;padding:10px 16px;border-radius:var(--r-pill);
  font-size:13px;z-index:50;opacity:0;transition:opacity .2s ease}
.toast.show{opacity:1}

/* Diálogo/modal */
.scrim{position:fixed;inset:0;background:rgba(16,40,34,.45);display:flex;align-items:flex-end;
  justify-content:center;z-index:40}
.sheet{background:var(--surface);width:100%;max-width:560px;border-radius:var(--r-lg) var(--r-lg) 0 0;
  padding:var(--sp-5);max-height:90vh;overflow:auto}
@media(min-width:600px){.scrim{align-items:center}.sheet{border-radius:var(--r-lg)}}

@media print{
  .app-header,.bottom-nav,.no-print{display:none!important}
  body{padding:0;background:#fff}
  .card,.acc-item{box-shadow:none;border-color:#ccc}
  .acc-body{display:block!important}
}
```

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: sistema de design (tokens e componentes base)"
```

---

### Task 3: App-shell, sprite de ícones e router

**Files:**
- Modify: `index.html`
- Create: `js/icons.js`, `js/app.js`, `js/state.js`
- Create (stubs): `js/views/inicio.js`, `saude.js`, `rotina.js`, `alertas.js`, `pet.js`, `tutor.js`

- [ ] **Step 1: Criar `js/icons.js`** (sprite SVG embutido + helper)

```js
const PATHS = {
  paw:'M5 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 14a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM9 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM15 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 13c-2.5 0-4.5 1.8-4.5 4 0 1.4 1.2 2 2.5 2h4c1.3 0 2.5-.6 2.5-2 0-2.2-2-4-4.5-4z',
  home:'M3 11l9-7 9 7M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9',
  health:'M3 12h4l2 5 4-10 2 5h6',
  list:'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  bell:'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0',
  plus:'M12 5v14M5 12h14',
  edit:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash:'M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3',
  x:'M18 6L6 18M6 6l12 12',
  check:'M5 12l5 5L20 7',
  chevron:'M6 9l6 6 6-6',
  download:'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2',
  upload:'M12 21V9m0 0l-4 4m4-4l4 4M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2',
  calendar:'M4 7h16v13H4zM4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M8 3v4M16 3v4',
  camera:'M3 8a1 1 0 0 1 1-1h3l1.5-2h7L14 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  syringe:'M14 4l6 6M16 6l-9.5 9.5L4 20l-1 1M9 11l3 3M12 8l3 3',
  pill:'M10.5 13.5l3-3M7 17a4 4 0 0 1 0-6l4-4a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0z',
  scissors:'M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 8l12 8M8 16L20 8',
  flask:'M9 3h6M10 3v6l-5 9a1 1 0 0 0 1 1.5h12A1 1 0 0 0 19 18l-5-9V3M7 14h10',
  dog:'M10 5L8 4 6 6v3l-2 1v4l2 2v3h4v-3h4v3h4v-6l-2-2V7l-2-2-2 1z',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2'
};
export function iconSprite() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${
    Object.entries(PATHS).map(([n,d]) =>
      `<symbol id="i-${n}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`).join('')}</svg>`;
}
export function icon(name, cls='') {
  return `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
```

- [ ] **Step 2: Criar `js/state.js`**

```js
const KEY = 'petapp.currentPet';
export function getCurrentPetId() { const v = localStorage.getItem(KEY); return v ? Number(v) : null; }
export function setCurrentPetId(id) { localStorage.setItem(KEY, String(id)); }
```

- [ ] **Step 3: Substituir `index.html`** pelo app-shell completo

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0F6E56" />
  <title>PetApp</title>
  <link rel="manifest" href="manifest.json" />
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <div id="sprite"></div>
  <header class="app-header">
    <strong style="color:var(--teal-600)">PetApp</strong>
    <div id="pet-switcher" style="margin-left:auto"></div>
  </header>
  <main id="app"></main>
  <nav class="bottom-nav" id="nav">
    <a href="#/inicio" data-path="inicio"></a>
    <a href="#/saude" data-path="saude"></a>
    <a href="#/rotina" data-path="rotina"></a>
    <a href="#/alertas" data-path="alertas"></a>
  </nav>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Criar stubs das views** — cada arquivo em `js/views/` exporta `render(outlet, params)`:

`js/views/inicio.js`:
```js
export async function render(outlet) { outlet.innerHTML = '<h1>Início</h1>'; }
```
Repetir idêntico (trocando o texto) para `saude.js` ("Saúde"), `rotina.js` ("Rotina"), `alertas.js` ("Alertas"), `pet.js` ("Pet"), `tutor.js` ("Tutor").

- [ ] **Step 5: Criar `js/app.js`** (bootstrap + router)

```js
import { iconSprite, icon } from './icons.js';
import * as inicio from './views/inicio.js';
import * as saude from './views/saude.js';
import * as rotina from './views/rotina.js';
import * as alertas from './views/alertas.js';
import * as pet from './views/pet.js';
import * as tutor from './views/tutor.js';

const routes = { inicio, saude, rotina, alertas, pet, tutor };
const NAV = {
  inicio:{icon:'home',label:'Início'}, saude:{icon:'health',label:'Saúde'},
  rotina:{icon:'list',label:'Rotina'}, alertas:{icon:'bell',label:'Alertas'}
};
const outlet = document.getElementById('app');

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, ...params] = h.split('/');
  return { path: path || 'inicio', params };
}
function paintNav() {
  document.querySelectorAll('#nav a').forEach(a => {
    const p = a.dataset.path;
    a.innerHTML = `${icon(NAV[p].icon)}<span>${NAV[p].label}</span>`;
  });
}
function setActive(path) {
  document.querySelectorAll('#nav a').forEach(a =>
    a.classList.toggle('active', a.dataset.path === path));
}
async function render() {
  const { path, params } = parseHash();
  const view = routes[path] || routes.inicio;
  outlet.innerHTML = '';
  await view.render(outlet, params);
  setActive(path);
  window.scrollTo(0, 0);
}
function init() {
  document.getElementById('sprite').innerHTML = iconSprite();
  paintNav();
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', init);
```

> Nota: `sw.js` ainda não existe; o `.catch(()=>{})` evita erro até a Task 22.

- [ ] **Step 6: Verificar e commitar**

Run: `python -m http.server 8080`, abrir `http://localhost:8080/`.
Expected: header "PetApp", nav inferior com 4 abas (ícones + rótulos), trocar de aba muda o conteúdo e destaca a aba ativa.

```bash
git add index.html js/
git commit -m "feat: app-shell, sprite de icones e router por hash"
```

---

### Task 4: Camada de dados (IndexedDB)

**Files:**
- Create: `js/db.js`

- [ ] **Step 1: Criar `js/db.js`**

```js
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
```

- [ ] **Step 2: Verificar no console do navegador**

Run: com o app aberto em `http://localhost:8080/`, no console:
```js
const db = await import('./js/db.js');
const id = await db.put('pets', { nome:'Thor', especie:'Cão' });
console.log('id', id, await db.getAll('pets'));
```
Expected: `id 1` e um array com o pet Thor. Recarregar a página e repetir `await (await import('./js/db.js')).getAll('pets')` ainda retorna o Thor (persistiu).

- [ ] **Step 3: Commit**

```bash
git add js/db.js
git commit -m "feat: camada de dados IndexedDB (db.js)"
```

---

### Task 5: Utilidades de data (PURO, TDD)

**Files:**
- Create: `js/dates.js`
- Test: `tests/dates.test.js`

- [ ] **Step 1: Escrever o teste que falha** — `tests/dates.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysUntil, formatBR, ageString, addMonths, todayISO } from '../js/dates.js';

test('daysUntil conta dias com sinal', () => {
  assert.equal(daysUntil('2026-06-20', '2026-06-14'), 6);
  assert.equal(daysUntil('2026-06-10', '2026-06-14'), -4);
  assert.equal(daysUntil('2026-06-14', '2026-06-14'), 0);
});
test('formatBR converte ISO para dd/mm/aaaa', () => {
  assert.equal(formatBR('2026-06-14'), '14/06/2026');
  assert.equal(formatBR(''), '');
});
test('ageString em anos e meses', () => {
  assert.equal(ageString('2023-06-14', '2026-06-14'), '3 anos');
  assert.equal(ageString('2025-06-14', '2026-06-14'), '1 ano');
  assert.equal(ageString('2026-01-14', '2026-06-14'), '5 meses');
});
test('addMonths soma meses', () => {
  assert.equal(addMonths('2026-01-15', 2), '2026-03-15');
});
test('todayISO retorna a data local da Date dada', () => {
  assert.equal(todayISO(new Date(2026, 5, 14, 9, 0)), '2026-06-14');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test`
Expected: FALHA (`Cannot find module ../js/dates.js`).

- [ ] **Step 3: Implementar `js/dates.js`**

```js
const MS = 86400000;
export function todayISO(d = new Date()) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
export function daysUntil(targetISO, baseISO) {
  return Math.round((Date.parse(targetISO + 'T00:00:00') - Date.parse(baseISO + 'T00:00:00')) / MS);
}
export function formatBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
export function ageString(birthISO, baseISO) {
  if (!birthISO) return '';
  const [by, bm, bd] = birthISO.split('-').map(Number);
  const [ty, tm, td] = baseISO.split('-').map(Number);
  let years = ty - by, months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}
export function addMonths(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test`
Expected: todos os testes de `dates.test.js` PASSAM.

- [ ] **Step 5: Commit**

```bash
git add js/dates.js tests/dates.test.js
git commit -m "feat: utilidades de data com testes (dates.js)"
```

---

### Task 6: Helpers de UI (DOM, formulários, toast, diálogo)

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: Criar `js/ui.js`**

```js
import { icon } from './icons.js';

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function toast(msg) {
  const t = el(`<div class="toast">${msg}</div>`);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 1800);
}
export function confirmDialog(msg, { ok='Excluir', danger=true } = {}) {
  return new Promise(resolve => {
    const scrim = el(`<div class="scrim"><div class="sheet">
      <p style="margin-top:0">${msg}</p>
      <div class="form-actions">
        <button class="btn block" data-no>Cancelar</button>
        <button class="btn block ${danger?'':'primary'}" data-yes
          ${danger?'style="background:var(--late);border-color:var(--late);color:#fff"':''}>${ok}</button>
      </div></div></div>`);
    scrim.querySelector('[data-no]').onclick = () => { scrim.remove(); resolve(false); };
    scrim.querySelector('[data-yes]').onclick = () => { scrim.remove(); resolve(true); };
    scrim.onclick = e => { if (e.target === scrim) { scrim.remove(); resolve(false); } };
    document.body.appendChild(scrim);
  });
}

/* fieldForm: monta um <form> a partir de uma spec de campos.
   spec: [{ name, label, type, options?, required?, placeholder? }]
   type ∈ text|textarea|date|number|select|tel|email|photo
   Retorna { form, getValues() }  */
export function fieldForm(spec, values = {}) {
  const form = el('<form></form>');
  for (const f of spec) {
    const v = values[f.name] ?? '';
    const field = el(`<div class="field"><label>${f.label}${f.required?' *':''}</label></div>`);
    let input;
    if (f.type === 'textarea') input = el(`<textarea name="${f.name}" placeholder="${f.placeholder||''}">${v}</textarea>`);
    else if (f.type === 'select') input = el(`<select name="${f.name}">${
        ['<option value="">—</option>', ...f.options.map(o =>
          `<option value="${o}" ${o===v?'selected':''}>${o}</option>`)].join('')}</select>`);
    else if (f.type === 'photo') {
      input = el(`<div></div>`);
      const img = el(`<img alt="" style="${v?'':'display:none'};max-width:96px;border-radius:var(--r-md);margin-bottom:8px" src="${v||''}">`);
      const file = el(`<input type="file" accept="image/*" name="${f.name}">`);
      const hidden = el(`<input type="hidden" name="${f.name}" value="${v||''}">`);
      file.onchange = async () => {
        const file0 = file.files[0]; if (!file0) return;
        const data = await readImageResized(file0);
        hidden.value = data; img.src = data; img.style.display = '';
      };
      input.append(img, file, hidden);
    }
    else input = el(`<input type="${f.type||'text'}" name="${f.name}" value="${v}" placeholder="${f.placeholder||''}" ${f.required?'required':''}>`);
    field.appendChild(input);
    form.appendChild(field);
  }
  return {
    form,
    getValues() {
      const out = {};
      for (const f of spec) {
        const node = form.querySelector(`[name="${f.name}"]${f.type==='photo'?'[type=hidden]':''}`);
        out[f.name] = node ? node.value : '';
      }
      return out;
    }
  };
}

/* Redimensiona imagem para no máx 800px e devolve dataURL JPEG (economia de espaço) */
export function readImageResized(file, max = 800) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
export { icon };
```

- [ ] **Step 2: Verificação rápida no console**

Run: no console do app: `const ui = await import('./js/ui.js'); ui.toast('olá'); await ui.confirmDialog('Testar?')`
Expected: aparece o toast "olá"; o diálogo abre e retorna `true`/`false` conforme o clique.

- [ ] **Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat: helpers de UI (el, fieldForm, toast, confirmDialog)"
```

---

# FASE B — Pet e Tutor

### Task 7: Seletor de pet (header) + perfil/CRUD de pet

**Files:**
- Create: `js/components/petSwitcher.js`
- Modify: `js/views/pet.js`, `js/app.js` (renderizar o switcher após cada navegação)

- [ ] **Step 1: Criar `js/components/petSwitcher.js`**

```js
import * as db from '../db.js';
import { getCurrentPetId, setCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';

export async function renderSwitcher() {
  const host = document.getElementById('pet-switcher');
  if (!host) return;
  const pets = await db.getAll('pets');
  let current = getCurrentPetId();
  if (pets.length && !pets.some(p => p.id === current)) { current = pets[0].id; setCurrentPetId(current); }
  if (!pets.length) {
    host.innerHTML = `<a class="fab-add" href="#/pet/novo">${icon('plus')} Pet</a>`;
    return;
  }
  const sel = el(`<select aria-label="Selecionar pet" style="border:1px solid var(--line);border-radius:var(--r-pill);padding:6px 12px;font-size:14px;background:var(--surface)">${
    pets.map(p => `<option value="${p.id}" ${p.id===current?'selected':''}>${p.nome}</option>`).join('')
  }</select>`);
  sel.onchange = () => { setCurrentPetId(Number(sel.value)); location.reload(); };
  host.innerHTML = '';
  host.append(sel);
}
```

- [ ] **Step 2: Chamar o switcher no router** — em `js/app.js`, importar e chamar dentro de `render()` após `setActive(path)`:

```js
import { renderSwitcher } from './components/petSwitcher.js';
```
e dentro de `render()`:
```js
  setActive(path);
  await renderSwitcher();
  window.scrollTo(0, 0);
```

- [ ] **Step 3: Implementar `js/views/pet.js`** (lista, criar, editar, excluir)

```js
import * as db from '../db.js';
import { getCurrentPetId, setCurrentPetId } from '../state.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { ageString, formatBR, todayISO } from '../dates.js';

const SPEC = [
  { name:'nome', label:'Nome', required:true },
  { name:'especie', label:'Espécie', type:'select', options:['Cão','Gato','Ave','Roedor','Réptil','Outro'], required:true },
  { name:'sexo', label:'Sexo', type:'select', options:['Macho','Fêmea'] },
  { name:'nascimento', label:'Data de nascimento', type:'date' },
  { name:'idadeAprox', label:'Idade aproximada (se não souber a data)', placeholder:'ex.: 2 anos' },
  { name:'raca', label:'Raça' },
  { name:'porte', label:'Porte', type:'select', options:['Pequeno','Médio','Grande'] },
  { name:'cor', label:'Cor' },
  { name:'foto', label:'Foto', type:'photo' },
  { name:'comportamento', label:'Comportamento', type:'textarea' },
  { name:'preferencias', label:'Preferências', type:'textarea' },
  { name:'restricoes', label:'Restrições', type:'textarea' }
];

export async function render(outlet, params) {
  const [arg] = params;
  if (arg === 'novo') return form(outlet, null);
  if (arg) return form(outlet, Number(arg));
  return list(outlet);
}

async function list(outlet) {
  const pets = await db.getAll('pets');
  const box = el('<div></div>');
  box.append(el(`<div class="card-row" style="margin-bottom:var(--sp-4)">
    <h1>Meus pets</h1>
    <a class="btn primary" style="margin-left:auto" href="#/pet/novo">${icon('plus')} Novo</a></div>`));
  if (!pets.length) {
    box.append(el(`<div class="empty">${icon('paw')}<p>Nenhum pet ainda.<br>Cadastre o primeiro!</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
  } else {
    for (const p of pets) {
      const sub = p.nascimento ? ageString(p.nascimento, todayISO()) : (p.idadeAprox || '');
      const row = el(`<div class="card card-row">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--teal-50);overflow:hidden;display:flex;align-items:center;justify-content:center;color:var(--teal-400)">
          ${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover">` : icon('paw')}</div>
        <div class="rec-main"><div class="t">${p.nome}</div><div class="s">${[p.especie,p.raca,sub].filter(Boolean).join(' · ')}</div></div>
        <a class="icon-btn" href="#/pet/${p.id}">${icon('edit')}</a>
        <button class="icon-btn" data-del>${icon('trash')}</button></div>`);
      row.querySelector('[data-del]').onclick = async () => {
        if (await confirmDialog(`Excluir ${p.nome} e todo o histórico?`)) {
          await db.remove('pets', p.id);
          toast('Pet excluído'); list(outlet);
        }
      };
      box.append(row);
    }
  }
  outlet.innerHTML=''; outlet.append(box);
}

async function form(outlet, id) {
  const pet = id ? await db.get('pets', id) : {};
  const { form, getValues } = fieldForm(SPEC, pet);
  const wrap = el(`<div><div class="card-row" style="margin-bottom:var(--sp-4)">
    <a class="icon-btn" href="#/pet">${icon('x')}</a><h1>${id?'Editar pet':'Novo pet'}</h1></div></div>`);
  const card = el('<div class="card"></div>'); card.append(form);
  form.append(el(`<div class="form-actions">
    <a class="btn block" href="#/pet">Cancelar</a>
    <button class="btn primary block" type="submit">Salvar</button></div>`));
  form.onsubmit = async e => {
    e.preventDefault();
    const v = getValues();
    if (!v.nome || !v.especie) { toast('Nome e espécie são obrigatórios'); return; }
    const saved = { ...pet, ...v };
    const newId = await db.put('pets', saved);
    if (!id) setCurrentPetId(newId);
    toast('Salvo'); location.hash = '#/pet';
  };
  wrap.append(card); outlet.innerHTML=''; outlet.append(wrap);
}
```

- [ ] **Step 4: Verificar no navegador**

Run: abrir o app. Clicar em "Pet"/novo, cadastrar "Thor" (Cão), salvar.
Expected: aparece na lista; o seletor no header mostra "Thor"; editar altera dados; excluir pede confirmação e remove; recarregar mantém os dados (persistência).

- [ ] **Step 5: Commit**

```bash
git add js/components/petSwitcher.js js/views/pet.js js/app.js
git commit -m "feat: perfil/CRUD de pet e seletor de pet no header"
```

---

### Task 8: Cadastro do tutor

**Files:**
- Modify: `js/views/tutor.js`

- [ ] **Step 1: Implementar `js/views/tutor.js`**

```js
import * as db from '../db.js';
import { el, fieldForm, icon, toast } from '../ui.js';

const SPEC = [
  { name:'nome', label:'Nome do tutor' },
  { name:'telefone', label:'Telefone', type:'tel' },
  { name:'email', label:'E-mail', type:'email' },
  { name:'endereco', label:'Endereço (opcional)', type:'textarea' }
];

export async function render(outlet) {
  const tutor = (await db.get('tutor', 'tutor')) || { id:'tutor' };
  const { form, getValues } = fieldForm(SPEC, tutor);
  const wrap = el(`<div><div class="card-row" style="margin-bottom:var(--sp-4)">
    <a class="icon-btn" href="#/inicio">${icon('x')}</a><h1>Dados do tutor</h1></div></div>`);
  const card = el('<div class="card"></div>'); card.append(form);
  form.append(el(`<div class="form-actions"><button class="btn primary block" type="submit">Salvar</button></div>`));
  form.onsubmit = async e => {
    e.preventDefault();
    await db.put('tutor', { id:'tutor', ...getValues() });
    toast('Dados salvos'); location.hash = '#/inicio';
  };
  wrap.append(card); outlet.innerHTML=''; outlet.append(wrap);
}
```

- [ ] **Step 2: Verificar e commitar**

Run: navegar para `#/tutor`, preencher e salvar; reabrir mostra os dados.
Expected: dados persistem.

```bash
git add js/views/tutor.js
git commit -m "feat: cadastro do tutor"
```

---

# FASE C — Saúde

### Task 9: Componentes accordion + recordSection (config-driven)

Este é o motor que evita repetir CRUD em cada seção de saúde.

**Files:**
- Create: `js/components/accordion.js`, `js/components/recordSection.js`

- [ ] **Step 1: Criar `js/components/accordion.js`**

```js
import { el, icon } from '../ui.js';

export function accordionItem({ title, iconName, body, open=false }) {
  const item = el(`<div class="acc-item ${open?'open':''}">
    <button class="acc-head"><span class="acc-ico">${icon(iconName)}</span>${title}
      <span class="chev">${icon('chevron')}</span></button>
    <div class="acc-body"></div></div>`);
  item.querySelector('.acc-body').append(body);
  item.querySelector('.acc-head').onclick = () => item.classList.toggle('open');
  return item;
}
```

- [ ] **Step 2: Criar `js/components/recordSection.js`**

```js
import * as db from '../db.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { accordionItem } from './accordion.js';
import { formatBR } from '../dates.js';

/* config: { store, title, icon, fields:[spec], line:(r)=>({t,s}) } */
export function recordSection(config, petId) {
  const body = el('<div></div>');
  reload();
  return accordionItem({ title: config.title, iconName: config.icon, body });

  async function reload() {
    const items = await db.getAll(config.store, petId);
    body.innerHTML = '';
    if (!items.length) body.append(el(`<div class="empty" style="padding:var(--sp-4)"><p>Nada registrado ainda.</p></div>`));
    for (const r of items) {
      const { t, s } = config.line(r);
      const row = el(`<div class="rec"><div class="rec-main"><div class="t">${t}</div><div class="s">${s||''}</div></div>
        <div class="rec-actions"><button class="icon-btn" data-edit>${icon('edit')}</button>
        <button class="icon-btn" data-del>${icon('trash')}</button></div></div>`);
      row.querySelector('[data-edit]').onclick = () => openForm(r);
      row.querySelector('[data-del]').onclick = async () => {
        if (await confirmDialog('Excluir este registro?')) { await db.remove(config.store, r.id); toast('Excluído'); reload(); }
      };
      body.append(row);
    }
    const addBtn = el(`<button class="fab-add" style="margin-top:var(--sp-2)">${icon('plus')} ${config.add||'Adicionar'}</button>`);
    addBtn.onclick = () => openForm(null);
    body.append(addBtn);
  }

  function openForm(record) {
    const { form, getValues } = fieldForm(config.fields, record || {});
    const scrim = el(`<div class="scrim"><div class="sheet">
      <h2 style="margin:0 0 var(--sp-4)">${record?'Editar':config.add||'Adicionar'}</h2></div></div>`);
    const sheet = scrim.querySelector('.sheet');
    sheet.append(form);
    form.append(el(`<div class="form-actions">
      <button type="button" class="btn block" data-cancel>Cancelar</button>
      <button type="submit" class="btn primary block">Salvar</button></div>`));
    form.querySelector('[data-cancel]').onclick = () => scrim.remove();
    scrim.onclick = e => { if (e.target === scrim) scrim.remove(); };
    form.onsubmit = async e => {
      e.preventDefault();
      await db.put(config.store, { ...(record||{}), petId, ...getValues() });
      scrim.remove(); toast('Salvo'); reload();
    };
    document.body.append(scrim);
  }
}
export { formatBR };
```

- [ ] **Step 3: Commit** (verificação acontece na Task 10, que usa o componente)

```bash
git add js/components/accordion.js js/components/recordSection.js
git commit -m "feat: componentes accordion e recordSection (CRUD config-driven)"
```

---

### Task 10: View de Saúde (todas as seções)

**Files:**
- Modify: `js/views/saude.js`

- [ ] **Step 1: Implementar `js/views/saude.js`** (configs de cada seção + saúde geral + pesos + exportar)

```js
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
```

- [ ] **Step 2: Verificar no navegador**

Run: com um pet selecionado, abrir "Saúde".
Expected: acordeão com Saúde geral (aberta), Peso, Vacinas, Vermífugo, Consultas, Cirurgias, Exames. Adicionar uma vacina com próxima dose; editar; excluir; tudo persiste. Registrar dois pesos. Clicar "PDF" abre a janela de impressão com tudo expandido (e sem header/nav).

- [ ] **Step 3: Commit**

```bash
git add js/views/saude.js
git commit -m "feat: view de saude (vacinas, vermifugo, consultas, cirurgias, exames, peso) + exportar PDF"
```

---

### Task 11: Gráfico de peso (SVG)

**Files:**
- Create: `js/components/chart.js`

- [ ] **Step 1: Criar `js/components/chart.js`**

```js
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
```

- [ ] **Step 2: Commit** (usado e verificado no dashboard, Task 15)

```bash
git add js/components/chart.js
git commit -m "feat: grafico de peso em SVG"
```

---

# FASE D — Alertas

### Task 12: Lógica de alertas (PURO, TDD)

**Files:**
- Create: `js/alerts.js`
- Test: `tests/alerts.test.js`

- [ ] **Step 1: Escrever os testes** — `tests/alerts.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, scheduledItems, buildAlerts, overallStatus } from '../js/alerts.js';

test('classify por dias restantes', () => {
  assert.equal(classify(-1), 'overdue');
  assert.equal(classify(3), 'warn');
  assert.equal(classify(7), 'warn');
  assert.equal(classify(8), 'ok');
  assert.equal(classify(null), null);
});
test('scheduledItems extrai proximas datas de vacinas e vermifugos', () => {
  const data = { vacinas:[{ id:1, nome:'V8', proximaDose:'2026-06-20' }, { id:2, nome:'Raiva' }],
                 vermifugos:[{ id:9, produto:'X', proximaAplicacao:'2026-07-01' }] };
  const items = scheduledItems(data);
  assert.equal(items.length, 2);
  assert.equal(items[0].titulo, 'Vacina: V8');
});
test('buildAlerts filtra e ordena por urgência', () => {
  const data = { vacinas:[{ id:1, nome:'V8', proximaDose:'2026-06-12' }, { id:2, nome:'Gripe', proximaDose:'2026-06-18' }],
                 vermifugos:[{ id:3, produto:'Y', proximaAplicacao:'2026-09-01' }] };
  const a = buildAlerts(data, '2026-06-14');
  assert.equal(a.length, 2);            // o de set/2026 fica fora (ok)
  assert.equal(a[0].status, 'overdue'); // vencido vem primeiro
  assert.equal(a[1].status, 'warn');
});
test('overallStatus retorna o pior status', () => {
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-06-10' }] }, '2026-06-14'), 'overdue');
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-06-18' }] }, '2026-06-14'), 'warn');
  assert.equal(overallStatus({ vacinas:[{ id:1, nome:'V', proximaDose:'2026-12-01' }] }, '2026-06-14'), 'ok');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test`
Expected: FALHA (`Cannot find module ../js/alerts.js`).

- [ ] **Step 3: Implementar `js/alerts.js`**

```js
import { daysUntil } from './dates.js';

export function classify(d) {
  if (d == null || Number.isNaN(d)) return null;
  if (d < 0) return 'overdue';
  if (d <= 7) return 'warn';
  return 'ok';
}
export function scheduledItems(data) {
  const items = [];
  for (const v of data.vacinas || []) if (v.proximaDose)
    items.push({ tipo:'vacina', titulo:`Vacina: ${v.nome || ''}`.trim(), dateISO:v.proximaDose, petId:v.petId, refId:v.id });
  for (const v of data.vermifugos || []) if (v.proximaAplicacao)
    items.push({ tipo:'vermifugo', titulo:`Vermífugo: ${v.produto || ''}`.trim(), dateISO:v.proximaAplicacao, petId:v.petId, refId:v.id });
  return items;
}
export function buildAlerts(data, today) {
  return scheduledItems(data)
    .map(it => { const d = daysUntil(it.dateISO, today); return { ...it, daysUntil:d, status:classify(d) }; })
    .filter(it => it.status === 'warn' || it.status === 'overdue')
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
export function overallStatus(data, today) {
  const st = scheduledItems(data).map(it => classify(daysUntil(it.dateISO, today)));
  if (st.includes('overdue')) return 'overdue';
  if (st.includes('warn')) return 'warn';
  return 'ok';
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test`
Expected: todos os testes PASSAM (dates + alerts).

- [ ] **Step 5: Commit**

```bash
git add js/alerts.js tests/alerts.test.js
git commit -m "feat: logica de alertas com testes (alerts.js)"
```

---

### Task 13: View de Alertas + badge na navegação + notificações

**Files:**
- Modify: `js/views/alertas.js`, `js/app.js`
- Create: `js/notify.js`

- [ ] **Step 1: Criar helper de dados de alertas reutilizável** — adicionar ao final de `js/alerts.js`:

```js
export async function loadAlerts(db, petId, today) {
  const [vacinas, vermifugos] = await Promise.all([db.getAll('vacinas', petId), db.getAll('vermifugos', petId)]);
  return buildAlerts({ vacinas, vermifugos }, today);
}
```

- [ ] **Step 2: Criar `js/notify.js`**

```js
const KEY = 'petapp.lastNotify';
export async function maybeNotify(alerts) {
  if (!('Notification' in window) || !alerts.length) return;
  if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
  if (Notification.permission !== 'granted') return;
  const today = new Date().toISOString().slice(0,10);
  if (localStorage.getItem(KEY) === today) return;   // 1x por dia
  localStorage.setItem(KEY, today);
  const due = alerts.filter(a => a.status === 'overdue').length;
  const body = due ? `${due} item(ns) vencido(s) e ${alerts.length-due} próximo(s)` : `${alerts.length} alerta(s) próximo(s)`;
  new Notification('PetApp — cuidados pendentes', { body });
}
```

- [ ] **Step 3: Implementar `js/views/alertas.js`**

```js
import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';
import { loadAlerts } from '../alerts.js';
import { formatBR, todayISO } from '../dates.js';

const LABEL = { overdue:['late','Atrasado'], warn:['warn','Em breve'] };

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  outlet.append(el('<h1 style="margin-bottom:var(--sp-4)">Alertas</h1>'));
  if (!petId) { outlet.append(el(`<div class="empty">${icon('paw')}<p>Cadastre um pet primeiro.</p></div>`)); return; }
  const alerts = await loadAlerts(db, petId, todayISO());
  if (!alerts.length) {
    outlet.append(el(`<div class="empty">${icon('check')}<p>Tudo em dia! 🎉<br>Nenhum cuidado pendente.</p></div>`));
    return;
  }
  for (const a of alerts) {
    const [cls, txt] = LABEL[a.status];
    const when = a.daysUntil < 0 ? `${-a.daysUntil} dia(s) atrás` : (a.daysUntil === 0 ? 'hoje' : `em ${a.daysUntil} dia(s)`);
    outlet.append(el(`<div class="card card-row">
      <span class="acc-ico">${icon(a.tipo==='vacina'?'syringe':'pill')}</span>
      <div class="rec-main"><div class="t">${a.titulo}</div>
        <div class="s">${formatBR(a.dateISO)} · ${when}</div></div>
      <span class="pill ${cls}">${txt}</span></div>`));
  }
}
```

- [ ] **Step 4: Badge na navegação + notificação** — em `js/app.js`, adicionar imports e uma função `updateBadge`, chamada dentro de `render()`:

```js
import * as db from './db.js';
import { getCurrentPetId } from './state.js';
import { loadAlerts } from './alerts.js';
import { todayISO } from './dates.js';
import { maybeNotify } from './notify.js';
```
Adicionar função:
```js
async function updateBadge() {
  const link = document.querySelector('#nav a[data-path="alertas"]');
  const petId = getCurrentPetId();
  link.querySelector('.badge')?.remove();
  if (!petId) return;
  const alerts = await loadAlerts(db, petId, todayISO());
  if (alerts.length) {
    const b = document.createElement('span'); b.className = 'badge'; b.textContent = alerts.length;
    link.appendChild(b);
  }
  return alerts;
}
```
E em `render()`, após `await renderSwitcher();`:
```js
  const alerts = await updateBadge();
  if (alerts) maybeNotify(alerts);
```

- [ ] **Step 5: Verificar no navegador**

Run: criar uma vacina com "próxima dose" para ontem e outra para daqui a 3 dias.
Expected: a aba "Alertas" mostra os dois (vencido primeiro, com pílulas Atrasado/Em breve); badge vermelho com "2" no ícone de Alertas; na primeira visita o navegador pede permissão de notificação e, concedida, mostra uma notificação (1x/dia). Sem pendências → estado "Tudo em dia".

- [ ] **Step 6: Commit**

```bash
git add js/views/alertas.js js/app.js js/notify.js js/alerts.js
git commit -m "feat: view de alertas, badge na nav e notificacoes do navegador"
```

---

# FASE E — Rotina

### Task 14: Rotina diária (itens recorrentes + checklist)

**Files:**
- Modify: `js/views/rotina.js`

- [ ] **Step 1: Implementar `js/views/rotina.js`**

```js
import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, fieldForm, icon, toast, confirmDialog } from '../ui.js';
import { todayISO } from '../dates.js';

const SPEC = [
  { name:'titulo', label:'Item', required:true, placeholder:'ex.: Ração da manhã' },
  { name:'tipo', label:'Tipo', type:'select', options:['Alimentação','Passeio','Medicamento','Outro'] },
  { name:'horario', label:'Horário', placeholder:'ex.: 08:00' }
];

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  if (!petId) { outlet.append(el(`<div class="empty">${icon('paw')}<p>Cadastre um pet primeiro.</p></div>`)); return; }
  await draw(outlet, petId);
}

async function draw(outlet, petId) {
  const hoje = todayISO();
  const [itens, logs] = await Promise.all([db.getAll('rotina', petId), db.getAll('rotinaLog', petId)]);
  const feitos = new Set(logs.filter(l => l.data === hoje).map(l => l.rotinaId));
  outlet.innerHTML = '';
  const total = itens.length, done = itens.filter(i => feitos.has(i.id)).length;

  outlet.append(el(`<div class="card-row" style="margin-bottom:var(--sp-4)"><h1>Rotina de hoje</h1></div>`));
  if (total) outlet.append(el(`<div class="card"><div class="s" style="margin-bottom:8px">Hoje: ${done}/${total} concluído(s)</div>
    <div style="height:8px;background:var(--teal-50);border-radius:var(--r-pill);overflow:hidden">
      <div style="height:100%;width:${total?Math.round(done/total*100):0}%;background:var(--teal-400)"></div></div></div>`));

  if (!itens.length) outlet.append(el(`<div class="empty"><p>Nenhum item de rotina ainda.</p></div>`));
  for (const it of itens) {
    const isDone = feitos.has(it.id);
    const row = el(`<div class="check-row ${isDone?'done':''}">
      <span class="box">${icon('check')}</span>
      <div class="rec-main"><div class="t">${it.titulo}</div>
        <div class="s">${[it.tipo, it.horario].filter(Boolean).join(' · ')}</div></div>
      <button class="icon-btn no-print" data-del>${icon('trash')}</button></div>`);
    row.onclick = async e => {
      if (e.target.closest('[data-del]')) {
        if (await confirmDialog('Remover este item da rotina?')) { await db.remove('rotina', it.id); draw(outlet, petId); }
        return;
      }
      if (isDone) { const log = logs.find(l => l.rotinaId === it.id && l.data === hoje); if (log) await db.remove('rotinaLog', log.id); }
      else { await db.put('rotinaLog', { petId, rotinaId: it.id, data: hoje }); }
      draw(outlet, petId);
    };
    outlet.append(row);
  }

  const { form, getValues } = fieldForm(SPEC, {});
  form.append(el(`<button class="fab-add no-print" style="margin-top:var(--sp-3)">${icon('plus')} Adicionar item</button>`));
  form.onsubmit = async e => { e.preventDefault(); const v = getValues();
    if (!v.titulo) return; await db.put('rotina', { petId, ...v }); toast('Item adicionado'); draw(outlet, petId); };
  outlet.append(form);
}
```

- [ ] **Step 2: Verificar no navegador**

Run: na aba "Rotina", adicionar "Ração da manhã" e "Passeio". Marcar um como feito.
Expected: barra de progresso atualiza (ex.: 1/2); item marcado fica destacado em verde com check; desmarcar volta; recarregar a página mantém o estado do dia; remover item pede confirmação.

- [ ] **Step 3: Commit**

```bash
git add js/views/rotina.js
git commit -m "feat: rotina diaria (itens recorrentes + checklist do dia)"
```

---

# FASE F — Dash Pet

### Task 15: Tela inicial (Dash Pet)

**Files:**
- Modify: `js/views/inicio.js`

- [ ] **Step 1: Implementar `js/views/inicio.js`**

```js
import * as db from '../db.js';
import { getCurrentPetId } from '../state.js';
import { el, icon } from '../ui.js';
import { overallStatus, loadAlerts } from '../alerts.js';
import { weightChart } from '../components/chart.js';
import { ageString, formatBR, todayISO } from '../dates.js';

const STATUS = { ok:['ok','Tudo em dia','check'], warn:['warn','Atenção','bell'], overdue:['late','Atrasado','bell'] };

export async function render(outlet) {
  const petId = getCurrentPetId();
  outlet.innerHTML = '';
  if (!petId) {
    outlet.append(el(`<div class="empty">${icon('paw')}
      <p>Bem-vindo ao PetApp!<br>Comece cadastrando seu pet.</p>
      <a class="btn primary" href="#/pet/novo">Cadastrar pet</a></div>`));
    return;
  }
  const hoje = todayISO();
  const pet = await db.get('pets', petId);
  const [vacinas, vermifugos, pesos, rotina, logs] = await Promise.all([
    db.getAll('vacinas', petId), db.getAll('vermifugos', petId), db.getAll('pesos', petId),
    db.getAll('rotina', petId), db.getAll('rotinaLog', petId)]);

  // Cabeçalho do pet
  const sub = pet.nascimento ? ageString(pet.nascimento, hoje) : (pet.idadeAprox || '');
  outlet.append(el(`<div class="card card-row">
    <div style="width:56px;height:56px;border-radius:50%;background:var(--teal-50);overflow:hidden;display:flex;align-items:center;justify-content:center;color:var(--teal-400)">
      ${pet.foto?`<img src="${pet.foto}" style="width:100%;height:100%;object-fit:cover">`:icon('paw')}</div>
    <div class="rec-main"><h2>${pet.nome}</h2><div class="s">${[pet.especie,pet.raca,sub].filter(Boolean).join(' · ')}</div></div>
    <a class="icon-btn" href="#/pet/${pet.id}">${icon('edit')}</a></div>`));

  // Status
  const [scls, stxt, sico] = STATUS[overallStatus({ vacinas, vermifugos }, hoje)];
  const alerts = await loadAlerts(db, petId, hoje);
  outlet.append(el(`<div class="card"><div class="s" style="margin-bottom:8px">Status de saúde</div>
    <span class="pill ${scls}">${icon(sico)} ${stxt}</span></div>`));

  // Peso
  if (pesos.length) {
    const ord = pesos.slice().sort((a,b)=>a.data.localeCompare(b.data));
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Peso</div><strong style="margin-left:auto">${ord[ord.length-1].valor} kg</strong></div>
      ${weightChart(ord)}</div>`));
  }

  // Rotina de hoje
  const feitos = new Set(logs.filter(l=>l.data===hoje).map(l=>l.rotinaId));
  if (rotina.length) {
    const lines = rotina.map(i => `<div class="card-row" style="padding:4px 0">
      <span style="color:${feitos.has(i.id)?'var(--teal-600)':'var(--text-3)'}">${icon(feitos.has(i.id)?'check':'clock')}</span>
      <span style="${feitos.has(i.id)?'':'color:var(--text-2)'}">${i.titulo}</span></div>`).join('');
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Rotina de hoje</div><a class="btn ghost" style="margin-left:auto" href="#/rotina">Ver</a></div>${lines}</div>`));
  }

  // Próximos alertas
  if (alerts.length) {
    const items = alerts.slice(0,3).map(a => `<div class="card-row" style="padding:4px 0">
      <span class="pill ${a.status==='overdue'?'late':'warn'}">${a.status==='overdue'?'Atrasado':formatBR(a.dateISO)}</span>
      <span>${a.titulo}</span></div>`).join('');
    outlet.append(el(`<div class="card"><div class="card-row" style="margin-bottom:8px">
      <div class="s">Próximos cuidados</div><a class="btn ghost" style="margin-left:auto" href="#/alertas">Ver todos</a></div>${items}</div>`));
  }

  // Atalho tutor
  outlet.append(el(`<a class="btn block no-print" href="#/tutor">${icon('user')} Dados do tutor</a>`));
}
```

- [ ] **Step 2: Verificar no navegador**

Run: abrir "Início" com um pet que tenha pesos, rotina e uma vacina vencida.
Expected: cartão do pet com idade, pílula de status (Atrasado/Atenção/Tudo em dia), mini-gráfico de peso com o valor atual, resumo da rotina de hoje e lista dos próximos cuidados; botão para dados do tutor. Sem pet → tela de boas-vindas com CTA.

- [ ] **Step 3: Commit**

```bash
git add js/views/inicio.js
git commit -m "feat: tela inicial Dash Pet (status, peso, rotina, proximos cuidados)"
```

---

# FASE G — Backup

### Task 16: Exportar/importar backup

**Files:**
- Create: `js/backup.js`
- Modify: `js/views/tutor.js` (botões de backup) ou `js/views/inicio.js`

- [ ] **Step 1: Criar `js/backup.js`**

```js
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
```

- [ ] **Step 2: Adicionar botões em `js/views/tutor.js`** — antes do `wrap.append(card)`, inserir um cartão de backup:

```js
import { exportData, importData } from '../backup.js';
```
e:
```js
  const bkp = el(`<div class="card"><h3 style="margin-bottom:var(--sp-3)">Backup dos dados</h3>
    <p class="s" style="margin-top:0">Seus dados ficam neste navegador. Exporte um backup para guardar ou levar para outro aparelho.</p>
    <div class="form-actions">
      <button class="btn block" data-exp>${icon('download')} Exportar</button>
      <label class="btn block" style="cursor:pointer">${icon('upload')} Importar
        <input type="file" accept="application/json" data-imp hidden></label>
    </div></div>`);
  bkp.querySelector('[data-exp]').onclick = () => exportData();
  bkp.querySelector('[data-imp]').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { await importData(f); toast('Backup importado'); location.reload(); }
    catch { toast('Arquivo inválido'); }
  };
```
e renderizar `bkp` (ex.: `wrap.append(bkp)`) depois do card do formulário.

- [ ] **Step 3: Verificar no navegador**

Run: em `#/tutor`, clicar "Exportar" → baixa `petapp-backup-AAAA-MM-DD.json`. Abrir o arquivo e conferir que contém os stores. Excluir um pet, depois "Importar" o backup.
Expected: o download contém todos os dados; após importar, o pet excluído volta (estado restaurado).

- [ ] **Step 4: Commit**

```bash
git add js/backup.js js/views/tutor.js
git commit -m "feat: exportar/importar backup em JSON"
```

---

# FASE H — PWA e deploy

### Task 17: Manifest e ícones do PWA

**Files:**
- Create: `manifest.json`, `icons/icon-192.png`, `icons/icon-512.png`

- [ ] **Step 1: Gerar os ícones** — criar `gen-icons.js` na raiz (gerador de PNG sólido verde-água, sem dependências, usando o `zlib` nativo) e rodar:

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) { let c = ~0; for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; } return ~c >>> 0; }
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const row = Buffer.alloc(1 + size * 3); // row[0]=0 => filtro "none"
  for (let x = 0; x < size; x++) { row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b; }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
mkdirSync('icons', { recursive: true });
writeFileSync('icons/icon-192.png', png(192, [15, 110, 86]));
writeFileSync('icons/icon-512.png', png(512, [15, 110, 86]));
console.log('icones gerados em icons/');
```

Run: `node gen-icons.js`
Expected: cria `icons/icon-192.png` e `icons/icon-512.png` (quadrados verde-água `#0F6E56`). São placeholders válidos; o usuário pode trocar por uma arte com a pata depois.

- [ ] **Step 2: Criar `manifest.json`**

```json
{
  "name": "PetApp",
  "short_name": "PetApp",
  "description": "Saúde e rotina do seu pet, no seu bolso.",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#F7F9F8",
  "theme_color": "#0F6E56",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Verificar e commitar**

Run: abrir o app, DevTools → Application → Manifest.
Expected: o manifest carrega sem erros, mostra nome, cores e os dois ícones.

```bash
git add manifest.json icons/
git commit -m "feat: manifest e icones do PWA"
```

---

### Task 18: Service worker (offline)

**Files:**
- Create: `sw.js`

- [ ] **Step 1: Criar `sw.js`** (cache do app-shell; o registro já existe na Task 3)

```js
const CACHE = 'petapp-v1';
const ASSETS = [
  './', './index.html', './manifest.json', './css/styles.css',
  './js/app.js', './js/state.js', './js/db.js', './js/dates.js', './js/alerts.js',
  './js/backup.js', './js/icons.js', './js/ui.js', './js/notify.js',
  './js/components/accordion.js', './js/components/recordSection.js',
  './js/components/chart.js', './js/components/petSwitcher.js',
  './js/views/inicio.js', './js/views/saude.js', './js/views/rotina.js',
  './js/views/alertas.js', './js/views/pet.js', './js/views/tutor.js',
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

- [ ] **Step 2: Verificar offline**

Run: carregar o app uma vez (online). DevTools → Application → Service Workers (ativo). Marcar "Offline" e recarregar; navegar entre abas; recarregar a página.
Expected: o app continua funcionando offline (app-shell em cache); dados do IndexedDB intactos.

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "feat: service worker para funcionamento offline"
```

---

### Task 19: Deploy no GitHub Pages

**Files:**
- Create: `.nojekyll`
- Modify: `README.md` (instruções de deploy)

- [ ] **Step 1: Garantir caminhos relativos** — conferir que `index.html`, `manifest.json` e `sw.js` usam caminhos relativos (`css/...`, `js/...`, `./`), sem barra inicial. (Já estão assim neste plano — isso é necessário para funcionar em `usuario.github.io/<repo>/`.)

- [ ] **Step 2: Criar `.nojekyll`** (impede o GitHub Pages de processar como Jekyll)

```
```
(arquivo vazio)

- [ ] **Step 3: Adicionar instruções ao `README.md`**

```markdown
## Deploy (GitHub Pages)
1. Crie um repositório no GitHub e envie o código:
   `git remote add origin https://github.com/<usuario>/<repo>.git`
   `git push -u origin main`
2. No GitHub: Settings → Pages → Source: "Deploy from a branch" → branch `main` / pasta `/ (root)`.
3. Acesse `https://<usuario>.github.io/<repo>/`.

Como o app é estático, não há build. Cada `git push` atualiza o site.
Após publicar uma nova versão, suba o número do cache em `sw.js` (`petapp-v1` → `petapp-v2`)
para forçar a atualização do service worker.
```

- [ ] **Step 4: Verificação final local + commit**

Run: `python -m http.server 8080` e um passo-a-passo completo: criar pet, adicionar vacina vencida, registrar peso e rotina, ver dashboard, ver alertas, exportar backup, testar offline.
Expected: todo o fluxo funciona; `node --test` passa (dates + alerts).

```bash
git add .nojekyll README.md
git commit -m "chore: preparar deploy no GitHub Pages (.nojekyll + instrucoes)"
```

- [ ] **Step 5 (manual pelo usuário): publicar** — criar o repositório no GitHub, `git push`, e ativar o GitHub Pages conforme o README. (Requer a conta do usuário; não é automatizável aqui.)

---

## Self-Review (cobertura da spec)

- **Dados locais + backup** → Tasks 4, 16 ✓
- **4 pilares:** Saúde (10–11), Alertas (12–13), Dash Pet (15), Rotina (14) ✓
- **CRUD de pet/tutor** → Tasks 7, 8 ✓
- **Modelo de dados completo** (pets, tutor, pesos, saude, vacinas, vermifugos, consultas, cirurgias, exames, rotina, rotinaLog) → Task 4 ✓
- **Exportar PDF** → Task 10 (print + window.print) ✓
- **Sistema de design / qualidade visual** → Task 2 + componentes ✓
- **PWA / offline / instalável** → Tasks 17, 18 ✓
- **Deploy GitHub Pages** → Task 19 ✓
- **Notificações do navegador** → Task 13 ✓
- **Lógica testada (dates, alerts)** → Tasks 5, 12 ✓

Consistência de tipos verificada: nomes de stores e campos (`proximaDose`, `proximaAplicacao`, `rotinaId`, `petId`) usados de forma idêntica em `db.js`, `alerts.js`, views e `sw.js`.

## Fora do MVP (não implementar agora)
Gamificação, comunidade, marketplace, IA, integração/agendamento com vet, conteúdo personalizado, adoção, login/nuvem, alertas por WhatsApp/e-mail/SMS, push com app fechado.
