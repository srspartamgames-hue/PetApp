import { iconSprite, icon } from './icons.js';
import { initTheme, toggleTheme, currentTheme } from './theme.js';
import { renderSwitcher } from './components/petSwitcher.js';
import * as inicio from './views/inicio.js';
import * as saude from './views/saude.js';
import * as rotina from './views/rotina.js';
import * as alertas from './views/alertas.js';
import * as pet from './views/pet.js';
import * as tutor from './views/tutor.js';
import * as db from './db.js';
import { getCurrentPetId } from './state.js';
import { loadAlerts } from './alerts.js';
import { todayISO } from './dates.js';
import { maybeNotify } from './notify.js';
import { seedDemo } from './demo-seed.js';

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
function paintThemeToggle() {
  const b = document.getElementById('theme-toggle');
  b.innerHTML = icon(currentTheme() === 'dark' ? 'sun' : 'moon');
}
function setActive(path) {
  document.querySelectorAll('#nav a').forEach(a =>
    a.classList.toggle('active', a.dataset.path === path));
}
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
async function render() {
  const { path, params } = parseHash();
  const view = routes[path] || routes.inicio;
  outlet.innerHTML = '';
  await view.render(outlet, params);
  setActive(path);
  await renderSwitcher();
  const alerts = await updateBadge();
  if (alerts) maybeNotify(alerts);
  window.scrollTo(0, 0);
}
async function init() {
  document.getElementById('sprite').innerHTML = iconSprite();
  initTheme();
  paintNav();
  paintThemeToggle();
  document.getElementById('theme-toggle').onclick = () => { toggleTheme(); paintThemeToggle(); };
  await seedDemo();
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', init);
